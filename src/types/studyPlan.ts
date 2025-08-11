export interface Resource {
  type: 'YouTube' | 'Article' | 'Course';
  title: string;
  link: string;
  duration?: string;
}

export interface StudyStep {
  stepNumber: number;
  title: string;
  objective: string;
  estimatedTime: string;
  resources: Resource[];
}

export interface StudyPlanData {
  topic: string;
  steps: StudyStep[];
  totalEstimatedTime: string;
}