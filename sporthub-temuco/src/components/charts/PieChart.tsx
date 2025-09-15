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
  size?: string;                 // Wrapper dimension classes
  showLegend?: boolean;          // Show legend list
  showPercentages?: boolean;     // Show percentages in legend
  centerText?: string;           // Donut center label
  centerValue?: string | number; // Donut center value
  donut?: boolean;               // Use donut style
  ariaLabel?: string;            // Accessibility label
  emptyMessage?: string;         // Empty state message
  loading?: boolean;             // Loading skeleton
  formatPercentage?: (value: number) => string; // Custom pct formatting
  onSegmentClick?: (item: StatisticItem, index: number) => void; // Click handler opcional
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
  donut = false,
  ariaLabel = 'Gráfico circular',
  emptyMessage = 'Sin datos',
  loading = false,
  formatPercentage,
  onSegmentClick
}) => {
  // Skeleton
  if (loading) {
    return (
      <div className={className} aria-busy="true" aria-live="polite">
        {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
        <div className="flex flex-col md:flex-row items-center gap-8 animate-pulse">
          <div className={`relative ${size} flex-shrink-0`}>
            <div className="w-full h-full rounded-full bg-gray-200" />
          </div>
          {showLegend && (
            <div className="flex flex-col space-y-2 w-40">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <div className="h-3 flex-1 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const isEmpty = data.length === 0 || total === 0;
  let current = 0;
  const chartData = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const startPercentage = current;
    current += percentage;
    return { ...item, percentage, startPercentage, endPercentage: current };
  });

  const createPath = (startPercent: number, endPercent: number) => {
    const radius = 50;
    const innerRadius = donut ? 25 : 0;
    const startRadian = (startPercent / 100) * Math.PI * 2 - Math.PI / 2;
    const endRadian = (endPercent / 100) * Math.PI * 2 - Math.PI / 2;
    const startX = 50 + radius * Math.cos(startRadian);
    const startY = 50 + radius * Math.sin(startRadian);
    const endX = 50 + radius * Math.cos(endRadian);
    const endY = 50 + radius * Math.sin(endRadian);
    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;

    if (innerRadius === 0) {
      return `M 50 50 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    }

    const innerStartX = 50 + innerRadius * Math.cos(startRadian);
    const innerStartY = 50 + innerRadius * Math.sin(startRadian);
    const innerEndX = 50 + innerRadius * Math.cos(endRadian);
    const innerEndY = 50 + innerRadius * Math.sin(endRadian);

    return [
      `M ${innerStartX} ${innerStartY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
      'Z'
    ].join(' ');
  };

  return (
    <div className={className} role="group" aria-label={ariaLabel}>
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className={`relative ${size} flex-shrink-0`}>
          {isEmpty ? (
            <div className="flex items-center justify-center w-full h-full text-sm text-gray-500" role="note">{emptyMessage}</div>
          ) : (
            <svg viewBox="0 0 100 100">
              {chartData.map((item, index) => (
                <path
                  key={index}
                  d={createPath(item.startPercentage, item.endPercentage)}
                  fill={item.color}
                  stroke="#fff"
                  strokeWidth="0.5"
                  className={`hover:opacity-90 transition-opacity duration-200 focus:outline-none ${onSegmentClick ? 'cursor-pointer' : ''}`}
                  tabIndex={onSegmentClick ? 0 : -1}
                  aria-label={`${item.label}: ${item.value} (${item.percentage.toFixed(1)}%)`}
                  onClick={onSegmentClick ? () => onSegmentClick(item, index) : undefined}
                  onKeyDown={onSegmentClick ? (e: any) => { if (e.key === 'Enter') onSegmentClick(item, index); } : undefined}
                />
              ))}
              {donut && <circle cx="50" cy="50" r="25" fill="white" />}
            </svg>
          )}
          {donut && centerText && !isEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {centerValue && (
                <div className="text-xl font-bold text-gray-800">{centerValue}</div>
              )}
              <div className="text-xs text-gray-500">{centerText}</div>
            </div>
          )}
        </div>
        {showLegend && !isEmpty && (
          <div className="flex flex-col space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-700">{item.label}</span>
                {showPercentages && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({formatPercentage ? formatPercentage(item.percentage) : item.percentage.toFixed(1) + '%'})
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
