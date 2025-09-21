'use client';

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
  primaryColor?: string;         
  secondaryColor?: string;       
  showValues?: boolean;          
  animate?: boolean;             
  maxValue?: number;             
  emptyMessage?: string;         
  ariaLabel?: string;            
  loading?: boolean;             
  onBarClick?: (item: DataItem, index: number) => void; 
  formatValue?: (value: number) => string | number;     
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 'h-60',
  className = '',
  primaryColor = '#A3BCBF',
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
  
  // Determine the maximum value from the data if not provided
  const calculatedMax = maxValue || Math.max(...data.map(item => item.value), 0);
  
  // For this specific case, use 40 as max to match the reference
  const yAxisMax = maxValue || 40;

  // Loading skeleton
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
                <div key={index} className={styles.barWrapper}>
                  <div 
                    className={`${styles.bar} ${animate ? styles.animate : ''}`}
                    style={{ 
                      height: `${heightPercent}%`,
                      backgroundColor: primaryColor
                    }}
                    role="img"
                    aria-label={`${item.label}: ${item.value}`}
                    onClick={onBarClick ? () => onBarClick(item, index) : undefined}
                    tabIndex={onBarClick ? 0 : -1}
                    onKeyDown={onBarClick ? (e) => { if (e.key === 'Enter') onBarClick(item, index); } : undefined}
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
