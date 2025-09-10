'use client';

import React from 'react';

interface StatisticItem {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: StatisticItem[];
  title?: string;
  className?: string;
  size?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
  centerText?: string;
  centerValue?: string | number;
  donut?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  className = '',
  size = 'h-64 w-64',
  showLegend = true,
  showPercentages = true,
  centerText,
  centerValue,
  donut = false
}) => {
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentage for each item and starting position
  let currentPercentage = 0;
  
  const chartData = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const startPercentage = currentPercentage;
    currentPercentage += percentage;
    
    return {
      ...item,
      percentage,
      startPercentage,
      endPercentage: currentPercentage
    };
  });
  
  // Generate SVG paths for pie chart segments
  const createPath = (startPercent: number, endPercent: number) => {
    const radius = 50; // SVG viewbox is 100x100, so radius is 50
    const innerRadius = donut ? 25 : 0; // If donut, inner radius is half of outer radius
    
    // Convert percentages to radians
    const startRadian = (startPercent / 100) * Math.PI * 2 - Math.PI / 2;
    const endRadian = (endPercent / 100) * Math.PI * 2 - Math.PI / 2;
    
    // Calculate coordinates
    const startX = 50 + radius * Math.cos(startRadian);
    const startY = 50 + radius * Math.sin(startRadian);
    const endX = 50 + radius * Math.cos(endRadian);
    const endY = 50 + radius * Math.sin(endRadian);
    
    // Determine if the arc should be drawn the long way around
    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;
    
    if (innerRadius === 0) {
      // Regular pie slice
      return `M 50 50 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    } else {
      // Donut slice with inner and outer arcs
      const innerStartX = 50 + innerRadius * Math.cos(startRadian);
      const innerStartY = 50 + innerRadius * Math.sin(startRadian);
      const innerEndX = 50 + innerRadius * Math.cos(endRadian);
      const innerEndY = 50 + innerRadius * Math.sin(endRadian);
      
      return `
        M ${innerStartX} ${innerStartY}
        L ${startX} ${startY}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
        L ${innerEndX} ${innerEndY}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
        Z
      `;
    }
  };

  return (
    <div className={`${className}`}>
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* SVG Chart */}
        <div className={`relative ${size} flex-shrink-0`}>
          <svg viewBox="0 0 100 100">
            {chartData.map((item, index) => (
              <path
                key={index}
                d={createPath(item.startPercentage, item.endPercentage)}
                fill={item.color}
                stroke="#fff"
                strokeWidth="0.5"
                className="hover:opacity-90 transition-opacity duration-200"
              />
            ))}
            
            {/* Center hole for donut chart */}
            {donut && (
              <circle cx="50" cy="50" r="25" fill="white" />
            )}
          </svg>
          
          {/* Center text for donut chart */}
          {donut && centerText && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {centerValue && (
                <div className="text-xl font-bold text-gray-800">{centerValue}</div>
              )}
              <div className="text-xs text-gray-500">{centerText}</div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
                {showPercentages && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;
