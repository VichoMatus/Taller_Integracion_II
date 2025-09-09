'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-4xl mb-3">
          {icon}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        <div className="text-lg font-medium text-gray-700 mb-2">
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-blue-600 hover:text-blue-800">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;