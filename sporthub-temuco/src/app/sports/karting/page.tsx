'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../hooks/useAuthStatus';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './karting.module.css';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../services/canchaService';

// 🏎️ DATOS PARA LAS ESTADÍSTICAS DE KARTING (SERÁN ACTUALIZADOS CON DATOS REALES)
const kartingStats = [
  {
    title: "Pistas Disponibles Hoy",
    value: "4",
    icon: "🏎️",
    subtitle: "Listas para carreras",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$20-50",
    icon: "💰",
    subtitle: "Por carrera",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestras pistas",
    trend: { value: 0.1, isPositive: true }
  },
  {
    title: "Pilotos Activos",
    value: "18",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 2, isPositive: true }
  }
];

export default function KartingPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('10');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA PISTAS DEL BACKEND
  const [pistas, setPistas] = useState<any[]>([]);
  const [loadingPistas, setLoadingPistas] = useState(true);
  const [errorPistas, setErrorPistas] = useState<string | null>(null);

  // 🔥 CARGAR PISTAS DEL BACKEND
  useEffect(() => {
    const loadPistas = async () => {
      try {
        setLoadingPistas(true);
        setErrorPistas(null);
        
        console.log('🔄 [Karting] Cargando pistas individuales del backend...');
        
        // 🔥 IDs de las pistas de karting que quieres mostrar
        const kartingPistaIds = [1, 2, 3, 4, 5, 6, 7];
        
        const pistasPromises = kartingPistaIds.map(async (id) => {
          try {
            console.log(`🔍 [Karting] Cargando pista ID: ${id}`);
            const pista = await canchaService.getCanchaById(id);
            console.log(`✅ [Karting] Pista ${id} obtenida:`, pista);
            
            // 🔥 FILTRAR SOLO PISTAS DE KARTING
            if (pista.tipo !== 'karting') {
              console.log(`⚠️ [Karting] Pista ${id} no es de karting (${pista.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedPista = {
              id: pista.id,
              imageUrl: `/sports/karting/canchas/Pista${pista.id}.png`,
              name: pista.nombre,
              address: `Circuito ${pista.establecimientoId}`,
              rating: pista.rating || 4.6,
              tags: [
                pista.techada ? "Pista techada" : "Pista al aire libre",
                pista.activa ? "Disponible" : "No disponible",
                "Karts incluidos",
                "Cronometraje digital"
              ],
              description: `Pista de karting ${pista.nombre} - ID: ${pista.id}`,
              price: pista.precioPorHora?.toString() || "35",
              nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
              sport: "karting"
            };
            
            console.log('🗺️ [Karting] Pista mapeada:', mappedPista);
            return mappedPista;
            
          } catch (error) {
            console.log(`❌ [Karting] Error cargando pista ${id}:`, error);
            return null;
          }
        });
        
        const pistasResults = await Promise.all(pistasPromises);
        const pistasValidas = pistasResults.filter(pista => pista !== null);
        
        console.log('🎉 [Karting] Pistas de karting cargadas exitosamente:', pistasValidas.length);
        console.log('📋 [Karting] Pistas finales:', pistasValidas);
        
        setPistas(pistasValidas);
        
      } catch (error: any) {
        console.error('❌ [Karting] ERROR DETALLADO cargando pistas:', error);
        setErrorPistas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Karting] USANDO FALLBACK - Error en el API');
        setPistas([
          {
            id: 1,
            imageUrl: "/sports/karting/canchas/Pista1.png",
            name: "🚨 FALLBACK - Kartódromo Velocidad",
            address: "Norte, Centro, Sur",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Karts incluidos", "Cronometraje", "Seguridad"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "35",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/karting/canchas/Pista2.png",
            name: "🚨 FALLBACK - Circuito Adrenalina",
            address: "Sector Norte",
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Pista techada", "Equipamiento completo"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "30",
            nextAvailable: "14:30-15:30",
          }
        ]);
      } finally {
        setLoadingPistas(false);
      }
    };

    loadPistas();
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

  // 🔥 USAR PISTAS REALES PARA EL CARRUSEL
  const topRatedTracks = pistas.slice(0, 6);
  const totalSlides = Math.max(1, topRatedTracks.length - cardsToShow + 1);

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

  const handlePistaClick = (track: any) => {
    console.log('Navegando a pista:', track);
    router.push(`/sports/karting/canchas/canchaseleccionada?id=${track.id}`);
  };

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  // 🔥 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...kartingStats[0],
      value: pistas.filter(p => p.nextAvailable !== "No disponible").length.toString()
    },
    kartingStats[1], // Mantener precio por defecto
    {
      ...kartingStats[2],
      value: `${(pistas.reduce((acc, p) => acc + p.rating, 0) / pistas.length || 4.6).toFixed(1)}⭐`
    },
    kartingStats[3] // Mantener pilotos por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="karting" />
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
      <Sidebar userRole="usuario" sport="karting" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏎️</div>
            <h1 className={styles.headerTitle}>Karting</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista..."
              sport="karting"
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
            Estadísticas del Karting en Temuco
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
                sport="karting"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Pistas")) {
                    router.push('/sports/karting/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/karting/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🏎️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Pistas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Pistas mejor calificadas
              {loadingPistas && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorPistas && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button
                onClick={prevSlide}
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingPistas}
                style={{ opacity: currentSlide === 0 || loadingPistas ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingPistas}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingPistas ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>

          <div className={styles.carouselContainer}>
            {loadingPistas ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando pistas...</p>
              </div>
            ) : (
              <div
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedTracks.map((track, index) => (
                  <CourtCard
                    key={track.id || index}
                    {...track}
                    sport="karting"
                    onClick={() => handlePistaClick(track)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las pistas</h2>

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
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
                <option value="15">Radio 15km</option>
                <option value="25">Radio 25km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={styles.searchLocationButton}>
              Buscar
            </button>
          </div>

          <LocationMap
            latitude={-38.7359}
            longitude={-72.5904}
            address="Temuco, Chile"
            zoom={13}
            height="400px"
            sport="karting"
          />

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