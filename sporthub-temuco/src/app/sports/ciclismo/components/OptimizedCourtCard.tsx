import React, { memo } from 'react';
import CourtCard from '../../../../components/charts/CourtCard';

// Optimización: Componente memoizado para las cards del carousel
const OptimizedCourtCard = memo(({ court, sport, onClick }: {
  court: any;
  sport: string;
  onClick: () => void;
}) => {
  return (
    <CourtCard
      {...court}
      sport={sport}
      onClick={onClick}
    />
  );
});

OptimizedCourtCard.displayName = 'OptimizedCourtCard';

export default OptimizedCourtCard;