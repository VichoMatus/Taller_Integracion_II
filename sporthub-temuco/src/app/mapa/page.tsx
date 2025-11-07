'use client';

import React, { useState, useEffect, useRef  } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/SearchBar';
//import LocationMap from '../../components/LocationMap';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import styles from './page.module.css';
import { map } from 'zod';

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
   /**
   * Refs para el mapa y sus marcadores.
   *
   * - mapRef se asigna al contenedor del div donde se renderiza Google Maps.
   * - mapInstanceRef guarda la instancia de google.maps.Map una vez cargado el script.
   * - markersRef mantiene una lista de marcadores activos para poder limpiarlos cuando cambian los filtros.
   */
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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
    // Geocodificamos el término de búsqueda para centrar el mapa en la dirección o nombre ingresado.
    if (!searchTerm.trim()) return;
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      const { google } = window as any;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchTerm }, (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
          setZoom(15);
        }
      });
    }
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

  /**
   * Efecto para cargar el script de Google Maps e inicializar el mapa.
   */
  useEffect(() => {
    // Inicializa el mapa cuando el script está listo
    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current && typeof window !== 'undefined' && (window as any).google) {
        const { google } = window as any;
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
        });
      }
    };
    // Crear nuevos marcadores
  // Crear nuevos marcadores
  filteredComplejos.forEach((complejo) => {
    const marker = new google.maps.Marker({
      position: complejo.coordenadas as any,
      // Forzamos el tipo a 'any' para que TS acepte el valor
      map: map as any,
      title: complejo.nombre,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div><strong>${complejo.nombre}</strong><br/>${complejo.direccion}</div>`,
    });

    marker.addListener('click', () => {
      handleComplexClick(complejo);
      // También aquí usamos 'map as any' para que TS no marque error
      infoWindow.open(map as any, marker);
    });

    markersRef.current.push(marker);
  });


     // Si ya hay una instancia de google cargada
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }
    // Insertar el script de Google Maps si no existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = initMap;
    } else {
      existingScript.addEventListener('load', initMap);
    }
    // Limpiar marcadores al desmontar
    return () => {
      markersRef.current.forEach((marker: any) => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  /**
   * Efecto para actualizar centro y zoom del mapa al cambiar el estado.
   */
  useEffect(() => {
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      map.setCenter(mapCenter);
      map.setZoom(zoom);
    }
  }, [mapCenter, zoom]);

  /**
   * Efecto para dibujar los marcadores cuando cambian los complejos filtrados.
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !(window as any).google) return;
    const { google } = window as any;
    // Quitar marcadores existentes
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];
    // Crear nuevos marcadores
    filteredComplejos.forEach((complejo) => {
      const marker = new google.maps.Marker({
        position: complejo.coordenadas,
        map: map,
        title: complejo.nombre,
      });
      marker.addListener('click', () => {
        handleComplexClick(complejo);
      });
      markersRef.current.push(marker);
    });
  }, [filteredComplejos]);

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
              sport="index"
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

            <div
              ref={mapRef}
              style={{ width: '100%', height: '600px' }}
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