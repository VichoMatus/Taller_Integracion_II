'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/SearchBar';
import LocationMap from '../../components/LocationMap';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import styles from './page.module.css';

// 🗺️ DATOS DE EJEMPLO PARA COMPLEJOS DEPORTIVOS
const complejosDeportivos = [
  {
    id: 1,
    nombre: "Complejo Deportivo Norte",
    direccion: "Av. Alemania 1234, Temuco",
    coordenadas: { lat: -38.7300, lng: -72.5850 },
    deportes: ["Fútbol", "Básquetbol", "Tenis"],
    telefono: "(45) 555-1234",
    horario: "6:00 - 23:00",
    calificacion: 4.5,
    precio: "$15.000 - $25.000"
  },
  {
    id: 2,
    nombre: "Centro Deportivo Los Aromos",
    direccion: "Pedro de Valdivia 567, Temuco",
    coordenadas: { lat: -38.7400, lng: -72.5950 },
    deportes: ["Pádel", "Voleibol", "Karting"],
    telefono: "(45) 555-5678",
    horario: "7:00 - 22:00",
    calificacion: 4.2,
    precio: "$12.000 - $30.000"
  },
  {
    id: 3,
    nombre: "Polideportivo Sur",
    direccion: "Calle Montt 890, Temuco",
    coordenadas: { lat: -38.7500, lng: -72.6000 },
    deportes: ["Atletismo", "Natación", "Escalada"],
    telefono: "(45) 555-9012",
    horario: "5:30 - 23:30",
    calificacion: 4.8,
    precio: "$10.000 - $35.000"
  }
];

// 🗺️ TIPOS DE FILTROS
const tiposDeporte = [
  "Todos los deportes",
  "Fútbol",
  "Básquetbol", 
  "Tenis",
  "Pádel",
  "Voleibol",
  "Karting",
  "Atletismo",
  "Natación",
  "Escalada"
];

