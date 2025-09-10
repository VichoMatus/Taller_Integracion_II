'use client';

import React from 'react';

// Definición del tipo para colores
export type CardColor = 'blue' | 'green' | 'red' | 'purple' | 'yellow';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: CardColor;
  onClick?: () => void;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'blue',
  onClick,
  className = ''
}) => {
  // Color variants
  const colorVariants = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-medium text-gray-700 mb-1">
            {title}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.value}%
              </span>
              <span className="text-gray-500 text-xs ml-1">vs mes anterior</span>
            </div>
          )}
          
          {subtitle && (
            <div className="text-sm text-blue-600 hover:text-blue-800 mt-2">
              {subtitle}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colorVariants[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;