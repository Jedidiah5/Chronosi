import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Specific error types for different authentication failures
export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
  retryAfter?: number; // For rate limiting
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://localhost:5000/api';

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000   // 8 seconds max
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const isAuthenticated = !!user;

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Helper function to determine error type from response
  const determineErrorType = (response: Response, error: any): AuthErrorType => {
    if (!navigator.onLine) {
      return AuthErrorType.NETWORK_ERROR;
    }

    if (response) {
      switch (response.status) {
        case 401:
          return AuthErrorType.INVALID_CREDENTIALS;
        case 403:
          return AuthErrorType.ACCOUNT_DEACTIVATED;
        case 404:
          return AuthErrorType.ACCOUNT_NOT_FOUND;
        case 422:
          return AuthErrorType.VALIDATION_ERROR;
        case 429:
          return AuthErrorType.RATE_LIMITED;
        case 500:
        case 502:
        case 503:
        case 504:
          return AuthErrorType.SERVER_ERROR;
        default:
          return AuthErrorType.UNKNOWN_ERROR;
      }
    }

    if (error?.name === 'TypeError' || error?.message?.includes('fetch')) {
      return AuthErrorType.NETWORK_ERROR;
    }

    return AuthErrorType.UNKNOWN_ERROR;
  };

  // Helper function to create AuthError from response
  const createAuthError = async (response: Response | null, error: any): Promise<AuthError> => {
    let message = 'An unexpected error occurred';
    let details = null;
    let retryAfter = undefined;

    if (response) {
      try {
        const errorData = await response.json();
        message = errorData.message || message;
        details = errorData.details || errorData.errors;
        
        // Extract retry-after header for rate limiting
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('retry-after');
          retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) * 1000 : undefined;
        }
      } catch {
        // If we can't parse the response, use default message
      }
    } else if (error?.message) {
      message = error.message;
    }

    const errorType = determineErrorType(response, error);
    
    return {
      type: errorType,
      message,
      details,
      retryAfter
    };
  };

  // Exponential backoff retry logic
  const retryWithBackoff = async <T,>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain error types
        if (error instanceof Error && error.message.includes('INVALID_CREDENTIALS')) {
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === config.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;
        
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }
    
    throw lastError;
  };

  // Enhanced fetch with error handling
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const authError = await createAuthError(response, null);
      const error = new Error(authError.message);
      (error as any).authError = authError;
      throw error;
    }

    return response;
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          await retryWithBackoff(async () => {
            const response = await authFetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });
            
            const data = await response.json();
            setUser(data.data.user);
            setError(null);
          });
        } catch (error: any) {
          console.error('Error checking auth status:', error);
          
          // Try to refresh token if the access token is invalid
          if (error.authError?.type === AuthErrorType.TOKEN_EXPIRED || 
              error.authError?.type === AuthErrorType.TOKEN_INVALID) {
            try {
              await refreshTokenInternal();
            } catch (refreshError) {
              // If refresh fails, clear tokens and set error
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setError(error.authError || {
                type: AuthErrorType.TOKEN_REFRESH_FAILED,
                message: 'Session expired. Please log in again.'
              });
            }
          } else {
            // For other errors, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setError(error.authError || {
              type: AuthErrorType.UNKNOWN_ERROR,
              message: 'Failed to verify authentication status'
            });
          }
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await retryWithBackoff(async () => {
        const response = await authFetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        const { user: userData, tokens } = data.data;

        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        setUser(userData);
        setError(null);
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const authError = error.authError || await createAuthError(null, error);
      setError(authError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await retryWithBackoff(async () => {
        const response = await authFetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        const { user: newUser, tokens } = data.data;

        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        setUser(newUser);
        setError(null);
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      const authError = error.authError || await createAuthError(null, error);
      setError(authError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Call logout endpoint if we have tokens
    if (accessToken && refreshToken) {
      try {
        await retryWithBackoff(async () => {
          await authFetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          });
        });
      } catch (error) {
        // Log error but don't prevent logout
        console.error('Logout endpoint error:', error);
      }
    }

    // Always clear local state and tokens regardless of API call success
    setUser(null);
    setError(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Internal refresh token function with retry logic
  const refreshTokenInternal = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      const error = new Error('No refresh token available');
      (error as any).authError = {
        type: AuthErrorType.TOKEN_INVALID,
        message: 'No refresh token available'
      };
      throw error;
    }

    try {
      await retryWithBackoff(async () => {
        const response = await authFetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();
        localStorage.setItem('accessToken', data.data.accessToken);
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // Clear tokens and user state on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      
      const authError = error.authError || {
        type: AuthErrorType.TOKEN_REFRESH_FAILED,
        message: 'Failed to refresh authentication token'
      };
      setError(authError);
      
      const refreshError = new Error(authError.message);
      (refreshError as any).authError = authError;
      throw refreshError;
    }
  };

  // Public refresh token function
  const refreshToken = async () => {
    await refreshTokenInternal();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
