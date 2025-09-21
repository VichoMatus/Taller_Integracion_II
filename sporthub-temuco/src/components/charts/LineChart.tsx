'use client';

import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  className?: string;
  title?: string;
  ariaLabel?: string;
  emptyMessage?: string;
  loading?: boolean;
  formatValue?: (value: number) => string;
  onPointClick?: (item: DataPoint, index: number) => void;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  className = '',
  title,
  ariaLabel = 'Gráfico de líneas',
  emptyMessage = 'Sin datos disponibles',
  loading = false,
  formatValue = (value) => value.toString(),
  onPointClick
}) => {
  // Skeleton loader
  if (loading) {
    return (
      <div className={className} aria-busy="true" aria-live="polite">
        {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
        <div className="w-full h-64 animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={className}>
        {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-500" role="note">
          {emptyMessage}
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and scales
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const padding = maxValue * 0.1; // 10% padding
  const yMax = maxValue + padding;
  const yMin = Math.max(0, minValue - padding);
  
  const getY = (value: number) => {
    return 200 - ((value - yMin) / (yMax - yMin) * 180);
  };

  const points = data.map((point, i) => ({
    x: 40 + (i * ((560) / (data.length - 1))),
    y: getY(point.value),
    original: point
  }));

  const pathD = points.map((point, i) => 
    (i === 0 ? 'M' : 'L') + point.x + ',' + point.y
  ).join(' ');

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
      <svg
        viewBox="0 0 600 240"
        className="w-full overflow-visible"
        style={{ minHeight: '240px' }}
      >
        {/* Eje Y */}
        <line x1="40" y1="20" x2="40" y2="200" stroke="#E5E7EB" strokeWidth="1" />
        
        {/* Eje X */}
        <line x1="40" y1="200" x2="560" y2="200" stroke="#E5E7EB" strokeWidth="1" />
        
        {/* Líneas de cuadrícula Y */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`grid-y-${i}`}
            x1="40"
            y1={20 + i * 45}
            x2="560"
            y2={20 + i * 45}
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        ))}
        
        {/* Etiquetas del eje Y */}
        {[0, 1, 2, 3, 4].map(i => {
          const value = yMax - (i * ((yMax - yMin) / 4));
          return (
            <text
              key={`label-y-${i}`}
              x="35"
              y={25 + i * 45}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {formatValue(Math.round(value))}
            </text>
          );
        })}
        
        {/* Etiquetas del eje X */}
        {data.map((point, i) => (
          <text
            key={`label-x-${i}`}
            x={40 + (i * ((560) / (data.length - 1)))}
            y="220"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {point.label}
          </text>
        ))}
        
        {/* Línea del gráfico */}
        <path
          d={pathD}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          className="transition-all duration-500"
        />
        
        {/* Puntos de datos */}
        {points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3B82F6"
              className="transition-all duration-500"
            />
            {onPointClick && (
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="transparent"
                className="cursor-pointer hover:fill-blue-500 hover:fill-opacity-10 transition-colors"
                onClick={() => onPointClick(point.original, i)}
                role="button"
                tabIndex={0}
                aria-label={`${point.original.label}: ${formatValue(point.original.value)}`}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default LineChart;