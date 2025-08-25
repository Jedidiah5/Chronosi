import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, LogOut, Settings, User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    // Add settings logic here
    console.log('Settings clicked');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Logo size="medium" />
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-medium text-gray-900">{user?.username}</span>
                  </span>
                  <button 
                    onClick={handleSettings}
                    className="group relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:shadow-md"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 rounded-xl transition-all duration-200 group-hover:from-blue-500/5 group-hover:to-indigo-500/5"></div>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="group relative p-3 text-red-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 hover:shadow-md"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-pink-500/0 rounded-xl transition-all duration-200 group-hover:from-blue-500/5 group-hover:to-pink-500/5"></div>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="group relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:shadow-md"
                  aria-label="Login"
                >
                  <LogIn className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 rounded-xl transition-all duration-200 group-hover:from-blue-500/5 group-hover:to-indigo-500/5"></div>
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden group relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <div className="relative">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 transition-all duration-200 rotate-90" />
              ) : (
                <Menu className="h-6 w-6 transition-all duration-200" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 to-gray-400/0 rounded-xl transition-all duration-200 group-hover:from-gray-500/5 group-hover:to-gray-400/5"></div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 rounded-b-2xl shadow-lg">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-200/50">
                    <p className="text-sm text-gray-600">
                      Welcome, <span className="font-medium text-gray-900">{user?.username}</span>
                    </p>
                  </div>
                  <button 
                    onClick={handleSettings}
                    className="flex items-center space-x-4 w-full px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl font-medium transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gray-100/80 rounded-lg group-hover:bg-gray-200/80 transition-colors duration-200">
                      <Settings className="h-5 w-5" />
                    </div>
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-4 w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-xl transition-all duration-200 group"
                    aria-label="Logout"
                  >
                    <div className="p-2 bg-red-100/80 rounded-lg group-hover:bg-red-200/80 transition-colors duration-200">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 w-full px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl font-medium transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gray-100/80 rounded-lg group-hover:bg-gray-200/80 transition-colors duration-200">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-4 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 group"
                  >
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};