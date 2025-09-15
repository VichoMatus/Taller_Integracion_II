'use client';

import React, { useState } from 'react';

interface DataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataItem[];
  title?: string;
  height?: string;               // Tailwind height wrapper (e.g., h-60)
  className?: string;            // Extra container classes
  primaryColor?: string;         // Tailwind color for bar fill
  secondaryColor?: string;       // Tailwind color for base line
  showValues?: boolean;          // Always show value labels
  animate?: boolean;             // Animate bar growth
  maxValue?: number;             // Override peak scale
  emptyMessage?: string;         // Message when no data
  ariaLabel?: string;            // Accessibility label for the chart region
  loading?: boolean;             // Show skeleton state
  onBarClick?: (item: DataItem, index: number) => void; // Click handler
  formatValue?: (value: number) => string | number;     // Custom value formatter
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
  maxValue,
  emptyMessage = 'Sin datos disponibles',
  ariaLabel = 'Gráfico de barras',
  loading = false,
  onBarClick,
  formatValue
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null as number | null);
  
  // Determine the maximum value from the data if not provided
  const calculatedMax = maxValue || Math.max(...data.map(item => item.value), 0);
  
  // Ensure maxValue is never zero to avoid division by zero
  const chartMaxValue = calculatedMax > 0 ? calculatedMax : 1;

  // Loading skeleton simple
  if (loading) {
    return (
      <div className={`w-full ${className}`} aria-busy="true" aria-live="polite">
        {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
        <div className={`${height} flex items-end gap-2 animate-pulse`}> 
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t-md" style={{ height: `${20 + (i % 5) * 10}%` }} />
              <div className="w-full h-1 bg-gray-100 mt-1" />
              <span className="text-xs text-gray-400 mt-2 block w-6 h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} role="group" aria-label={ariaLabel}>
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
      
      <div className={`${height} w-full flex items-end justify-between gap-2`}>
        {data.length === 0 && (
          <div className="w-full text-center text-sm text-gray-500" role="note">{emptyMessage}</div>
        )}
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
                <div className={`absolute -top-8 text-xs font-medium px-1.5 py-0.5 rounded bg-gray-800 text-white transform -translate-y-1 ${hoveredIndex === index ? 'opacity-100' : 'opacity-70'}`}
                     role="note" aria-label={`Valor ${item.value}`}>
                  {formatValue ? formatValue(item.value) : item.value}
                </div>
              )}
              
              {/* Bar */}
              <div 
                className={`w-full rounded-t-md ${primaryColor} ${animationClass}`}
                style={barStyle}
                role="img"
                aria-label={`${item.label}: ${item.value}`}
                onClick={onBarClick ? () => onBarClick(item, index) : undefined}
                tabIndex={onBarClick ? 0 : -1}
                onKeyDown={onBarClick ? (e: any) => { if (e.key === 'Enter') onBarClick(item, index); } : undefined}
              />
              
              {/* Base indicator */}
              <div className={`w-full h-1 ${secondaryColor} mt-1`} />
              
              {/* Label */}
              <span className="text-xs text-gray-600 mt-2 text-center" aria-hidden="false">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
