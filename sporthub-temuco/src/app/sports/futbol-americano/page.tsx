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

// 🏈 DATOS PARA LAS ESTADÍSTICAS DE FÚTBOL AMERICANO (SERÁN ACTUALIZADOS CON DATOS REALES)
const futbolAmericanoStats = [
  {
    title: "Estadios Disponibles Hoy",
    value: "3",
    icon: "🏈",
    subtitle: "Listos para jugar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$40-80",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.8⭐",
    icon: "🏆",
    subtitle: "De nuestros estadios",
    trend: { value: 0.2, isPositive: true }
  },
  {
    title: "Jugadores Activos",
    value: "22",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 3, isPositive: true }
  }
];

export default function FutbolAmericanoPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA ESTADIOS DEL BACKEND
  const [estadios, setEstadios] = useState<any[]>([]);
  const [loadingEstadios, setLoadingEstadios] = useState(true);
  const [errorEstadios, setErrorEstadios] = useState<string | null>(null);

  // 🔥 CARGAR ESTADIOS DEL BACKEND
  useEffect(() => {
    const loadEstadios = async () => {
      try {
        setLoadingEstadios(true);
        setErrorEstadios(null);
        
        console.log('🔄 [FutbolAmericano] Cargando estadios individuales del backend...');
        
        // 🔥 IDs de los estadios de fútbol americano que quieres mostrar
        const futbolAmericanoEstadioIds = [1, 2, 3, 4, 5, 6];
        
        const estadiosPromises = futbolAmericanoEstadioIds.map(async (id) => {
          try {
            console.log(`🔍 [FutbolAmericano] Cargando estadio ID: ${id}`);
            const estadio = await canchaService.getCanchaById(id);
            console.log(`✅ [FutbolAmericano] Estadio ${id} obtenido:`, estadio);
            
            // 🔥 FILTRAR SOLO ESTADIOS DE FÚTBOL AMERICANO
            if (estadio.tipo !== 'futbol_americano') {
              console.log(`⚠️ [FutbolAmericano] Estadio ${id} no es de fútbol americano (${estadio.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedEstadio = {
              id: estadio.id,
              imageUrl: `/sports/futbol-americano/estadios/Estadio${estadio.id}.png`,
              name: estadio.nombre,
              address: `Complejo ${estadio.establecimientoId}`,
              rating: estadio.rating || 4.8,
              tags: [
                estadio.techada ? "Estadio techado" : "Estadio al aire libre",
                estadio.activa ? "Disponible" : "No disponible",
                "Césped artificial",
                "Marcador electrónico"
              ],
              description: `Estadio de fútbol americano ${estadio.nombre} - ID: ${estadio.id}`,
              price: estadio.precioPorHora?.toString() || "60",
              nextAvailable: estadio.activa ? "Disponible ahora" : "No disponible",
              sport: "futbol-americano"
            };
            
            console.log('🗺️ [FutbolAmericano] Estadio mapeado:', mappedEstadio);
            return mappedEstadio;
            
          } catch (error) {
            console.log(`❌ [FutbolAmericano] Error cargando estadio ${id}:`, error);
            return null;
          }
        });
        
        const estadiosResults = await Promise.all(estadiosPromises);
        const estadiosValidos = estadiosResults.filter(estadio => estadio !== null);
        
        console.log('🎉 [FutbolAmericano] Estadios de fútbol americano cargados exitosamente:', estadiosValidos.length);
        console.log('📋 [FutbolAmericano] Estadios finales:', estadiosValidos);
        
        setEstadios(estadiosValidos);
        
      } catch (error: any) {
        console.error('❌ [FutbolAmericano] ERROR DETALLADO cargando estadios:', error);
        setErrorEstadios(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [FutbolAmericano] USANDO FALLBACK - Error en el API');
        setEstadios([
          {
            id: 1,
            imageUrl: "/sports/futbol-americano/estadios/Estadio1.png",
            name: "🚨 FALLBACK - Estadio Champions",
            address: "Norte, Centro, Sur",
            rating: 4.9,
            tags: ["DATOS OFFLINE", "Césped artificial", "Marcador electrónico", "Vestuarios"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "60",
            nextAvailable: "20:00-22:00",
          },
          {
            id: 2,
            imageUrl: "/sports/futbol-americano/estadios/Estadio2.png",
            name: "🚨 FALLBACK - Arena Temuco",
            address: "Sector Norte",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Estadio techado", "Graderías"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "45",
            nextAvailable: "16:00-18:00",
          }
        ]);
      } finally {
        setLoadingEstadios(false);
      }
    };

    loadEstadios();
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

  // 🔥 USAR ESTADIOS REALES PARA EL CARRUSEL
  const topRatedStadiums = estadios.slice(0, 6);
  const totalSlides = Math.max(1, topRatedStadiums.length - cardsToShow + 1);

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

  const handleEstadioClick = (stadium: any) => {
    console.log('Navegando a estadio:', stadium);
    router.push(`/sports/futbol-americano/estadios/estadioseleccionado?id=${stadium.id}`);
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
      ...futbolAmericanoStats[0],
      value: estadios.filter(e => e.nextAvailable !== "No disponible").length.toString()
    },
    futbolAmericanoStats[1], // Mantener precio por defecto
    {
      ...futbolAmericanoStats[2],
      value: `${(estadios.reduce((acc, e) => acc + e.rating, 0) / estadios.length || 4.8).toFixed(1)}⭐`
    },
    futbolAmericanoStats[3] // Mantener jugadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol-americano" />
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
      <Sidebar userRole="usuario" sport="futbol-americano" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏈</div>
            <h1 className={styles.headerTitle}>Fútbol Americano</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del estadio..."
              sport="futbol-americano"
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
            Estadísticas del Fútbol Americano en Temuco
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
                sport="futbol-americano"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Estadios")) {
                    router.push('/sports/futbol-americano/estadios');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/futbol-americano/estadios/'}
          >
            <div className={styles.courtButtonIcon}>🏈</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Estadios</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los estadios disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Estadios mejor calificados
              {loadingEstadios && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorEstadios && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button
                onClick={prevSlide}
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingEstadios}
                style={{ opacity: currentSlide === 0 || loadingEstadios ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingEstadios}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingEstadios ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>

          <div className={styles.carouselContainer}>
            {loadingEstadios ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando estadios...</p>
              </div>
            ) : (
              <div
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedStadiums.map((stadium, index) => (
                  <CourtCard
                    key={stadium.id || index}
                    {...stadium}
                    sport="futbol-americano"
                    onClick={() => handleEstadioClick(stadium)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los estadios</h2>

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
            sport="futbol-americano"
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