import React from 'react';
import { MessageSquare, Brain, BookOpen } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Tell us what you want to learn',
      description: 'Just type a skill or topic — from "Frontend Development" to "How to start a podcast."',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Brain,
      title: 'Get your personalized study path',
      description: 'Chronosi builds a smart learning timeline tailored to your goal.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: BookOpen,
      title: 'Explore curated content',
      description: 'Handpicked YouTube videos, articles, and paid courses to support each step.',
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get from zero to hero in just three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <step.icon className="h-8 w-8" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 transform translate-x-8"></div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};