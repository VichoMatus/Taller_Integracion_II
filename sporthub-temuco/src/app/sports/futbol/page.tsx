'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useCanchasSport } from '@/hooks/useCanchasSport'; // 🔥 HOOK OPTIMIZADO PARA DEPORTES
import { complejosService } from '@/services/complejosService'; // 🔥 SERVICIO DE COMPLEJOS
import styles from './page.module.css';

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE FÚTBOL
const footballStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "15",
    icon: "⚽",
    subtitle: "Listas para reservar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$20-40",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 7, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.5⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.2, isPositive: true }
  },
  {
    title: "Jugadores en Cancha",
    value: "22",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 8, isPositive: true }
  }
];

export default function FutbolPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);
  const [complejos, setComplejos] = useState<any[]>([]); // 🔥 ESTADO PARA COMPLEJOS
  const [loadingComplejos, setLoadingComplejos] = useState(true); // 🔥 ESTADO PARA LOADING
  const mapInstanceRef = useRef<any>(null); // 🔥 REF PARA EL MAPA
  const markersRef = useRef<any[]>([]); // 🔥 REF PARA LOS MARCADORES

  // 🔥 Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🔥 USAR NUEVO HOOK OPTIMIZADO PARA DEPORTES
  const {
    canchas,
    loading: loadingCanchas,
    error: errorCanchas
  } = useCanchasSport({
    deporte: 'futbol',
    deportesRelacionados: ['futsal', 'futbolito'],
    fallbackComplejos: {
      1: {
        nombre: "Complejo Deportivo Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Complejo Deportivo Centro",
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Complejo Deportivo Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      }
    }
  });

  // 🔥 CARGAR COMPLEJOS CON COORDENADAS
  useEffect(() => {
    const loadComplejos = async () => {
      try {
        setLoadingComplejos(true);
        console.log('📍 Cargando complejos...');
        
        // Obtener todos los complejos del backend
        const response = await complejosService.getComplejos();
        console.log('✅ Respuesta bruta de complejos:', response);
        console.log('📋 Tipo de respuesta:', typeof response);
        
        // Extraer array de complejos - más robusto
        let complejosArray = [];
        if (Array.isArray(response)) {
          complejosArray = response;
        } else if (response?.data && Array.isArray(response.data)) {
          complejosArray = response.data;
        } else if (response?.items && Array.isArray(response.items)) {
          complejosArray = response.items;
        } else {
          console.warn('⚠️ Estructura de respuesta no reconocida:', response);
          complejosArray = [];
        }
        
        setComplejos(complejosArray);
        
        console.log('📋 Total de complejos:', complejosArray.length);
        complejosArray.forEach((c: any, idx: number) => {
          console.log(`[${idx}] Nombre: ${c.nombre}, Lat: ${c.latitud}, Lng: ${c.longitud}, Dir: ${c.direccion}`);
        });
      } catch (error: any) {
        console.error('❌ Error cargando complejos:', error);
        console.error('   Error message:', error.message);
        console.error('   Error details:', error);
        setComplejos([]);
      } finally {
        setLoadingComplejos(false);
      }
    };

    loadComplejos();
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    const calculateCardsToShow = () => {
      const screenWidth = window.innerWidth;
      const cardWidth = 320;
      const gap = 20;
      const sidebarWidth = 240;
      const padding = 40;
      
      const availableWidth = screenWidth - sidebarWidth - padding;
      return Math.max(1, Math.min(4, Math.floor(availableWidth / (cardWidth + gap))));
    };

    setCardsToShow(calculateCardsToShow());

    const handleResize = () => {
      setCardsToShow(calculateCardsToShow());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 🔥 EFECTO: INICIALIZAR MAPA CON MARCADORES DE COMPLEJOS
  useEffect(() => {
    if (!isClient) return;

    const initMapWithMarkers = () => {
      const mapElement = document.getElementById('futbol-complejos-map');
      if (!mapElement) {
        console.warn('⚠️ No se encontró elemento del mapa');
        return;
      }

      if (typeof window === 'undefined' || !(window as any).google) {
        console.warn('⚠️ Google Maps no está disponible aún');
        if (!(window as any).google) {
          setTimeout(() => initMapWithMarkers(), 500);
        }
        return;
      }

      if (mapInstanceRef.current) {
        console.log('ℹ️ El mapa ya está inicializado');
        return;
      }

      const { google } = window as any;
      
      console.log('🗺️ [FutbolPage] Inicializando mapa de complejos...');
      console.log('📊 Datos de complejos disponibles:', complejos.length);
      
      // 🔥 CALCULAR CENTRO DEL MAPA (PROMEDIO DE COORDENADAS)
      let centerLat = -38.7359; // Temuco default
      let centerLng = -72.5904; // Temuco default
      let validCoordinates = 0;

      // Procesar complejos con coordenadas válidas
      complejos.forEach((complejo: any, idx: number) => {
        if (complejo.latitud && complejo.longitud) {
          const lat = parseFloat(String(complejo.latitud).trim());
          const lng = parseFloat(String(complejo.longitud).trim());
          
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log(`✅ Complejo ${idx}: ${complejo.nombre} -> (${lat}, ${lng})`);
            centerLat += lat;
            centerLng += lng;
            validCoordinates++;
          } else {
            console.warn(`⚠️ Coordenadas inválidas para ${complejo.nombre}: lat=${complejo.latitud}, lng=${complejo.longitud}`);
          }
        } else {
          console.warn(`⚠️ Complejo sin coordenadas: ${complejo.nombre}`);
        }
      });

      if (validCoordinates > 0) {
        centerLat /= (validCoordinates + 1);
        centerLng /= (validCoordinates + 1);
      }

      console.log(`📍 Centro del mapa calculado: Lat=${centerLat}, Lng=${centerLng} (${validCoordinates} complejos válidos)`);

      // 🔥 CREAR MAPA
      try {
        mapInstanceRef.current = new google.maps.Map(mapElement, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        console.log('✅ Mapa de Google Maps creado exitosamente');
      } catch (mapError: any) {
        console.error('❌ Error creando mapa:', mapError);
        return;
      }

      // 🔥 LIMPIAR MARCADORES ANTERIORES
      markersRef.current.forEach((marker: any) => marker.setMap(null));
      markersRef.current = [];

      // 🔥 CREAR MARCADORES PARA CADA COMPLEJO
      let markersCreated = 0;
      complejos.forEach((complejo: any, index: number) => {
        const lat = complejo.latitud ? parseFloat(String(complejo.latitud).trim()) : null;
        const lng = complejo.longitud ? parseFloat(String(complejo.longitud).trim()) : null;

        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
          console.log(`📌 Creando marcador ${index + 1}: ${complejo.nombre} (${lat}, ${lng})`);

          try {
            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: complejo.nombre,
              animation: google.maps.Animation.DROP,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4CAF50',
                fillOpacity: 0.8,
                strokeColor: '#fff',
                strokeWeight: 2,
              },
            });

            // 🔥 INFOWINDOW PARA CADA MARCADOR
            const infoContent = `
              <div style="padding: 12px; max-width: 250px; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">⚽ ${complejo.nombre}</h4>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${complejo.direccion || 'Dirección no disponible'}</p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">📝 ${complejo.descripcion || 'Sin descripción'}</p>
                <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
              </div>
            `;

            const infoWindow = new google.maps.InfoWindow({
              content: infoContent,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
            });

            // Abrir el infowindow del primer marcador automáticamente
            if (index === 0) {
              infoWindow.open(mapInstanceRef.current, marker);
            }

            markersRef.current.push(marker);
            markersCreated++;
          } catch (markerError: any) {
            console.error(`❌ Error creando marcador para ${complejo.nombre}:`, markerError);
          }
        } else {
          console.log(`⏭️ Omitiendo complejo sin coordenadas válidas: ${complejo.nombre}`);
        }
      });

      console.log(`✅ Mapa inicializado con ${markersCreated} marcadores de ${complejos.length} complejos`);
    };

    // Si ya hay una instancia de google cargada
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      initMapWithMarkers();
      return;
    }

    // Insertar el script de Google Maps si no existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      console.log('📦 [FutbolPage] Cargando script de Google Maps...');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        console.log('✅ [FutbolPage] Script de Google Maps cargado');
        initMapWithMarkers();
      };
      script.onerror = () => {
        console.error('❌ [FutbolPage] Error cargando script de Google Maps');
      };
    } else {
      console.log('ℹ️ Script de Google Maps ya existe');
      existingScript.addEventListener('load', initMapWithMarkers);
      initMapWithMarkers();
    }

    return () => {
      // Limpiar marcadores al desmontar
      markersRef.current.forEach((marker: any) => marker.setMap(null));
    };
  }, [complejos, isClient]);

  // 🔥 USAR CANCHAS REALES PARA EL CARRUSEL
  const topRatedCourts = canchas.slice(0, 6); // Máximo 6 canchas para el carrusel
  const totalSlides = Math.max(1, topRatedCourts.length - cardsToShow + 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    console.log('Buscando:', searchTerm);
  };

  const handleLocationSearch = () => {
    console.log('Buscando ubicación:', locationSearch, 'Radio:', radiusKm);
  };

  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha:', court);
    router.push(`/sports/futbol/canchas/canchaseleccionada?id=${court.id}`);
  };

  // 🔥 Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🔥 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...footballStats[0],
      value: canchas.filter((c: any) => c.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...footballStats[1],
      value: canchas.length > 0 ? 
        `$${Math.min(...canchas.map((c: any) => parseInt(c.price || '0')))}-${Math.max(...canchas.map((c: any) => parseInt(c.price || '0')))}` : 
        "$20-40"
    },
    {
      ...footballStats[2],
      value: canchas.length > 0 ? 
        `${(canchas.reduce((acc: number, c: any) => acc + c.rating, 0) / canchas.length).toFixed(1)}⭐` : 
        "4.5⭐"
    },
    footballStats[3] // Mantener jugadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol" />
        <div className={styles.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="futbol" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>Fútbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="futbol" 
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

        {/* 🔥 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Fútbol en Temuco
          </h2>
          <div className={styles.statsContainer}>
            {updatedStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                trend={stat.trend}
                sport="futbol"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/futbol/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/futbol/canchas/'}
          >
            <div className={styles.courtButtonIcon}>⚽</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Canchas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las canchas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Canchas mejor calificadas
              {loadingCanchas && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorCanchas && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button 
                onClick={prevSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingCanchas}
                style={{ opacity: currentSlide === 0 || loadingCanchas ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingCanchas}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingCanchas ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          
          <div className={styles.carouselContainer}>
            {loadingCanchas ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando canchas...</p>
              </div>
            ) : (
              <div 
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedCourts.map((court: any, index: number) => (
                  <CourtCard 
                    key={court.id || index} 
                    {...court} 
                    sport="futbol"
                    onClick={() => handleCanchaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>📍 Ubicación de los complejos de fútbol</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Dirección, barrio o ciudad"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className={styles.locationInput}
              />
            </div>
            <div className={styles.radiusContainer}>
              <span className={styles.radiusIcon}>📏</span>
              <select 
                value={radiusKm} 
                onChange={(e) => setRadiusKm(e.target.value)}
                className={styles.radiusSelect}
              >
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={styles.searchLocationButton}>
              Buscar
            </button>
          </div>

          {/* 🔥 MAPA DE GOOGLE MAPS CON MÚLTIPLES MARCADORES */}
          <div 
            id="futbol-complejos-map"
            style={{ 
              width: '100%', 
              height: '400px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px'
            }} 
          />
          
          {loadingComplejos && (
            <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
              Cargando ubicaciones de complejos...
            </div>
          )}
          
          {!loadingComplejos && complejos.length > 0 && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              📌 Mostrando {complejos.length} complejo(s) con coordenadas disponibles
            </div>
          )}

          <div className={styles.mapActions}>
            <button className={styles.helpButton}>
              ❓ Ayuda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}