import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError as FirebaseAuthError,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

// User interface matching your existing User interface
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

// Error types for consistency with your existing error handling
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
  retryAfter?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  signup: (userData: SignupData, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getAndClearRedirect: () => string | null;
  resetPassword: (email: string) => Promise<void>;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const FirebaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

// Helper function to convert Firebase user to our User interface
const transformFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    firstName: firebaseUser.displayName?.split(' ')[0] || undefined,
    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || undefined,
    avatarUrl: firebaseUser.photoURL || undefined,
    isVerified: firebaseUser.emailVerified,
    lastLogin: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Helper function to convert Firebase auth errors to our error format
const transformFirebaseError = (firebaseError: FirebaseAuthError): AuthError => {
  let errorType: AuthErrorType;
  let message: string;

  switch (firebaseError.code) {
    case 'auth/user-not-found':
      errorType = AuthErrorType.ACCOUNT_NOT_FOUND;
      message = 'No account found with this email address.';
      break;
    case 'auth/wrong-password':
      errorType = AuthErrorType.INVALID_CREDENTIALS;
      message = 'Invalid email or password.';
      break;
    case 'auth/invalid-email':
      errorType = AuthErrorType.VALIDATION_ERROR;
      message = 'Please provide a valid email address.';
      break;
    case 'auth/weak-password':
      errorType = AuthErrorType.VALIDATION_ERROR;
      message = 'Password should be at least 6 characters.';
      break;
    case 'auth/email-already-in-use':
      errorType = AuthErrorType.VALIDATION_ERROR;
      message = 'An account with this email already exists.';
      break;
    case 'auth/too-many-requests':
      errorType = AuthErrorType.RATE_LIMITED;
      message = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      errorType = AuthErrorType.NETWORK_ERROR;
      message = 'Network error. Please check your connection.';
      break;
    default:
      errorType = AuthErrorType.UNKNOWN_ERROR;
      message = firebaseError.message || 'An unexpected error occurred.';
  }

  return {
    type: errorType,
    message,
    details: firebaseError.code
  };
};

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const isAuthenticated = !!user;

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(transformFirebaseUser(firebaseUser));
        setError(null);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, redirectTo?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = transformFirebaseUser(userCredential.user);
      
      // Store redirect destination if provided
      if (redirectTo) {
        localStorage.setItem('postLoginRedirect', redirectTo);
      }
      
      setUser(userData);
      setError(null);
    } catch (firebaseError: any) {
      const authError = transformFirebaseError(firebaseError);
      setError(authError);
      throw new Error(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData, redirectTo?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Update profile with username
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: userData.username
        });
      }
      
      const transformedUser = transformFirebaseUser(userCredential.user);
      
      // Store redirect destination if provided
      if (redirectTo) {
        localStorage.setItem('postLoginRedirect', redirectTo);
      }
      
      setUser(transformedUser);
      setError(null);
    } catch (firebaseError: any) {
      const authError = transformFirebaseError(firebaseError);
      setError(authError);
      throw new Error(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      
      // Clear all authentication-related data from localStorage
      localStorage.removeItem('postLoginRedirect');
      
      // Navigate to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (firebaseError: any) {
      const authError = transformFirebaseError(firebaseError);
      setError(authError);
      throw new Error(authError.message);
    }
  };

  // Helper function to get and clear stored redirect destination
  const getAndClearRedirect = (): string | null => {
    const redirectTo = localStorage.getItem('postLoginRedirect');
    if (redirectTo) {
      localStorage.removeItem('postLoginRedirect');
      return redirectTo;
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    getAndClearRedirect,
    resetPassword,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
