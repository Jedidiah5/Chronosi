import React, { useState } from 'react';
import { Clock, ArrowLeft, Download, CheckCircle2, PlayCircle, FileText, GraduationCap } from 'lucide-react';
import type { StudyPlanData } from '../types/studyPlan';

interface StudyPlanProps {
  data: StudyPlanData;
  onNewPlan: () => void;
}

export const StudyPlan: React.FC<StudyPlanProps> = ({ data, onNewPlan }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.topic.toLowerCase().replace(/\s+/g, '-')}-study-plan.json`;
    link.click();
    URL.revokeObjectURL(url);
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
        
        <button
          onClick={handleExportJSON}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export JSON</span>
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

      <div className="space-y-6">
        {data.steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.stepNumber);
          return (
            <div
              key={step.stepNumber}
              className={`bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-300 ${
                isCompleted ? 'border-2 border-[#eaecc6] bg-[#eaecc6]/20' : 'border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleStepComplete(step.stepNumber)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-[#2bc0e4] text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{step.stepNumber}</span>
                    )}
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-xl font-bold ${isCompleted ? 'text-[#2bc0e4]' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{step.objective}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4" />
                      <span>{step.estimatedTime}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                            {resource.duration && (
                              <span className="text-sm text-gray-500">{resource.duration}</span>
                            )}
                            <a
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#2bc0e4] hover:bg-[#2bc0e4]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};