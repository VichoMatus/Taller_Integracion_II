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

// 🏉 DATOS PARA LAS ESTADÍSTICAS DE RUGBY (SERÁN ACTUALIZADOS CON DATOS REALES)
const rugbyStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "5",
    icon: "🏉",
    subtitle: "Listas para jugar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$30-50",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Jugadores Activos",
    value: "75",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 15, isPositive: true }
  }
];

export default function RugbyPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('10');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA CANCHAS DEL BACKEND
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loadingCanchas, setLoadingCanchas] = useState(true);
  const [errorCanchas, setErrorCanchas] = useState<string | null>(null);

  // 🔥 CARGAR CANCHAS DEL BACKEND
  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoadingCanchas(true);
        setErrorCanchas(null);
        
        console.log('🔄 [Rugby] Cargando canchas individuales del backend...');
        
        // 🔥 IDs de las canchas de rugby que quieres mostrar
        const rugbyCanchaIds = [1, 2, 3, 4, 5, 6, 7, 8];
        
        const canchasPromises = rugbyCanchaIds.map(async (id) => {
          try {
            console.log(`🔍 [Rugby] Cargando cancha ID: ${id}`);
            const cancha = await canchaService.getCanchaById(id);
            console.log(`✅ [Rugby] Cancha ${id} obtenida:`, cancha);
            
            // 🔥 FILTRAR SOLO CANCHAS DE RUGBY
            if (cancha.tipo !== 'rugby') {
              console.log(`⚠️ [Rugby] Cancha ${id} no es de rugby (${cancha.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedCancha = {
              id: cancha.id,
              imageUrl: `/sports/rugby/canchas/Cancha${cancha.id}.png`,
              name: cancha.nombre,
              address: `Complejo ${cancha.establecimientoId}`,
              rating: cancha.rating || 4.6,
              tags: [
                cancha.techada ? "Campo techado" : "Campo al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                "Césped natural",
                "Vestuarios incluidos"
              ],
              description: `Cancha de rugby ${cancha.nombre} - ID: ${cancha.id}`,
              price: cancha.precioPorHora?.toString() || "40",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: "rugby"
            };
            
            console.log('🗺️ [Rugby] Cancha mapeada:', mappedCancha);
            return mappedCancha;
            
          } catch (error) {
            console.log(`❌ [Rugby] Error cargando cancha ${id}:`, error);
            return null;
          }
        });
        
        const canchasResults = await Promise.all(canchasPromises);
        const canchasValidas = canchasResults.filter(cancha => cancha !== null);
        
        console.log('🎉 [Rugby] Canchas de rugby cargadas exitosamente:', canchasValidas.length);
        console.log('📋 [Rugby] Canchas finales:', canchasValidas);
        
        setCanchas(canchasValidas);
        
      } catch (error: any) {
        console.error('❌ [Rugby] ERROR DETALLADO cargando canchas:', error);
        setErrorCanchas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Rugby] USANDO FALLBACK - Error en el API');
        setCanchas([
          {
            id: 1,
            imageUrl: "/sports/rugby/canchas/Cancha1.png",
            name: "🚨 FALLBACK - Campo Rugby Temuco",
            address: "Norte, Centro, Sur",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Césped natural", "Vestuarios", "Iluminación"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "40",
            nextAvailable: "15:00-17:00",
          },
          {
            id: 2,
            imageUrl: "/sports/rugby/canchas/Cancha2.png",
            name: "🚨 FALLBACK - Club Rugby Sur",
            address: "Sector Sur",
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Campo reglamentario", "Graderías"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "35",
            nextAvailable: "18:00-20:00",
          }
        ]);
      } finally {
        setLoadingCanchas(false);
      }
    };

    loadCanchas();
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

  // 🔥 USAR CANCHAS REALES PARA EL CARRUSEL
  const topRatedCourts = canchas.slice(0, 6);
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
    router.push(`/sports/rugby/canchas/canchaseleccionada?id=${court.id}`);
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
      ...rugbyStats[0],
      value: canchas.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    rugbyStats[1], // Mantener precio por defecto
    {
      ...rugbyStats[2],
      value: `${(canchas.reduce((acc, c) => acc + c.rating, 0) / canchas.length || 4.6).toFixed(1)}⭐`
    },
    rugbyStats[3] // Mantener jugadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="rugby" />
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
      <Sidebar userRole="usuario" sport="rugby" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏉</div>
            <h1 className={styles.headerTitle}>Rugby</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="rugby"
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
            Estadísticas del Rugby en Temuco
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
                sport="rugby"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/rugby/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/rugby/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🏉</div>
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
                {topRatedCourts.map((court, index) => (
                  <CourtCard
                    key={court.id || index}
                    {...court}
                    sport="rugby"
                    onClick={() => handleCanchaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las canchas</h2>

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
            sport="rugby"
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