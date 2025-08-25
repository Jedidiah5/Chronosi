import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, AuthErrorType } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { Logo } from './Logo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || '/study-plan';

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: any) => {
    if (!error) return '';
    
    switch (error.type) {
      case AuthErrorType.NETWORK_ERROR:
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'Invalid email or password. Please check your credentials and try again.';
      case AuthErrorType.ACCOUNT_NOT_FOUND:
        return 'No account found with this email address. Please check your email or create a new account.';
      case AuthErrorType.ACCOUNT_DEACTIVATED:
        return 'Your account has been deactivated. Please contact support for assistance.';
      case AuthErrorType.VALIDATION_ERROR:
        return error.details ? 
          (Array.isArray(error.details) ? error.details.join(', ') : error.details) :
          'Please check your input and try again.';
      case AuthErrorType.RATE_LIMITED:
        const retryAfter = error.retryAfter ? Math.ceil(error.retryAfter / 1000) : 60;
        return `Too many login attempts. Please wait ${retryAfter} seconds before trying again.`;
      case AuthErrorType.SERVER_ERROR:
        return 'Server is temporarily unavailable. Please try again in a few moments.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // Helper function to determine if error is retryable
  const isRetryableError = (error: any) => {
    if (!error) return false;
    return [
      AuthErrorType.NETWORK_ERROR,
      AuthErrorType.SERVER_ERROR,
    ].includes(error.type);
  };

  // Helper function to get error icon
  const getErrorIcon = (error: any) => {
    if (!error) return null;
    
    switch (error.type) {
      case AuthErrorType.NETWORK_ERROR:
        return <Wifi className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      // Redirect to the intended destination or default to study plan
      navigate(from, { replace: true });
    } catch (err) {
      // Error is already handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  // Handle retry for network errors
  const handleRetry = async () => {
    if (!isRetryableError(error)) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
      setRetryCount(0);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">
            {from !== '/study-plan' ? 
              'Please sign in to access the requested page' : 
              'Sign in to your account to continue'
            }
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  {getErrorIcon(error)}
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium">
                      {getErrorMessage(error)}
                    </p>
                    {error.type === AuthErrorType.RATE_LIMITED && error.retryAfter && (
                      <p className="text-xs text-red-500 mt-1">
                        You can try again in {Math.ceil(error.retryAfter / 1000)} seconds.
                      </p>
                    )}
                    {isRetryableError(error) && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        disabled={isRetrying || isLoading}
                        className="mt-2 inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>{isRetrying ? 'Retrying...' : `Retry (${retryCount}/3)`}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isRetrying || (error?.type === AuthErrorType.RATE_LIMITED)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading || isRetrying ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {isRetrying ? 'Retrying...' : 'Signing in...'}
                  </span>
                </div>
              ) : error?.type === AuthErrorType.RATE_LIMITED ? (
                <span>Please wait before trying again</span>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Create a new account
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};
