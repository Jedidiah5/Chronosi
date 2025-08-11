import React, { useState } from 'react';
import { Search, BookOpen, Loader2, Lightbulb } from 'lucide-react';

interface StudyFormProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
}

const POPULAR_TOPICS = [
  'Data Science',
  'Web Development',
  'Machine Learning',
  'Digital Marketing',
  'UI/UX Design',
  'Python Programming',
  'React Development',
  'Cybersecurity',
];

export const StudyForm: React.FC<StudyFormProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim());
    }
  };

  const handleTopicSuggestion = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Create Your Personalized Study Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tell us what you want to learn, and we'll create a structured, step-by-step learning path tailored just for you.
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-3">
              What would you like to learn?
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Machine Learning, Web Development, Digital Marketing..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#2bc0e4] focus:ring-0 transition-colors duration-200 bg-white/80"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="w-full bg-gradient-to-r from-[#2bc0e4] to-[#eaecc6] text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-[#2bc0e4]/90 hover:to-[#eaecc6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating Your Study Plan...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-700">Popular Topics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {POPULAR_TOPICS.map((popularTopic) => (
            <button
              key={popularTopic}
              onClick={() => handleTopicSuggestion(popularTopic)}
              className="text-left p-3 bg-white/60 hover:bg-white/80 rounded-lg border border-gray-200 hover:border-[#2bc0e4] transition-all duration-200 text-sm font-medium text-gray-700 hover:text-[#2bc0e4]"
              disabled={isLoading}
            >
              {popularTopic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};