import type { StudyPlanData } from '../types/studyPlan';

const studyPlans: Record<string, StudyPlanData> = {
  'data science': {
    topic: 'Data Science',
    steps: [
      {
        stepNumber: 1,
        title: 'Introduction to Data Science',
        objective: 'Understand what data science is, its applications, and key concepts.',
        estimatedTime: '3 days',
        resources: [
          {
            type: 'YouTube',
            title: 'What is Data Science? - Complete Guide',
            link: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
            duration: '1h'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Python Programming Basics',
        objective: 'Learn Python fundamentals essential for data science.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'Python for Beginners - Full Course',
            link: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            duration: '4h'
          }
        ]
      },
      {
        stepNumber: 3,
        title: 'Data Analysis with Pandas',
        objective: 'Master data manipulation and analysis using Pandas library.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'Pandas Tutorial for Data Science',
            link: 'https://www.youtube.com/watch?v=vmEHCJofslg',
            duration: '2h'
          }
        ]
      },
      {
        stepNumber: 4,
        title: 'Data Visualization',
        objective: 'Create compelling visualizations using Matplotlib and Seaborn.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'Data Visualization with Python',
            link: 'https://www.youtube.com/watch?v=a9UrKTVEeZA',
            duration: '3h'
          }
        ]
      },
      {
        stepNumber: 5,
        title: 'Statistics for Data Science',
        objective: 'Understand statistical concepts crucial for data analysis.',
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Statistics for Data Science - Complete Course',
            link: 'https://www.youtube.com/watch?v=xxpc-HPKN28',
            duration: '8h'
          }
        ]
      },
      {
        stepNumber: 6,
        title: 'Machine Learning Fundamentals',
        objective: 'Learn the basics of machine learning algorithms and techniques.',
        estimatedTime: '3 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Machine Learning Course - Stanford',
            link: 'https://www.youtube.com/watch?v=jGwO_UgTS7I',
            duration: '20h'
          }
        ]
      },
      {
        stepNumber: 7,
        title: 'Advanced ML and Deep Learning',
        objective: 'Explore advanced machine learning and neural networks.',
        estimatedTime: '4 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Deep Learning Specialization',
            link: 'https://www.youtube.com/watch?v=CS4cs9xVecg',
            duration: '15h'
          }
        ]
      }
    ],
    totalEstimatedTime: '12 weeks'
  },
  'web development': {
    topic: 'Web Development',
    steps: [
      {
        stepNumber: 1,
        title: 'HTML & CSS Fundamentals',
        objective: 'Learn the building blocks of web pages with HTML and CSS.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'HTML & CSS Full Course for Beginners',
            link: 'https://www.youtube.com/watch?v=mU6anWqZJcc',
            duration: '4h'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'JavaScript Essentials',
        objective: 'Master JavaScript fundamentals and DOM manipulation.',
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'JavaScript Full Course - freeCodeCamp',
            link: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
            duration: '3h'
          }
        ]
      },
      {
        stepNumber: 3,
        title: 'Responsive Design & CSS Grid',
        objective: 'Create responsive layouts using modern CSS techniques.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'CSS Grid & Flexbox Complete Guide',
            link: 'https://www.youtube.com/watch?v=EFafSYg-PkI',
            duration: '2h'
          }
        ]
      },
      {
        stepNumber: 4,
        title: 'React.js Framework',
        objective: 'Build dynamic user interfaces with React.js.',
        estimatedTime: '3 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'React Course for Beginners',
            link: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            duration: '5h'
          }
        ]
      },
      {
        stepNumber: 5,
        title: 'Backend Development with Node.js',
        objective: 'Learn server-side development with Node.js and Express.',
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Node.js & Express.js Full Course',
            link: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
            duration: '8h'
          }
        ]
      },
      {
        stepNumber: 6,
        title: 'Database Integration',
        objective: 'Connect your applications to databases using MongoDB.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'MongoDB Tutorial for Beginners',
            link: 'https://www.youtube.com/watch?v=4yqu8YF29cU',
            duration: '2h'
          }
        ]
      },
      {
        stepNumber: 7,
        title: 'Full-Stack Project & Deployment',
        objective: 'Build and deploy a complete full-stack web application.',
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Full Stack MERN Project Tutorial',
            link: 'https://www.youtube.com/watch?v=ngc9gnGgUdA',
            duration: '6h'
          }
        ]
      }
    ],
    totalEstimatedTime: '12 weeks'
  },
  'machine learning': {
    topic: 'Machine Learning',
    steps: [
      {
        stepNumber: 1,
        title: 'Introduction to Machine Learning',
        objective: 'Understand ML concepts, types, and applications.',
        estimatedTime: '3 days',
        resources: [
          {
            type: 'YouTube',
            title: 'Machine Learning Explained',
            link: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
            duration: '45m'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Python for Machine Learning',
        objective: 'Learn Python libraries essential for ML: NumPy, Pandas, Matplotlib.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'Python for Machine Learning - Complete Course',
            link: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
            duration: '4h'
          }
        ]
      },
      {
        stepNumber: 3,
        title: 'Supervised Learning Algorithms',
        objective: 'Master regression, classification, and decision trees.',
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Supervised Learning Algorithms Explained',
            link: 'https://www.youtube.com/watch?v=1FZ0A1QCMWc',
            duration: '3h'
          }
        ]
      },
      {
        stepNumber: 4,
        title: 'Unsupervised Learning',
        objective: 'Explore clustering, dimensionality reduction, and anomaly detection.',
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'Unsupervised Learning Complete Guide',
            link: 'https://www.youtube.com/watch?v=IUn8k5zSI6g',
            duration: '2h'
          }
        ]
      },
      {
        stepNumber: 5,
        title: 'Model Evaluation & Optimization',
        objective: 'Learn to evaluate models and optimize hyperparameters.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'Model Evaluation in Machine Learning',
            link: 'https://www.youtube.com/watch?v=85dtiMz9tSo',
            duration: '1h'
          }
        ]
      },
      {
        stepNumber: 6,
        title: 'Deep Learning with TensorFlow',
        objective: 'Build neural networks and deep learning models.',
        estimatedTime: '3 weeks',
        resources: [
          {
            type: 'YouTube',
            title: 'TensorFlow 2.0 Complete Course',
            link: 'https://www.youtube.com/watch?v=tPYj3fFJGjk',
            duration: '7h'
          }
        ]
      },
      {
        stepNumber: 7,
        title: 'ML Project Deployment',
        objective: 'Deploy machine learning models in production.',
        estimatedTime: '1 week',
        resources: [
          {
            type: 'YouTube',
            title: 'Deploy ML Models with Flask',
            link: 'https://www.youtube.com/watch?v=UbCWoMf80PY',
            duration: '2h'
          }
        ]
      }
    ],
    totalEstimatedTime: '10 weeks'
  }
};

