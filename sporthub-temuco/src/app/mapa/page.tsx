'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/SearchBar';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import styles from './page.module.css';

// 🗺️ INTERFAZ PARA COMPLEJOS DEPORTIVOS
interface ComplejoDeportivo {
  id: number;
  nombre: string;
  direccion: string;
  coordenadas: { lat: number; lng: number };
  deportes: string[];
  telefono: string;
  horario: string;
  calificacion: number;
  precio: string;
}

// 🗺️ DATOS DE EJEMPLO PARA COMPLEJOS DEPORTIVOS
const complejosDeportivos: ComplejoDeportivo[] = [
  {
    id: 1,
    nombre: "Complejo Deportivo Norte",
    direccion: "Camino Las Mariposas 03395, Temuco",
    coordenadas: { lat: -38.7197942, lng: -72.6784801 },
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
    coordenadas: { lat: -38.729646, lng: -72.6061522 },
    deportes: ["Pádel", "Voleibol", "Karting"],
    telefono: "(45) 555-5678",
    horario: "7:00 - 22:00",
    calificacion: 4.2,
    precio: "$12.000 - $30.000"
  },
  {
    id: 3,
    nombre: "Polideportivo Sur",
    direccion: "Villa Olímpica casa Hernán",
    coordenadas: { lat: -38.726129, lng: -72.5850935 },
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
  
  // 🗺️ REFS
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // 🗺️ ESTADOS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('Todos los deportes');
  const [selectedComplex, setSelectedComplex] = useState<ComplejoDeportivo | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -38.7359, lng: -72.5904 }); // Temuco centro
  const [zoom, setZoom] = useState(13);
  const [filteredComplejos, setFilteredComplejos] = useState<ComplejoDeportivo[]>(complejosDeportivos);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 🗺️ EFECTO: Cargar Google Maps Script e inicializar el mapa
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) {
        console.warn('⚠️ [MapaPage] mapRef.current no existe');
        return;
      }

      if (mapInstanceRef.current) {
        console.log('ℹ️ [MapaPage] El mapa ya está inicializado');
        return;
      }

      if (typeof window === 'undefined') {
        console.warn('⚠️ [MapaPage] window no disponible');
        return;
      }

      if (!(window as any).google || !(window as any).google.maps) {
        console.warn('⚠️ [MapaPage] Google Maps API no disponible aún');
        setTimeout(() => initMap(), 500);
        return;
      }

      const { google } = window as any;
      
      console.log('🗺️ [MapaPage] Inicializando mapa de Google Maps');
      console.log('📍 Centro inicial:', mapCenter);
      console.log('🔍 Zoom inicial:', zoom);

      try {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        
        console.log('✅ [MapaPage] Mapa inicializado correctamente');
        setIsMapLoaded(true);
        
        // Dibujar marcadores iniciales
        drawMarkers();
      } catch (error: any) {
        console.error('❌ [MapaPage] Error inicializando mapa:', error);
      }
    };

    // Si ya hay una instancia de google cargada
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      console.log('ℹ️ [MapaPage] Google Maps ya está cargado');
      initMap();
      return;
    }

    // Insertar el script de Google Maps si no existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      console.log('📦 [MapaPage] Cargando script de Google Maps...');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4';
      console.log('🔑 Usando API Key:', apiKey.substring(0, 20) + '...');
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ [MapaPage] Script de Google Maps cargado exitosamente');
        initMap();
      };
      
      script.onerror = () => {
        console.error('❌ [MapaPage] Error cargando script de Google Maps');
      };
      
      document.body.appendChild(script);
    } else {
      console.log('ℹ️ [MapaPage] Script de Google Maps ya existe');
      existingScript.addEventListener('load', initMap);
      initMap();
    }

    return () => {
      markersRef.current.forEach((marker: any) => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // 🗺️ EFECTO: Actualizar centro y zoom del mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.setCenter(mapCenter);
    map.setZoom(zoom);
  }, [mapCenter, zoom]);

  // 🗺️ FUNCIÓN: Dibujar marcadores en el mapa
  const drawMarkers = () => {
    if (!mapInstanceRef.current) {
      console.warn('⚠️ [MapaPage] mapInstanceRef.current no existe');
      return;
    }

    if (!isMapLoaded) {
      console.warn('⚠️ [MapaPage] El mapa aún no está cargado');
      return;
    }

    if (typeof window === 'undefined' || !(window as any).google) {
      console.warn('⚠️ [MapaPage] Google Maps no disponible');
      return;
    }

    const map = mapInstanceRef.current;
    const { google } = window as any;

    console.log(`🗺️ [MapaPage] Dibujando ${filteredComplejos.length} marcadores`);

    // Quitar marcadores existentes
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    // Crear marcadores para cada complejo
    filteredComplejos.forEach((complejo, idx) => {
      console.log(`📌 Creando marcador ${idx + 1}: ${complejo.nombre}`);
      console.log(`   Coordenadas: Lat=${complejo.coordenadas.lat}, Lng=${complejo.coordenadas.lng}`);

      try {
        const marker = new google.maps.Marker({
          position: complejo.coordenadas,
          map: map,
          title: complejo.nombre,
          animation: google.maps.Animation.DROP,
        });

        // Crear InfoWindow con información del complejo
        const infoContent = `
          <div style="padding: 12px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${complejo.nombre}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${complejo.direccion}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">📞 ${complejo.telefono}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">⏰ ${complejo.horario}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">⭐ ${complejo.calificacion}/5</p>
            <div style="margin-top: 8px;">
              ${complejo.deportes.map(d => `<span style="display: inline-block; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px;">${d}</span>`).join('')}
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener('click', () => {
          console.log('🔍 Click en marcador:', complejo.nombre);
          // Cerrar otros InfoWindows
          markersRef.current.forEach((m: any) => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });

          infoWindow.open(map, marker);
          handleComplexClick(complejo);
          map.panTo(complejo.coordenadas);
          map.setZoom(16);
        });

        // Guardar referencia al InfoWindow en el marker
        (marker as any).infoWindow = infoWindow;

        markersRef.current.push(marker);
        console.log(`✅ Marcador ${idx + 1} creado exitosamente`);
      } catch (error: any) {
        console.error(`❌ Error creando marcador para ${complejo.nombre}:`, error);
      }
    });

    console.log(`✅ [MapaPage] Total de ${markersRef.current.length} marcadores dibujados`);
  };

  // 🗺️ EFECTO: Redibujar marcadores cuando cambian los complejos filtrados
  useEffect(() => {
    if (isMapLoaded) {
      drawMarkers();
    }
  }, [filteredComplejos, isMapLoaded]);

  // 🗺️ FUNCIONES DE CONTROL DEL MAPA
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1));
  };

  // 🗺️ EFECTO: Filtrar complejos
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
    // Buscar en los complejos filtrados
    if (!searchTerm.trim()) return;
    
    const found = filteredComplejos.find(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (found) {
      handleComplexClick(found);
    }
  };

  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  const handleComplexClick = (complejo: ComplejoDeportivo) => {
    console.log('🔍 [MapaPage] Complejo seleccionado:', complejo);
    setSelectedComplex(complejo);
    setMapCenter(complejo.coordenadas);
    setZoom(16);
  };

  const handleDirections = (complejo: ComplejoDeportivo) => {
    const query = encodeURIComponent(complejo.direccion);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleReserve = (complejo: ComplejoDeportivo) => {
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
                    ? (filteredComplejos.reduce((acc, c) => acc + (c.calificacion || 0), 0) / filteredComplejos.length).toFixed(1)
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
                onClick={handleZoomIn}
                title="Acercar"
              >
                ➕
              </button>
              <button 
                className={styles.mapControl}
                onClick={handleZoomOut}
                title="Alejar"
              >
                ➖
              </button>
            </div>
            
            <div 
              ref={mapRef} 
              style={{ 
                width: '100%', 
                height: '600px',
                borderRadius: '8px',
                overflow: 'hidden'
              }} 
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