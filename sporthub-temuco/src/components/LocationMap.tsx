import React from 'react';
import basquetStyles from './stylesLocationMap/BasquetbolLocationMap.module.css';
import atletismoStyles from './stylesLocationMap/AtletismoLocationMap.module.css';
import skateStyles from './stylesLocationMap/SkateLocationMap.module.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  height?: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'atletismo' | 'skate';
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  address,
  zoom = 15,
  height = '250px',
  sport = 'basquetbol'
}) => {
  const styles = sport === 'atletismo' ? atletismoStyles : sport === 'skate' ? skateStyles : basquetStyles;
  const handleImplementClick = () => {
    console.log('Implementar mapa interactivo');
    // Aquí puedes agregar la lógica para implementar el mapa real
  };

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapPlaceholder}>
        <div className={styles.mapIcon}>🗺️</div>
        <h3 className={styles.mapTitle}>Mapa de Ubicaciones</h3>
        <p className={styles.mapMessage}>
          Mapa interactivo en desarrollo
        </p>
        <button 
          className={styles.implementButton}
          onClick={handleImplementClick}
        >
          Ver próximamente
        </button>
      </div>
    </div>
  );
};

export default LocationMap;