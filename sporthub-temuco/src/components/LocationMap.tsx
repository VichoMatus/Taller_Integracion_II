import React from 'react';
import styles from './stylesLocationMap/BasquetbolLocationMap.module.css';

const LocationMap: React.FC = () => {
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