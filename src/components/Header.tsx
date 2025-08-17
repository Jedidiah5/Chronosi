import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Menu, X, LogOut, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Navigate back to landing page
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
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-600">
                chronosi
              </span>
              <span className="text-xs text-gray-500 font-medium">AI Powered</span>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
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
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 rounded-xl transition-all duration-200 group-hover:from-red-500/5 group-hover:to-pink-500/5"></div>
            </button>
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};