import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth, AuthErrorType } from '../contexts/AuthContext';
import React from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Test component that uses AuthContext
const TestComponent: React.FC = () => {
  const { user, isLoading, error, login, clearError } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
      <div data-testid="error-type">{error ? error.type : 'no-error-type'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('AuthContext Enhanced Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    navigator.onLine = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display loading state during authentication', async () => {
    // Mock a delayed response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              user: { id: '1', email: 'test@example.com' },
              tokens: { accessToken: 'token', refreshToken: 'refresh' }
            }
          })
        }), 100)
      )
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });
  });

  it('should handle network errors with user-friendly messages', async () => {
    // Mock network error that will be retried but eventually fail
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    navigator.onLine = false;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    // Wait for the error to be set after retries complete
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
      expect(screen.getByTestId('error-type')).toHaveTextContent(AuthErrorType.NETWORK_ERROR);
    }, { timeout: 15000 });
  }, 20000);

  it('should handle invalid credentials with appropriate error message', async () => {
    // Mock 401 response
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        message: 'Invalid credentials'
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Invalid email or password. Please check your credentials and try again.'
      );
      expect(screen.getByTestId('error-type')).toHaveTextContent(AuthErrorType.INVALID_CREDENTIALS);
    });
  });

  it('should handle rate limiting with retry information', async () => {
    // Mock 429 response with retry-after header
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      headers: {
        get: (header: string) => header === 'retry-after' ? '60' : null
      },
      json: () => Promise.resolve({
        message: 'Too many requests'
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    // Wait for the error to be set after retries complete
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Too many requests. Please wait a moment before trying again.'
      );
      expect(screen.getByTestId('error-type')).toHaveTextContent(AuthErrorType.RATE_LIMITED);
    }, { timeout: 15000 });
  }, 20000);

  it('should clear error state when clearError is called', async () => {
    // Mock error response
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    const clearErrorButton = screen.getByText('Clear Error');
    
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
    });

    clearErrorButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  it('should handle server errors with appropriate message', async () => {
    // Mock 500 response
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        message: 'Internal server error'
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    // Wait for the error to be set after retries complete
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Server is temporarily unavailable. Please try again in a few moments.'
      );
      expect(screen.getByTestId('error-type')).toHaveTextContent(AuthErrorType.SERVER_ERROR);
    }, { timeout: 15000 });
  }, 20000);
});