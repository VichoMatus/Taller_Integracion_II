'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../hooks/useAuthStatus';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './page.module.css';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../services/canchaService';

// 🏊 DATOS PARA LAS ESTADÍSTICAS DE NATACIÓN (SERÁN ACTUALIZADOS CON DATOS REALES)
const natacionStats = [
  {
    title: "Piletas Disponibles Hoy",
    value: "4",
    icon: "🏊",
    subtitle: "Listas para nadar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$10-25",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestras piletas",
    trend: { value: 0.1, isPositive: true }
  },
  {
    title: "Nadadores Activos",
    value: "32",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 5, isPositive: true }
  }
];

export default function NatacionPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA PILETAS DEL BACKEND
  const [piletas, setPiletas] = useState<any[]>([]);
  const [loadingPiletas, setLoadingPiletas] = useState(true);
  const [errorPiletas, setErrorPiletas] = useState<string | null>(null);

  // 🔥 CARGAR PILETAS DEL BACKEND
  useEffect(() => {
    const loadPiletas = async () => {
      try {
        setLoadingPiletas(true);
        setErrorPiletas(null);
        
        console.log('🔄 [Natacion] Cargando piletas individuales del backend...');
        
        // 🔥 IDs de las piletas de natación que quieres mostrar
        const natacionPiletaIds = [1, 2, 3, 4, 5, 6, 7, 8];
        
        const piletasPromises = natacionPiletaIds.map(async (id) => {
          try {
            console.log(`🔍 [Natacion] Cargando pileta ID: ${id}`);
            const pileta = await canchaService.getCanchaById(id);
            console.log(`✅ [Natacion] Pileta ${id} obtenida:`, pileta);
            
            // 🔥 FILTRAR SOLO PILETAS DE NATACIÓN
            if (pileta.tipo !== 'natacion') {
              console.log(`⚠️ [Natacion] Pileta ${id} no es de natación (${pileta.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedPileta = {
              id: pileta.id,
              imageUrl: `/sports/natacion/piletas/Pileta${pileta.id}.png`,
              name: pileta.nombre,
              address: `Centro Acuático ${pileta.establecimientoId}`,
              rating: pileta.rating || 4.6,
              tags: [
                pileta.techada ? "Pileta techada" : "Pileta al aire libre",
                pileta.activa ? "Disponible" : "No disponible",
                "Agua climatizada",
                "Vestuarios disponibles"
              ],
              description: `Pileta de natación ${pileta.nombre} - ID: ${pileta.id}`,
              price: pileta.precioPorHora?.toString() || "18",
              nextAvailable: pileta.activa ? "Disponible ahora" : "No disponible",
              sport: "natacion"
            };
            
            console.log('🗺️ [Natacion] Pileta mapeada:', mappedPileta);
            return mappedPileta;
            
          } catch (error) {
            console.log(`❌ [Natacion] Error cargando pileta ${id}:`, error);
            return null;
          }
        });
        
        const piletasResults = await Promise.all(piletasPromises);
        const piletasValidas = piletasResults.filter(pileta => pileta !== null);
        
        console.log('🎉 [Natacion] Piletas de natación cargadas exitosamente:', piletasValidas.length);
        console.log('📋 [Natacion] Piletas finales:', piletasValidas);
        
        setPiletas(piletasValidas);
        
      } catch (error: any) {
        console.error('❌ [Natacion] ERROR DETALLADO cargando piletas:', error);
        setErrorPiletas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Natacion] USANDO FALLBACK - Error en el API');
        setPiletas([
          {
            id: 1,
            imageUrl: "/sports/natacion/piletas/Pileta1.png",
            name: "🚨 FALLBACK - Aqua Center Temuco",
            address: "Norte, Centro, Sur",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Agua climatizada", "Vestuarios", "Instructor"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "18",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/natacion/piletas/Pileta2.png",
            name: "🚨 FALLBACK - Piscina Municipal",
            address: "Sector Norte",
            rating: 4.4,
            tags: ["DATOS OFFLINE", "Pileta olimpica", "Clases grupales"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "15",
            nextAvailable: "14:30-15:30",
          }
        ]);
      } finally {
        setLoadingPiletas(false);
      }
    };

    loadPiletas();
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

  // 🔥 USAR PILETAS REALES PARA EL CARRUSEL
  const topRatedPools = piletas.slice(0, 6);
  const totalSlides = Math.max(1, topRatedPools.length - cardsToShow + 1);

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

  const handlePiletaClick = (pool: any) => {
    console.log('Navegando a pileta:', pool);
    router.push(`/sports/natacion/piletas/piletaseleccionada?id=${pool.id}`);
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
      ...natacionStats[0],
      value: piletas.filter(p => p.nextAvailable !== "No disponible").length.toString()
    },
    natacionStats[1], // Mantener precio por defecto
    {
      ...natacionStats[2],
      value: `${(piletas.reduce((acc, p) => acc + p.rating, 0) / piletas.length || 4.6).toFixed(1)}⭐`
    },
    natacionStats[3] // Mantener nadadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="natacion" />
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
      <Sidebar userRole="usuario" sport="natacion" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏊</div>
            <h1 className={styles.headerTitle}>Natación</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pileta..."
              sport="natacion"
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
            Estadísticas de la Natación en Temuco
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
                sport="natacion"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Piletas")) {
                    router.push('/sports/natacion/piletas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/natacion/piletas/'}
          >
            <div className={styles.courtButtonIcon}>🏊</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Piletas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las piletas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Piletas mejor calificadas
              {loadingPiletas && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorPiletas && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button
                onClick={prevSlide}
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingPiletas}
                style={{ opacity: currentSlide === 0 || loadingPiletas ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingPiletas}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingPiletas ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>

          <div className={styles.carouselContainer}>
            {loadingPiletas ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando piletas...</p>
              </div>
            ) : (
              <div
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedPools.map((pool, index) => (
                  <CourtCard
                    key={pool.id || index}
                    {...pool}
                    sport="natacion"
                    onClick={() => handlePiletaClick(pool)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las piletas</h2>

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

          <LocationMap
            latitude={-38.7359}
            longitude={-72.5904}
            address="Temuco, Chile"
            zoom={13}
            height="400px"
            sport="natacion"
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