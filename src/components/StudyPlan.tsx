import React, { useState } from 'react';
import { Clock, ArrowLeft, CheckCircle2, PlayCircle, FileText, GraduationCap } from 'lucide-react';
import type { StudyPlanData } from '../types/studyPlan';

interface StudyPlanProps {
  data: StudyPlanData;
  onNewPlan: () => void;
}

export const StudyPlan: React.FC<StudyPlanProps> = ({ data, onNewPlan }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loadingSteps, setLoadingSteps] = useState<Set<number>>(new Set());
  const [celebrateSteps, setCelebrateSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = async (stepNumber: number) => {
    const newLoading = new Set(loadingSteps);
    if (newLoading.has(stepNumber)) return;
    newLoading.add(stepNumber);
    setLoadingSteps(newLoading);

    // Simulate a tiny delay for UX feedback; replace with real API if needed
    await new Promise((r) => setTimeout(r, 400));

    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(stepNumber)) {
      newCompleted.delete(stepNumber);
      setCompletedSteps(newCompleted);
    } else {
      newCompleted.add(stepNumber);
      setCompletedSteps(newCompleted);
      const newCelebrate = new Set(celebrateSteps);
      newCelebrate.add(stepNumber);
      setCelebrateSteps(newCelebrate);
      // Remove celebration state after animation
      setTimeout(() => {
        const after = new Set(celebrateSteps);
        after.delete(stepNumber);
        setCelebrateSteps(after);
      }, 900);
    }

    const afterLoading = new Set(newLoading);
    afterLoading.delete(stepNumber);
    setLoadingSteps(afterLoading);
  };

  

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'YouTube':
        return <PlayCircle className="h-4 w-4 text-red-500" />;
      case 'Course':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const progress = (completedSteps.size / data.steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onNewPlan}
          className="flex items-center space-x-2 text-[#2bc0e4] hover:text-[#2bc0e4]/80 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Create New Plan</span>
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{data.topic} Learning Path</h1>
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">{data.totalEstimatedTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span className="font-medium">{data.steps.length} Steps</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{completedSteps.size}/{data.steps.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#2bc0e4] to-[#eaecc6] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-1 bg-gray-200 rounded"></div>
        <div className="space-y-12">
          {data.steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.stepNumber);
            const isLeft = index % 2 === 0;
            return (
              <div key={step.stepNumber} className={`grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 md:gap-12`}>
                {/* Left side label when left, spacer when right */}
                <div className={`${isLeft ? 'order-1' : 'order-2 md:order-1'}`}>
                  {isLeft && (
                    <div className="flex md:justify-end">
                      <div className={`bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border transition-all duration-300 ${isCompleted ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'} ${celebrateSteps.has(step.stepNumber) ? 'animate-pop' : ''} ${loadingSteps.has(step.stepNumber) ? 'animate-pulse' : ''}`}>
                        <div className="flex items-start md:justify-end md:text-right gap-3">
                          <button
                            onClick={() => handleStepComplete(step.stepNumber)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${loadingSteps.has(step.stepNumber) ? 'animate-pulse' : ''}`}
                          >
                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-bold">{step.stepNumber}</span>}
                          </button>
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${isCompleted ? 'text-blue-700' : 'text-gray-900'}`}>{step.title}</h3>
                            <p className="text-gray-600 mt-1">{step.objective}</p>
                            <div className="mt-3 flex items-center gap-3">
                              <div className="inline-flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span>{step.estimatedTime}</span>
                              </div>
                              <button
                                onClick={() => handleStepComplete(step.stepNumber)}
                                className={`text-sm px-3 py-1 rounded-full font-medium transition-colors ${isCompleted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                              >
                                {isCompleted ? 'Completed' : 'Mark as completed'}
                              </button>
                            </div>
                            <div className="mt-4 space-y-3">
                              {step.resources.map((resource, resourceIndex) => (
                                <div key={resourceIndex} className="bg-white/80 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      {getResourceIcon(resource.type)}
                                      <div>
                                        <h4 className="font-semibold text-gray-800">{resource.title}</h4>
                                        <span className="text-sm text-gray-500">{resource.type}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {resource.duration && <span className="text-sm text-gray-500">{resource.duration}</span>}
                                      <a href={resource.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Open</a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center node */}
                <div className="relative order-2 md:order-none flex items-start justify-center">
                  <div className="relative z-10 mt-1 w-6 h-6 rounded-full bg-white border-4 border-blue-500"></div>
                </div>

                {/* Right side label when right, spacer when left */}
                <div className={`${isLeft ? 'order-3' : 'order-1 md:order-3'}`}>
                  {!isLeft && (
                    <div className="flex md:justify-start">
                      <div className={`bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border transition-all duration-300 ${isCompleted ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'} ${celebrateSteps.has(step.stepNumber) ? 'animate-pop' : ''} ${loadingSteps.has(step.stepNumber) ? 'animate-pulse' : ''}`}>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleStepComplete(step.stepNumber)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${loadingSteps.has(step.stepNumber) ? 'animate-pulse' : ''}`}
                          >
                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-bold">{step.stepNumber}</span>}
                          </button>
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${isCompleted ? 'text-blue-700' : 'text-gray-900'}`}>{step.title}</h3>
                            <p className="text-gray-600 mt-1">{step.objective}</p>
                            <div className="mt-3 flex items-center gap-3">
                              <div className="inline-flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span>{step.estimatedTime}</span>
                              </div>
                              <button
                                onClick={() => handleStepComplete(step.stepNumber)}
                                className={`text-sm px-3 py-1 rounded-full font-medium transition-colors ${isCompleted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                              >
                                {isCompleted ? 'Completed' : 'Mark as completed'}
                              </button>
                            </div>
                            <div className="mt-4 space-y-3">
                              {step.resources.map((resource, resourceIndex) => (
                                <div key={resourceIndex} className="bg-white/80 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      {getResourceIcon(resource.type)}
                                      <div>
                                        <h4 className="font-semibold text-gray-800">{resource.title}</h4>
                                        <span className="text-sm text-gray-500">{resource.type}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {resource.duration && <span className="text-sm text-gray-500">{resource.duration}</span>}
                                      <a href={resource.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Open</a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};