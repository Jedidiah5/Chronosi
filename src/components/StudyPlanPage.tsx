import React, { useState } from 'react';
import { Header } from './Header';
import { StudyForm } from './StudyForm';
import { StudyPlan } from './StudyPlan';
import type { StudyPlanData } from '../types/studyPlan';
import { generateStudyPlan } from '../utils/studyPlanGenerator';

export const StudyPlanPage: React.FC = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = async (topic: string) => {
    setIsLoading(true);
    try {
      const plan = await generateStudyPlan(topic);
      setStudyPlan(plan);
    } catch (error) {
      console.error('Error generating study plan:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPlan = () => {
    setStudyPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="pt-20 pb-16">
        {!studyPlan ? (
          <StudyForm onGenerate={handleGeneratePlan} isLoading={isLoading} />
        ) : (
          <div className="px-4 sm:px-6 lg:px-8">
            <StudyPlan data={studyPlan} onNewPlan={handleNewPlan} />
          </div>
        )}
      </main>
    </div>
  );
};
