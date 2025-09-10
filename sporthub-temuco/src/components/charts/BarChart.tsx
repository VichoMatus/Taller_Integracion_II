'use client';

import React, { useState } from 'react';

interface DataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataItem[];
  title?: string;
  height?: string;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showValues?: boolean;
  animate?: boolean;
  maxValue?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 'h-60',
  className = '',
  primaryColor = 'bg-blue-500',
  secondaryColor = 'bg-blue-100',
  showValues = true,
  animate = true,
  maxValue
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Determine the maximum value from the data if not provided
  const calculatedMax = maxValue || Math.max(...data.map(item => item.value), 0);
  
  // Ensure maxValue is never zero to avoid division by zero
  const chartMaxValue = calculatedMax > 0 ? calculatedMax : 1;

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
      
      <div className={`${height} w-full flex items-end justify-between gap-2`}>
        {data.map((item, index) => {
          // Calculate height percentage
          const percentage = (item.value / chartMaxValue) * 100;
          
          // Animation class
          const animationClass = animate ? 'transition-all duration-500 ease-out' : '';
          
          // Style for the bar
          const barStyle = {
            height: animate ? `${percentage}%` : '0%',
            animationDelay: animate ? `${index * 100}ms` : '0ms'
          };
          
          return (
            <div 
              key={index}
              className="relative flex-1 flex flex-col items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Value tooltip */}
              {(showValues || hoveredIndex === index) && (
                <div className={`absolute -top-8 text-xs font-medium px-1.5 py-0.5 rounded bg-gray-800 text-white transform -translate-y-1 ${hoveredIndex === index ? 'opacity-100' : 'opacity-70'}`}>
                  {item.value}
                </div>
              )}
              
              {/* Bar */}
              <div 
                className={`w-full rounded-t-md ${primaryColor} ${animationClass}`}
                style={barStyle}
              />
              
              {/* Base indicator */}
              <div className={`w-full h-1 ${secondaryColor} mt-1`} />
              
              {/* Label */}
              <span className="text-xs text-gray-600 mt-2 text-center">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
