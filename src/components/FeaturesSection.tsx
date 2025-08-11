import React from 'react';
import { Calendar, Youtube, BookOpen, CheckCircle, Brain, Clock } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Study Timeline',
      description: 'Smart algorithms create personalized learning paths based on your goals and current skill level.',
      color: 'text-blue-600'
    },
    {
      icon: Youtube,
      title: 'YouTube-First Recommendations',
      description: 'Curated video content from top educators and industry experts to accelerate your learning.',
      color: 'text-red-600'
    },
    {
      icon: BookOpen,
      title: 'Articles & Course Suggestions',
      description: 'Comprehensive resources including articles, tutorials, and premium courses for deeper understanding.',
      color: 'text-green-600'
    },
    {
      icon: CheckCircle,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with visual progress indicators and milestone achievements.',
      color: 'text-purple-600',
      badge: 'Coming Soon'
    },
    {
      icon: Clock,
      title: 'Time-Optimized Learning',
      description: 'Realistic time estimates help you plan your schedule and maintain consistent progress.',
      color: 'text-orange-600'
    },
    {
      icon: Calendar,
      title: 'Built for Self-Learners',
      description: 'Designed specifically for motivated individuals who want to take control of their education.',
      color: 'text-indigo-600'
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create and follow an effective learning plan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
              <div className="flex items-start space-x-4">
                <div className={`${feature.color} bg-gray-50 p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    {feature.badge && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};