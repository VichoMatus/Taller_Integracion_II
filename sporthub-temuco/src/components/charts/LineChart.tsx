'use client';

import React from 'react';
import styles from './LineChart.module.css';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  maxValue?: number;
  minValue?: number;
  gridLines?: boolean;
  animate?: boolean;
  showPoints?: boolean;
  lineColor?: string;
  pointColor?: string;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onPointClick?: (point: DataPoint, index: number) => void;
  formatValue?: (value: number) => string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  maxValue,
  minValue = 0,
  gridLines = true,
  animate = true,
  showPoints = true,
  lineColor = '#14b8a6',
  pointColor = '#14b8a6',
  className = '',
  loading = false,
  emptyMessage = 'Sin datos disponibles',
  onPointClick,
  formatValue
}) => {
  
  // Loading state
  if (loading) {
    return (
      <div className={`${styles.lineChartContainer} ${className}`}>
        <div className={styles.loadingContainer}>
          <span className="text-gray-500">Cargando gráfico...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`${styles.lineChartContainer} ${className}`}>
        <div className={styles.loadingContainer}>
          <span className="text-gray-500">{emptyMessage}</span>
        </div>
      </div>
    );
  }

  // Calculate chart values
  const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value));
  const yAxisMax = Math.max(calculatedMaxValue, 10);
  const yAxisMin = 0;

  // Y-axis values
  const yAxisValues = [
    yAxisMax,
    Math.round(yAxisMax * 0.75),
    Math.round(yAxisMax * 0.5),
    Math.round(yAxisMax * 0.25),
    0
  ];

  // Calculate positions for data points to match space-around distribution
  const dataPoints = data.map((point, index) => {
    // space-around creates equal spacing around each item
    // Total space is divided into (2n) parts, each item gets 1 part on each side
    const totalParts = data.length * 2;
    const itemPosition = (index * 2) + 1; // Position of item center
    const xCoord = itemPosition / totalParts;
    
    const yPercent = 100 - ((point.value - yAxisMin) / (yAxisMax - yAxisMin)) * 100;
    const yCoord = 1 - ((point.value - yAxisMin) / (yAxisMax - yAxisMin));
    
    return {
      x: (itemPosition / totalParts) * 100,
      y: yPercent,
      xCoord: xCoord,
      yCoord: yCoord,
      ...point
    };
  });

  // Create SVG path string using 0-1 coordinates
  const pathString = dataPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.xCoord} ${point.yCoord}`)
    .join(' ');

  return (
    <div className={`${styles.lineChartContainer} ${className}`}>
      {/* Y-axis */}
      <div className={styles.yAxis}>
        {yAxisValues.map((value, index) => (
          <span key={index} className={styles.yAxisLabel}>
            {formatValue ? formatValue(value) : value}
          </span>
        ))}
      </div>
      
      {/* Chart area */}
      <div className={styles.chartArea}>
        {/* Grid lines */}
        {gridLines && (
          <div className={styles.gridLines}>
            <div className={`${styles.gridLine} ${styles.bottom25}`}></div>
            <div className={`${styles.gridLine} ${styles.bottom50}`}></div>
            <div className={`${styles.gridLine} ${styles.bottom75}`}></div>
          </div>
        )}
        
        {/* Line and points container */}
        <div className={styles.lineContainer}>
          <svg 
            className={`${styles.chartSvg} ${animate ? styles.animated : ''}`}
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
          >
            {/* Data line */}
            <path
              className={styles.dataLine}
              d={pathString}
              style={{ stroke: lineColor }}
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Data points */}
            {showPoints && dataPoints.map((point, index) => (
              <circle
                key={index}
                className={styles.dataPoint}
                cx={point.xCoord}
                cy={point.yCoord}
                r="0.02"
                style={{ fill: pointColor }}
                onClick={onPointClick ? () => onPointClick(point, index) : undefined}
                tabIndex={onPointClick ? 0 : -1}
                role={onPointClick ? "button" : undefined}
                aria-label={`${point.label}: ${formatValue ? formatValue(point.value) : point.value}`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className={styles.xAxisLabels}>
        {data.map((point, index) => (
          <div key={index} className={styles.xAxisLabel}>
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;