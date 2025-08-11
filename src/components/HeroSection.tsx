import React, { useState, useEffect } from 'react';
import { Play, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Study Smarter. Learn Faster.{' '}
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Let AI Plan It For You.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Chronosi helps you master anything with an AI-generated learning timeline — complete with YouTube videos, articles, and course recommendations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
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