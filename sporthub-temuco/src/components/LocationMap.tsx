import React from 'react';

// 🔥 IMPORTAR TODOS LOS ESTILOS DE LOS DEPORTES
import basquetbolStyles from './stylesLocationMap/BasquetbolLocationMap.module.css';
import futbolStyles from './stylesLocationMap/FutbolLocationMap.module.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  height?: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel'; // 🔥 AGREGAR PROP SPORT
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  address,
  zoom = 15,
  height = '250px',
  sport = 'basquetbol', // 🔥 VALOR POR DEFECTO
}) => {
  
  // 🔥 FUNCIÓN PARA SELECCIONAR ESTILOS SEGÚN EL DEPORTE
  const getSportStyles = () => {
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        return futbolStyles;
      default:
        return basquetbolStyles; // Fallback
    }
  };

  // 🔥 OBTENER LOS ESTILOS APROPIADOS
  const styles = getSportStyles();

  // 🔥 FUNCIÓN PARA OBTENER EMOJI DEL DEPORTE
  const getSportMapEmoji = () => {
    switch (sport) {
      case 'basquetbol':
        return '🏀';
      case 'futbol':
        return '⚽';
      default:
        return '🏀';
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER NOMBRE DEL DEPORTE
  const getSportName = () => {
    switch (sport) {
      case 'basquetbol':
        return 'Basquetbol';
      case 'futbol':
        return 'Fútbol';
      default:
        return 'Basquetbol';
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER MENSAJE ESPECÍFICO DEL DEPORTE
  const getSportMessage = () => {
    switch (sport) {
      case 'basquetbol':
        return 'Encuentra las mejores canchas de basquetbol cerca de ti';
      case 'futbol':
        return 'Descubre canchas de fútbol en tu zona';
      default:
        return 'Encuentra las mejores canchas de basquetbol cerca de ti';
    }
  };

  const handleImplementClick = () => {
    console.log(`Implementar mapa interactivo para ${getSportName()}`);
    console.log(`Coordenadas: ${latitude}, ${longitude}`);
    console.log(`Deporte: ${sport}`);
  };

  return (
    <div className={styles.mapContainer} data-sport={sport}>
      <div className={styles.mapPlaceholder} style={{ height }}>
        <div className={styles.mapIcon}>
          {getSportMapEmoji()} 🗺️
        </div>
        <h3 className={styles.mapTitle}>
          Mapa de Canchas - {getSportName()}
        </h3>
        <p className={styles.mapMessage}>
          {getSportMessage()}
        </p>
        {address && (
          <p className={styles.addressInfo}>
            📍 {address}
          </p>
        )}
        <div className={styles.coordsInfo}>
          <span>Lat: {latitude.toFixed(4)}</span>
          <span>Lng: {longitude.toFixed(4)}</span>
          <span>Zoom: {zoom}x</span>
        </div>
        <button 
          className={styles.implementButton}
          onClick={handleImplementClick}
        >
          Ver mapa interactivo {getSportMapEmoji()}
        </button>
      </div>
    </div>
  );
};

export default LocationMap;