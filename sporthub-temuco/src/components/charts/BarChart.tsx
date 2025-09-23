'use client';

import React, { useState } from 'react';
import styles from './BarChart.module.css';

interface DataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataItem[];
  title?: string;
  height?: string;
  className?: string;
  showValues?: boolean;
  maxValue?: number;
  primaryColor?: string;
  animate?: boolean;
  emptyMessage?: string;
  ariaLabel?: string;
  loading?: boolean;
  formatValue?: (value: number) => string | number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 'h-60',
  className = '',
  showValues = true,
  maxValue,
  primaryColor = '#3b82f6',
  animate = true,
  emptyMessage = 'Sin datos disponibles',
  ariaLabel = 'Gráfico de barras',
  loading = false,
  formatValue
}) => {
  
  // Calcular valor máximo
  const calculatedMax = maxValue || Math.max(...data.map(item => item.value), 0);
  const yAxisMax = calculatedMax || 40;

  // Loading skeleton
  if (loading) {
    return (
      <div className={`w-full ${className}`} aria-busy="true" aria-live="polite">
        {title && <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>}
        <div className={`${height} flex items-end gap-2`}> 
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 flex flex-col items-center"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div 
                className={`w-full ${styles.skeletonBar}`}
                style={{ 
                  height: `${20 + (i % 5) * 10}%`,
                  animationDelay: `${i * 0.2}s`
                }} 
              />
              <div className="w-full h-1 bg-gray-100 mt-1 rounded animate-pulse" />
              <span 
                className={`text-xs text-gray-400 mt-2 block w-6 h-3 bg-gray-100 rounded ${styles.skeletonLabel}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} role="group" aria-label={ariaLabel}>
      <div className={styles.chartContainer}>
        {/* Y-axis */}
        <div className={styles.yAxis}>
          <span className={styles.yAxisLabel}>{yAxisMax}</span>
          <span className={styles.yAxisLabel}>{Math.round(yAxisMax * 0.75)}</span>
          <span className={styles.yAxisLabel}>{Math.round(yAxisMax * 0.5)}</span>
          <span className={styles.yAxisLabel}>{Math.round(yAxisMax * 0.25)}</span>
          <span className={styles.yAxisLabel}>0</span>
        </div>
        
        {/* Chart area */}
        <div className={styles.chartArea}>
          {/* Horizontal grid lines */}
          <div className={styles.gridLines}>
            <div className={`${styles.gridLine} ${styles.bottom25}`}></div>
            <div className={`${styles.gridLine} ${styles.bottom50}`}></div>
            <div className={`${styles.gridLine} ${styles.bottom75}`}></div>
          </div>
          
          {/* Bars */}
          <div className={styles.barsContainer}>
            {data.map((item, index) => {
              const heightPercent = (item.value / yAxisMax) * 100;
              return (
                <div 
                  key={index} 
                  className={styles.barWrapper}
                >
                  <div 
                    className={styles.bar}
                    style={{ 
                      height: `${heightPercent}%`
                    }}
                    role="img"
                    aria-label={`${item.label}: ${item.value}`}
                  >
                    {/* Valor encima de la barra */}
                    {showValues && (
                      <div className={styles.barValue}>
                        {formatValue ? formatValue(item.value) : item.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className={styles.xAxisLabels}>
          {data.map((item, index) => (
            <div key={index} className={styles.xAxisLabel}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