export function generateStudyPlan(topic: string): StudyPlanData {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Check for exact matches first
  if (studyPlans[normalizedTopic]) {
    return studyPlans[normalizedTopic];
  }
  
  // Check for partial matches
  for (const [key, plan] of Object.entries(studyPlans)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return plan;
    }
  }
  
  // Generate a generic plan for unknown topics
  return generateGenericPlan(topic);
}

function generateGenericPlan(topic: string): StudyPlanData {
  return {
    topic: topic,
    steps: [
      {
        stepNumber: 1,
        title: `Introduction to ${topic}`,
        objective: `Understand the fundamentals and core concepts of ${topic}.`,
        estimatedTime: '3 days',
        resources: [
          {
            type: 'YouTube',
            title: `${topic} - Complete Beginner's Guide`,
            link: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(topic + ' tutorial'),
            duration: '1h'
          }
        ]
      },
      {
        stepNumber: 2,
        title: `${topic} Fundamentals`,
        objective: `Learn the basic principles and terminology of ${topic}.`,
        estimatedTime: '1 week',
        resources: [
          {
            type: 'Course',
            title: `${topic} Fundamentals Course`,
            link: 'https://www.coursera.org/search?query=' + encodeURIComponent(topic),
            duration: '4h'
          }
        ]
      },
      {
        stepNumber: 3,
        title: `Practical ${topic} Skills`,
        objective: `Develop hands-on experience with ${topic} tools and techniques.`,
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'Article',
            title: `${topic} Practical Guide`,
            link: 'https://medium.com/search?q=' + encodeURIComponent(topic + ' practical guide'),
          }
        ]
      },
      {
        stepNumber: 4,
        title: `Advanced ${topic} Concepts`,
        objective: `Explore advanced topics and specialized areas within ${topic}.`,
        estimatedTime: '2 weeks',
        resources: [
          {
            type: 'YouTube',
            title: `Advanced ${topic} Techniques`,
            link: 'https://www.youtube.com/results?search_query=' + encodeURIComponent('advanced ' + topic),
            duration: '3h'
          }
        ]
      },
      {
        stepNumber: 5,
        title: `${topic} Project Work`,
        objective: `Apply your knowledge by working on real-world ${topic} projects.`,
        estimatedTime: '3 weeks',
        resources: [
          {
            type: 'Article',
            title: `${topic} Project Ideas and Examples`,
            link: 'https://github.com/search?q=' + encodeURIComponent(topic + ' projects'),
          }
        ]
      }
    ],
    totalEstimatedTime: '8 weeks'
  };
}