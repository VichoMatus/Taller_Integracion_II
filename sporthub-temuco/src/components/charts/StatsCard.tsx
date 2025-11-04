'use client';

import React, { useState } from 'react';
import styles from './StatsCard.module.css';

// Importar CSS específicos por deporte
import atletismoStyles from './stylesStatsCard/AtletismoStatsCard.module.css';
import futbolStyles from './stylesStatsCard/FutbolStatsCard.module.css';
import skateStyles from './stylesStatsCard/SkateStatsCard.module.css';
import voleibolStyles from './stylesStatsCard/VoleibolStatsCard.module.css';
import tenisStyles from './stylesStatsCard/TenisStatsCard.module.css';
import natacionStyles from './stylesStatsCard/NatacionStatsCard.module.css';
import patinajeStyles from './stylesStatsCard/PatinajeStatsCard.module.css';

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
  sport?: string;
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
  sport,
  onClick,
  className = '',
  loading = false,
  empty = false,
  emptyMessage = 'Sin datos',
  ariaLabel
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Seleccionar el CSS correcto basado en el deporte
  const getStyles = () => {
    switch (sport) {
      case 'atletismo':
        return atletismoStyles;
      case 'futbol':
        return futbolStyles;
      case 'skate':
        return skateStyles;
      case 'voleibol':
        return voleibolStyles;
      case 'tenis':
        return tenisStyles;
      case 'natacion':
        return natacionStyles;
      case 'patinaje':
        return patinajeStyles;
      default:
        return styles;
    }
  };

  const currentStyles = getStyles();

  // Animación del contador
  React.useEffect(() => {
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
    } else if (typeof value === 'number') {
      // Si está cargando o vacío, mostrar el valor directamente
      setDisplayValue(value);
    }
  }, [value, loading, empty]);

  // Color variants para iconos
  // If this card is rendered inside Atletismo pages, avoid yellow icons (use blue instead)
  const effectiveColor = (sport === 'atletismo' && color === 'yellow') ? 'blue' : color;

  const iconColorVariants = {
    blue: currentStyles.iconBlue,
    green: currentStyles.iconGreen,
    red: currentStyles.iconRed,
    purple: currentStyles.iconPurple,
    yellow: currentStyles.iconYellow
  };

  // Skeleton con animación mejorada
  if (loading) {
    return (
      <div className={`${currentStyles.skeletonCard} ${className}`}>
        <div className={currentStyles.cardContent}>
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
      className={`${currentStyles.statsCard} ${onClick ? currentStyles.clickable : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="group"
      aria-label={ariaLabel || title}
    >
      <div className={currentStyles.cardContent}>
        <div>
          <div className={currentStyles.cardTitle}>{title}</div>
          {empty ? (
            <div style={{color: '#9ca3af', fontSize: '14px'}}>{emptyMessage}</div>
          ) : (
            <div className={currentStyles.cardValue}>
              {valueToShow}
            </div>
          )}
          
          {!empty && trend && (
            <div className={currentStyles.trendContainer}>
              {trend.isPositive ? (
                <svg className={`${currentStyles.trendIcon} ${currentStyles.trendPositive}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className={`${currentStyles.trendIcon} ${currentStyles.trendNegative}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={trend.isPositive ? currentStyles.trendPositive : currentStyles.trendNegative}>
                {trend.value}%
              </span>
              <span style={{color: '#6b7280', fontSize: '12px', marginLeft: '4px'}}>vs mes anterior</span>
            </div>
          )}
          
          {!empty && subtitle && (
            <div className={currentStyles.cardSubtitle}>
              {subtitle}
            </div>
          )}
        </div>
        
        <div className={`${currentStyles.cardIcon} ${iconColorVariants[effectiveColor]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;