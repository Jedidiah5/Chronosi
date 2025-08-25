import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showSubtitle?: boolean;
}

type LogoSize = 'small' | 'medium' | 'large';

interface LogoConfig {
  mainText: string;
  subtitle: string;
  mainTextClasses: Record<LogoSize, string>;
  subtitleClasses: Record<LogoSize, string>;
}

const logoConfig: LogoConfig = {
  mainText: 'chronosi',
  subtitle: 'AI Powered',
  mainTextClasses: {
    small: 'text-lg font-bold',
    medium: 'text-2xl font-bold',
    large: 'text-3xl font-bold'
  },
  subtitleClasses: {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm'
  }
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className = '', 
  showSubtitle = true 
}) => {
  const mainTextClass = logoConfig.mainTextClasses[size];
  const subtitleClass = logoConfig.subtitleClasses[size];

  return (
    <div className={`flex flex-col ${className}`} role="img" aria-label="Chronosi Logo">
      <span className={`${mainTextClass} text-blue-600`}>
        {logoConfig.mainText}
      </span>
      {showSubtitle && (
        <span className={`${subtitleClass} text-gray-500 font-medium`}>
          {logoConfig.subtitle}
        </span>
      )}
    </div>
  );
};