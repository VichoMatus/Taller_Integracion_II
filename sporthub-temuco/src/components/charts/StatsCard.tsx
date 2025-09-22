'use client';

import React, { useState } from 'react';
import styles from './StatsCard.module.css';

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
  loading?: boolean;               // Skeleton loading
  empty?: boolean;                 // Mostrar estado vacío (sin datos)
  emptyMessage?: string;           // Mensaje cuando no hay datos
  ariaLabel?: string;              // Accesibilidad para el card
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'blue',
  onClick,
  className = '',
  loading = false,
  empty = false,
  emptyMessage = 'Sin datos',
  ariaLabel
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animación del contador
  useState(() => {
    if (typeof value === 'number' && !loading && !empty) {
      let start = 0;
      const end = value;
      const duration = 1000; // 1 segundo
      const increment = end / (duration / 16); // 60fps
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  });

  // Color variants para iconos
  const iconColorVariants = {
    blue: styles.iconBlue,
    green: styles.iconGreen,
    red: styles.iconRed,
    purple: styles.iconPurple,
    yellow: styles.iconYellow
  };

  // Skeleton con animación mejorada
  if (loading) {
    return (
      <div className={`${styles.skeletonCard} ${className}`}>
        <div className={styles.cardContent}>
          <div>
            <div style={{height: '16px', width: '120px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '12px'}} />
            <div style={{height: '24px', width: '80px', backgroundColor: '#d1d5db', borderRadius: '4px', marginBottom: '8px'}} />
            <div style={{height: '12px', width: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px'}} />
          </div>
          <div style={{width: '48px', height: '48px', backgroundColor: '#e5e7eb', borderRadius: '50%'}} />
        </div>
      </div>
    );
  }

  // Obtener valor para mostrar
  const valueToShow = typeof value === 'number' ? displayValue : value;

  return (
    <div
      className={`${styles.statsCard} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="group"
      aria-label={ariaLabel || title}
    >
      <div className={styles.cardContent}>
        <div>
          <div className={styles.cardTitle}>{title}</div>
          {empty ? (
            <div style={{color: '#9ca3af', fontSize: '14px'}}>{emptyMessage}</div>
          ) : (
            <div className={styles.cardValue}>
              {valueToShow}
            </div>
          )}
          
          {!empty && trend && (
            <div className={styles.trendContainer}>
              {trend.isPositive ? (
                <svg className={`${styles.trendIcon} ${styles.trendPositive}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className={`${styles.trendIcon} ${styles.trendNegative}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={trend.isPositive ? styles.trendPositive : styles.trendNegative}>
                {trend.value}%
              </span>
              <span style={{color: '#6b7280', fontSize: '12px', marginLeft: '4px'}}>vs mes anterior</span>
            </div>
          )}
          
          {!empty && subtitle && (
            <div className={styles.cardSubtitle}>
              {subtitle}
            </div>
          )}
        </div>
        
        <div className={`${styles.cardIcon} ${iconColorVariants[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;