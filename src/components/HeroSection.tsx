import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
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
    <section className="pt-20 pb-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="flex justify-center mb-16">
            <button 
              onClick={() => navigate('/study-plan')}
              className="group relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
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