export default function MapaPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps } = useAuthStatus();
  
  // 🗺️ ESTADOS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('Todos los deportes');
  const [selectedComplex, setSelectedComplex] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -38.7359, lng: -72.5904 }); // Temuco centro
  const [zoom, setZoom] = useState(13);
  const [filteredComplejos, setFilteredComplejos] = useState(complejosDeportivos);

  // 🗺️ FILTRAR COMPLEJOS
  useEffect(() => {
    let filtered = complejosDeportivos;

    // Filtrar por deporte
    if (selectedSport !== 'Todos los deportes') {
      filtered = filtered.filter(complejo => 
        complejo.deportes.includes(selectedSport)
      );
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(complejo =>
        complejo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complejo.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complejo.deportes.some(deporte => 
          deporte.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredComplejos(filtered);
  }, [selectedSport, searchTerm]);

  // 🗺️ HANDLERS
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    console.log('Buscando:', searchTerm);
  };

  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  const handleComplexClick = (complejo: any) => {
    setSelectedComplex(complejo);
    setMapCenter(complejo.coordenadas);
    setZoom(15);
  };

  const handleDirections = (complejo: any) => {
    const query = encodeURIComponent(complejo.direccion);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleReserve = (complejo: any) => {
    if (isAuthenticated) {
      router.push(`/sports/reservacancha?complejoId=${complejo.id}`);
    } else {
      alert('Debes iniciar sesión para hacer una reserva');
      router.push('/login');
    }
  };

  const resetMap = () => {
    setSelectedComplex(null);
    setMapCenter({ lat: -38.7359, lng: -72.5904 });
    setZoom(13);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🗺️</div>
            <h1 className={styles.headerTitle}>Mapa de Complejos Deportivos</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Buscar complejos, direcciones..."
              sport="basquetbol"
            />
            <button 
              className={styles.userButton}
              onClick={handleUserButtonClick}
              disabled={buttonProps.disabled}
            >
              <span>👤</span>
              <span>{buttonProps.text}</span>
            </button>
          </div>
        </div>

        {/* 🗺️ FILTROS */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar por deporte</h3>
          <div className={styles.sportFilters}>
            {tiposDeporte.map((deporte) => (
              <button
                key={deporte}
                className={`${styles.sportFilter} ${
                  selectedSport === deporte ? styles.sportFilterActive : ''
                }`}
                onClick={() => setSelectedSport(deporte)}
              >
                {deporte}
              </button>
            ))}
          </div>
          
          {/* 🗺️ STATS */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🏟️</span>
              <div>
                <span className={styles.statNumber}>{filteredComplejos.length}</span>
                <span className={styles.statLabel}>Complejos encontrados</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🏃‍♂️</span>
              <div>
                <span className={styles.statNumber}>
                  {new Set(filteredComplejos.flatMap(c => c.deportes)).size}
                </span>
                <span className={styles.statLabel}>Deportes disponibles</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>⭐</span>
              <div>
                <span className={styles.statNumber}>
                  {filteredComplejos.length > 0 
                    ? (filteredComplejos.reduce((acc, c) => acc + c.calificacion, 0) / filteredComplejos.length).toFixed(1)
                    : '0'
                  }
                </span>
                <span className={styles.statLabel}>Calificación promedio</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🗺️ CONTENEDOR PRINCIPAL */}
        <div className={styles.mapContainer}>
          {/* Mapa */}
          <div className={styles.mapSection}>
            <div className={styles.mapControls}>
              <button 
                className={styles.mapControl}
                onClick={resetMap}
                title="Centrar mapa"
              >
                🎯 Centrar
              </button>
              <button 
                className={styles.mapControl}
                onClick={() => setZoom(zoom + 1)}
                title="Acercar"
              >
                ➕
              </button>
              <button 
                className={styles.mapControl}
                onClick={() => setZoom(zoom - 1)}
                title="Alejar"
              >
                ➖
              </button>
            </div>
            
            <LocationMap
              latitude={mapCenter.lat}
              longitude={mapCenter.lng}
              address="Temuco, Chile"
              zoom={zoom}
              height="600px"
              sport="basquetbol"
            />
          </div>

          {/* Lista de complejos */}
          <div className={styles.complexList}>
            <h3 className={styles.listTitle}>
              Complejos Deportivos 
              {selectedSport !== 'Todos los deportes' && (
                <span className={styles.filterIndicator}>- {selectedSport}</span>
              )}
            </h3>
            
            {filteredComplejos.length === 0 ? (
              <div className={styles.noResults}>
                <span className={styles.noResultsIcon}>🔍</span>
                <p>No se encontraron complejos con los filtros seleccionados</p>
                <button 
                  className={styles.resetFiltersButton}
                  onClick={() => {
                    setSelectedSport('Todos los deportes');
                    setSearchTerm('');
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={styles.complexCards}>
                {filteredComplejos.map((complejo) => (
                  <div 
                    key={complejo.id}
                    className={`${styles.complexCard} ${
                      selectedComplex?.id === complejo.id ? styles.complexCardSelected : ''
                    }`}
                    onClick={() => handleComplexClick(complejo)}
                  >
                    <div className={styles.complexHeader}>
                      <h4 className={styles.complexName}>{complejo.nombre}</h4>
                      <div className={styles.complexRating}>
                        <span>⭐</span>
                        <span>{complejo.calificacion}</span>
                      </div>
                    </div>
                    
                    <div className={styles.complexInfo}>
                      <div className={styles.complexDetail}>
                        <span className={styles.complexDetailIcon}>📍</span>
                        <span>{complejo.direccion}</span>
                      </div>
                      <div className={styles.complexDetail}>
                        <span className={styles.complexDetailIcon}>⏰</span>
                        <span>{complejo.horario}</span>
                      </div>
                      <div className={styles.complexDetail}>
                        <span className={styles.complexDetailIcon}>📞</span>
                        <span>{complejo.telefono}</span>
                      </div>
                      <div className={styles.complexDetail}>
                        <span className={styles.complexDetailIcon}>💰</span>
                        <span>{complejo.precio}</span>
                      </div>
                    </div>

                    <div className={styles.complexSports}>
                      {complejo.deportes.map((deporte, index) => (
                        <span key={index} className={styles.sportTag}>
                          {deporte}
                        </span>
                      ))}
                    </div>

                    <div className={styles.complexActions}>
                      <button 
                        className={styles.directionsButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirections(complejo);
                        }}
                      >
                        🧭 Direcciones
                      </button>
                      <button 
                        className={styles.reserveButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReserve(complejo);
                        }}
                      >
                        📅 {isAuthenticated ? 'Reservar' : 'Iniciar sesión'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🗺️ INFORMACIÓN ADICIONAL */}
        <div className={styles.infoSection}>
          <div className={styles.helpCard}>
            <div className={styles.helpHeader}>
              <span className={styles.helpIcon}>💡</span>
              <h3>¿Cómo usar el mapa?</h3>
            </div>
            <ul className={styles.helpList}>
              <li>Usa los filtros para encontrar complejos por deporte</li>
              <li>Haz clic en un complejo para verlo en el mapa</li>
              <li>Usa los controles del mapa para acercar/alejar</li>
              <li>{isAuthenticated 
                  ? 'Haz clic en "Reservar" para hacer una reserva' 
                  : 'Inicia sesión para poder hacer reservas'
                }
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}