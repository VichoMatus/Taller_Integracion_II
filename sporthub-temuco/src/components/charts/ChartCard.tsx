'use client';

import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  actions?: React.ReactNode;
  loading?: boolean;        // Skeleton state
  empty?: boolean;          // Empty state indicator
  emptyMessage?: string;    // Message for empty state
  ariaLabel?: string;       // Accessibility label
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  height = 'h-80',
  actions,
  loading = false,
  empty = false,
  emptyMessage = 'Sin datos',
  ariaLabel
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`} role="group" aria-label={ariaLabel || title}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      <div className={`${height} w-full relative`}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center" aria-busy="true">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : empty ? (
          <div className="flex items-center justify-center w-full h-full text-sm text-gray-500" role="note">{emptyMessage}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
