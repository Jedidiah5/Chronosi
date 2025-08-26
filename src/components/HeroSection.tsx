import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useFirebaseAuth();
  const [typedText, setTypedText] = useState('');
  const fullText = 'Frontend Development';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setTypedText('');
          index = 0;
          const newTimer = setInterval(() => {
            if (index <= fullText.length) {
              setTypedText(fullText.slice(0, index));
              index++;
            } else {
              clearInterval(newTimer);
            }
          }, 100);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-20 pb-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Animated Background Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top to Bottom Lines */}
        <div className="absolute top-0 left-1/4 w-0.5 h-40 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-3/4 w-0.5 h-32 bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-28 bg-gradient-to-b from-transparent via-blue-500/35 to-transparent animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-0 left-1/6 w-0.5 h-36 bg-gradient-to-b from-transparent via-indigo-500/45 to-transparent animate-pulse" style={{ animationDelay: '1.8s' }}></div>
        <div className="absolute top-0 left-5/6 w-0.5 h-24 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-pulse" style={{ animationDelay: '2.2s' }}></div>
        
        {/* Bottom to Top Lines */}
        <div className="absolute bottom-0 right-1/3 w-0.5 h-36 bg-gradient-to-t from-transparent via-blue-500/35 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-2/3 w-0.5 h-44 bg-gradient-to-t from-transparent via-indigo-500/45 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-0 right-1/2 w-0.5 h-32 bg-gradient-to-t from-transparent via-blue-400/40 to-transparent animate-pulse" style={{ animationDelay: '1.3s' }}></div>
        <div className="absolute bottom-0 right-1/6 w-0.5 h-28 bg-gradient-to-t from-transparent via-indigo-400/35 to-transparent animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-0 right-5/6 w-0.5 h-40 bg-gradient-to-t from-transparent via-blue-500/30 to-transparent animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        
        {/* Left to Right Lines */}
        <div className="absolute top-1/4 left-0 h-0.5 w-40 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-3/4 left-0 h-0.5 w-32 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute top-1/2 left-0 h-0.5 w-36 bg-gradient-to-r from-transparent via-blue-500/35 to-transparent animate-pulse" style={{ animationDelay: '2.1s' }}></div>
        <div className="absolute top-1/6 left-0 h-0.5 w-28 bg-gradient-to-r from-transparent via-indigo-500/45 to-transparent animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute top-5/6 left-0 h-0.5 w-44 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse" style={{ animationDelay: '1.9s' }}></div>
        
        {/* Right to Left Lines */}
        <div className="absolute top-1/3 right-0 h-0.5 w-36 bg-gradient-to-l from-transparent via-blue-500/35 to-transparent animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-2/3 right-0 h-0.5 w-44 bg-gradient-to-l from-transparent via-indigo-500/45 to-transparent animate-pulse" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-1/2 right-0 h-0.5 w-32 bg-gradient-to-l from-transparent via-blue-400/40 to-transparent animate-pulse" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute top-1/6 right-0 h-0.5 w-40 bg-gradient-to-l from-transparent via-indigo-400/35 to-transparent animate-pulse" style={{ animationDelay: '2.3s' }}></div>
        <div className="absolute top-5/6 right-0 h-0.5 w-28 bg-gradient-to-l from-transparent via-blue-500/30 to-transparent animate-pulse" style={{ animationDelay: '1.6s' }}></div>
        
        {/* Diagonal Lines */}
        <div className="absolute top-0 left-0 w-40 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-45 origin-left animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-0 right-0 w-32 h-0.5 bg-gradient-to-l from-transparent via-indigo-400/40 to-transparent transform -rotate-45 origin-right animate-pulse" style={{ animationDelay: '1.8s' }}></div>
        <div className="absolute bottom-0 left-0 w-36 h-0.5 bg-gradient-to-r from-transparent via-blue-500/35 to-transparent transform -rotate-45 origin-left animate-pulse" style={{ animationDelay: '2.2s' }}></div>
        <div className="absolute bottom-0 right-0 w-44 h-0.5 bg-gradient-to-l from-transparent via-indigo-500/25 to-transparent transform rotate-45 origin-right animate-pulse" style={{ animationDelay: '0.7s' }}></div>
        
        {/* Additional Side Lines - Left */}
        <div className="absolute top-1/8 left-0 h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse" style={{ animationDelay: '0.9s' }}></div>
        <div className="absolute top-3/8 left-0 h-0.5 w-36 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent animate-pulse" style={{ animationDelay: '2.4s' }}></div>
        <div className="absolute top-7/8 left-0 h-0.5 w-32 bg-gradient-to-r from-transparent via-blue-500/45 to-transparent animate-pulse" style={{ animationDelay: '1.1s' }}></div>
        
        {/* Additional Side Lines - Right */}
        <div className="absolute top-1/8 right-0 h-0.5 w-28 bg-gradient-to-l from-transparent via-indigo-400/50 to-transparent animate-pulse" style={{ animationDelay: '1.4s' }}></div>
        <div className="absolute top-3/8 right-0 h-0.5 w-40 bg-gradient-to-l from-transparent via-blue-400/35 to-transparent animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        <div className="absolute top-7/8 right-0 h-0.5 w-36 bg-gradient-to-l from-transparent via-indigo-500/40 to-transparent animate-pulse" style={{ animationDelay: '2.7s' }}></div>
        
        {/* Floating Dots */}
        <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 bg-blue-400/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-indigo-400/60 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-500/70 rounded-full animate-ping" style={{ animationDelay: '2.8s' }}></div>
        <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-indigo-500/45 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-5/6 left-1/6 w-1.5 h-1.5 bg-blue-400/55 rounded-full animate-ping" style={{ animationDelay: '1.9s' }}></div>
        
        {/* Moving Lines */}
        <div className="absolute top-1/6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/25 to-transparent animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-5/6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent animate-pulse" style={{ animationDelay: '1.7s' }}></div>
        <div className="absolute top-0 left-1/6 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-pulse" style={{ animationDelay: '2.3s' }}></div>
        <div className="absolute top-0 right-1/6 w-0.5 h-full bg-gradient-to-b from-transparent via-indigo-500/25 to-transparent animate-pulse" style={{ animationDelay: '0.9s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Study Smarter.
            <br />
            Learn Faster.
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Let AI Plan It For You
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Chronosi helps you master anything with an AI-generated learning timeline — complete with YouTube videos, articles, and course recommendations.
          </p>

          <div className="flex justify-center mb-16 space-x-4">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/study-plan')}
                className="group relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Go to Study Plan</span>
                <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/login"
                  className="group relative bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-3 shadow-lg"
                >
                  <span className="relative z-10">Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Hero Animation/Mockup */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="text-sm text-gray-500 mb-2">What would you like to learn?</div>
                <div className="text-lg font-medium text-gray-900">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="font-semibold text-gray-900">HTML & CSS Fundamentals</div>
                </div>
                <div className="text-sm text-gray-600 ml-11">Learn the building blocks of web development</div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left opacity-75">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="font-semibold text-gray-700">JavaScript Essentials</div>
                </div>
                <div className="text-sm text-gray-500 ml-11">Master interactive web development</div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left opacity-50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="font-semibold text-gray-600">React Framework</div>
                </div>
                <div className="text-sm text-gray-400 ml-11">Build modern user interfaces</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};