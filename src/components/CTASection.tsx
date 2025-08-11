import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-500 to-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="h-8 w-8 text-blue-200 mr-3" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Start Learning Smarter — Today
          </h2>
          <Sparkles className="h-8 w-8 text-blue-200 ml-3" />
        </div>
        
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of learners who've transformed their careers with AI-powered study plans. 
          Your personalized learning journey is just one click away.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-white hover:bg-gray-50 text-blue-600 px-10 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <span>Try Chronosi for Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <div className="text-blue-100 text-sm">
            No credit card required • Get started in 30 seconds
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">10K+</div>
            <div className="text-blue-200 text-sm">Study Plans Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">95%</div>
            <div className="text-blue-200 text-sm">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">4.9★</div>
            <div className="text-blue-200 text-sm">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};