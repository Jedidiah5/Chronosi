import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth, AuthErrorType } from '../contexts/FirebaseAuthContext';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Logo } from './Logo';

interface ValidationErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

interface FieldValidation {
  isValid: boolean;
  message?: string;
}

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [fieldTouched, setFieldTouched] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });
  
  const { signup, error: authError, isLoading, clearError, getAndClearRedirect } = useFirebaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine the redirect destination
  const getRedirectDestination = (): string => {
    // Priority order:
    // 1. Stored redirect from localStorage (from previous session or AuthContext)
    // 2. Location state from ProtectedRoute
    // 3. Default to study plan
    const storedRedirect = getAndClearRedirect();
    if (storedRedirect && storedRedirect !== '/login' && storedRedirect !== '/signup') {
      return storedRedirect;
    }
    
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login' && from !== '/signup') {
      return from;
    }
    
    return '/study-plan';
  };

  // Real-time validation functions
  const validateEmail = (email: string): FieldValidation => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true };
  };

  const validateUsername = (username: string): FieldValidation => {
    if (!username) {
      return { isValid: false, message: 'Username is required' };
    }
    if (username.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
      return { isValid: false, message: 'Username must be less than 20 characters' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    return { isValid: true };
  };

  const validatePassword = (password: string): FieldValidation => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters' };
    }
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    return { isValid: true };
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): FieldValidation => {
    if (!confirmPassword) {
      return { isValid: false, message: 'Please confirm your password' };
    }
    if (confirmPassword !== password) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true };
  };

  // Update validation errors when form data changes
  useEffect(() => {
    const errors: ValidationErrors = {};
    
    if (fieldTouched.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
      }
    }
    
    if (fieldTouched.username) {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        errors.username = usernameValidation.message;
      }
    }
    
    if (fieldTouched.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    if (fieldTouched.confirmPassword) {
      const confirmPasswordValidation = validateConfirmPassword(formData.confirmPassword, formData.password);
      if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.message;
      }
    }
    
    setValidationErrors(errors);
  }, [formData, fieldTouched]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  const handleInputBlur = (field: keyof typeof fieldTouched) => {
    setFieldTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Helper function to get field validation state
  const getFieldValidationState = (field: keyof ValidationErrors) => {
    const hasError = validationErrors[field];
    const isTouched = fieldTouched[field];
    const hasValue = formData[field];
    
    if (!isTouched) return 'neutral';
    if (hasError) return 'error';
    if (hasValue) return 'success';
    return 'neutral';
  };

  // Helper function to get error message for auth errors
  const getAuthErrorMessage = (error: any) => {
    if (!error) return '';
    
    switch (error.type) {
      case AuthErrorType.VALIDATION_ERROR:
        return error.details ? 
          Object.values(error.details).flat().join(', ') : 
          error.message;
      case AuthErrorType.NETWORK_ERROR:
        return 'Network connection failed. Please check your internet connection and try again.';
      case AuthErrorType.RATE_LIMITED:
        const retryTime = error.retryAfter ? Math.ceil(error.retryAfter / 1000) : 60;
        return `Too many attempts. Please wait ${retryTime} seconds before trying again.`;
      case AuthErrorType.SERVER_ERROR:
        return 'Server is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // Helper function to determine if we should show retry option
  const shouldShowRetry = (error: any) => {
    if (!error) return false;
    return [
      AuthErrorType.NETWORK_ERROR,
      AuthErrorType.SERVER_ERROR,
      AuthErrorType.UNKNOWN_ERROR
    ].includes(error.type);
  };

  // Check if form is valid
  const isFormValid = () => {
    const emailValid = validateEmail(formData.email).isValid;
    const usernameValid = validateUsername(formData.username).isValid;
    const passwordValid = validatePassword(formData.password).isValid;
    const confirmPasswordValid = validateConfirmPassword(formData.confirmPassword, formData.password).isValid;
    
    return emailValid && usernameValid && passwordValid && confirmPasswordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    setFieldTouched({
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    // Check if form is valid
    if (!isFormValid()) {
      return;
    }

    const redirectDestination = getRedirectDestination();

    try {
      await signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      }, redirectDestination);
      
      // Redirect to the intended destination
      navigate(redirectDestination, { replace: true });
    } catch (err) {
      // Error is handled by AuthContext and will be displayed via authError
      console.error('Signup failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-600">Join chronosi and start your learning journey</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced Error Display */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {authError.type === AuthErrorType.NETWORK_ERROR ? (
                      <WifiOff className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium">
                      {getAuthErrorMessage(authError)}
                    </p>
                    {shouldShowRetry(authError) && (
                      <button
                        type="button"
                        onClick={() => {
                          clearError();
                          handleSubmit(new Event('submit') as any);
                        }}
                        className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}



            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${
                    getFieldValidationState('username') === 'error' ? 'text-red-400' :
                    getFieldValidationState('username') === 'success' ? 'text-green-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('username')}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    getFieldValidationState('username') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : getFieldValidationState('username') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Choose a username"
                />
                {/* Validation Icon */}
                {fieldTouched.username && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {getFieldValidationState('username') === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : getFieldValidationState('username') === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {/* Validation Message */}
              {fieldTouched.username && validationErrors.username && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.username}</span>
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${
                    getFieldValidationState('email') === 'error' ? 'text-red-400' :
                    getFieldValidationState('email') === 'success' ? 'text-green-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('email')}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    getFieldValidationState('email') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : getFieldValidationState('email') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
                {/* Validation Icon */}
                {fieldTouched.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {getFieldValidationState('email') === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : getFieldValidationState('email') === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {/* Validation Message */}
              {fieldTouched.email && validationErrors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    getFieldValidationState('password') === 'error' ? 'text-red-400' :
                    getFieldValidationState('password') === 'success' ? 'text-green-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('password')}
                  className={`block w-full pl-10 pr-20 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    getFieldValidationState('password') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : getFieldValidationState('password') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Create a password"
                />
                {/* Validation Icon */}
                {fieldTouched.password && (
                  <div className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none">
                    {getFieldValidationState('password') === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : getFieldValidationState('password') === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
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
              {/* Validation Message */}
              {fieldTouched.password && validationErrors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    getFieldValidationState('confirmPassword') === 'error' ? 'text-red-400' :
                    getFieldValidationState('confirmPassword') === 'success' ? 'text-green-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('confirmPassword')}
                  className={`block w-full pl-10 pr-20 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    getFieldValidationState('confirmPassword') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : getFieldValidationState('confirmPassword') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Confirm your password"
                />
                {/* Validation Icon */}
                {fieldTouched.confirmPassword && (
                  <div className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none">
                    {getFieldValidationState('confirmPassword') === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : getFieldValidationState('confirmPassword') === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {/* Validation Message */}
              {fieldTouched.confirmPassword && validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Create account</span>
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
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              state={location.state}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign in to your account
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
