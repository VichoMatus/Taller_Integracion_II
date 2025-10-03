import React from 'react';
import basquetStyles from './stylesLocationMap/BasquetbolLocationMap.module.css';
import atletismoStyles from './stylesLocationMap/AtletismoLocationMap.module.css';
import skateStyles from './stylesLocationMap/SkateLocationMap.module.css';
import ciclismoStyles from './stylesLocationMap/CiclismoLocationMap.module.css';

// 🔥 IMPORTAR TODOS LOS ESTILOS DE LOS DEPORTES
import basquetbolStyles from './stylesLocationMap/BasquetbolLocationMap.module.css';
import futbolStyles from './stylesLocationMap/FutbolLocationMap.module.css';
import padelStyles from './stylesLocationMap/PadelLocationMap.module.css';
import tenisStyles from './stylesLocationMap/TenisLocationMap.module.css';
import crossfitentrenamientofuncionalStyles from './stylesLocationMap/CrossfitEntrenamientoFuncionalLocationMap.module.css';
import voleiStyles from './stylesLocationMap/VoleibolLocationMap.module.css';
import natacionStyles from './stylesLocationMap/NatacionLocationMap.module.css';
import patinajeStyles from './stylesLocationMap/PatinajeLocationMap.module.css';
import escaladaStyles from './stylesLocationMap/EscaladaLocationMap.module.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  height?: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje' | 'escalada' | 'atletismo' | 'skate' | 'ciclismo' | 'karting';
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  address,
  zoom = 15,
  height = '250px',
  sport = 'basquetbol'
}) => {
  const styles = sport === 'atletismo' ? atletismoStyles : 
                 sport === 'skate' ? skateStyles : 
                 sport === 'ciclismo' ? ciclismoStyles : 
                 basquetStyles;
  
  // 🔥 FUNCIÓN PARA SELECCIONAR ESTILOS SEGÚN EL DEPORTE
  const getSportStyles = () => {
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        return futbolStyles;
      case 'padel':
        return padelStyles;
      case 'tenis':
        return tenisStyles;
      case 'voleibol':
        return voleiStyles;
      case 'crossfitentrenamientofuncional':
        return crossfitentrenamientofuncionalStyles;
      case 'natacion':
        return natacionStyles;
      case 'patinaje':
        return patinajeStyles;
      case 'escalada':
        return escaladaStyles;
      // case 'tenis':
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
      case 'padel':
        return '🏓';
      case 'tenis':
        return '🎾';
      case 'voleibol':
        return '🏐';
      case 'crossfitentrenamientofuncional':
        return '🏋️‍♂️';
      case 'natacion':
        return '🏊‍♂️';
      case 'patinaje':
        return '⛸️';
      case 'escalada':
        return '🧗‍♂️';
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
      case 'padel':
        return 'Pádel';
      case 'tenis':
        return 'Tenis';
      case 'voleibol':
        return 'Voleibol';
      case 'crossfitentrenamientofuncional':
        return 'Crossfit Entrenamiento Funcional';
      case 'natacion':
        return 'Natación';
      case 'patinaje':
        return 'Patinaje';
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
      case 'tenis':
        return 'Explora las mejores canchas de tenis en tu área';
      case 'voleibol':
        return 'Descubre las mejores canchas de voleibol en tu zona';
      case 'padel':
        return 'Encuentra las mejores canchas de pádel cerca de ti';
      case 'crossfitentrenamientofuncional':
        return 'Descubre gimnasios de CrossFit y entrenamiento funcional en tu zona';
      case 'natacion':
        return 'Encuentra las mejores piscinas y centros de natación cerca de ti';
      case 'patinaje':
        return 'Encuentra las mejores pistas de patinaje cerca de ti';
      default:
        return 'Encuentra las mejores instalaciones deportivas cerca de ti';
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