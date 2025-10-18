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

// 🧗 DATOS PARA LAS ESTADÍSTICAS DE ESCALADA (SERÁN ACTUALIZADOS CON DATOS REALES)
const escaladaStats = [
  {
    title: "Centros Disponibles Hoy",
    value: "5",
    icon: "🧗",
    subtitle: "Listos para escalar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$15-40",
    icon: "💰",
    subtitle: "Por sesión",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.5⭐",
    icon: "🏆",
    subtitle: "De nuestros centros",
    trend: { value: 0.2, isPositive: true }
  },
  {
    title: "Rutas Totales",
    value: "45",
    icon: "🎯",
    subtitle: "Disponibles",
    trend: { value: 8, isPositive: true }
  }
];

export default function EscaladaPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA CENTROS DEL BACKEND
  const [centros, setCentros] = useState<any[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(true);
  const [errorCentros, setErrorCentros] = useState<string | null>(null);

  // 🔥 CARGAR CENTROS DEL BACKEND
  useEffect(() => {
    const loadCentros = async () => {
      try {
        setLoadingCentros(true);
        setErrorCentros(null);
        
        console.log('🔄 [Escalada] Cargando centros individuales del backend...');
        
        // 🔥 IDs de los centros de escalada que quieres mostrar
        const escaladaCentroIds = [1, 2, 3, 4, 5, 6, 7, 8];
        
        const centrosPromises = escaladaCentroIds.map(async (id) => {
          try {
            console.log(`🔍 [Escalada] Cargando centro ID: ${id}`);
            const centro = await canchaService.getCanchaById(id);
            console.log(`✅ [Escalada] Centro ${id} obtenido:`, centro);
            
            // 🔥 FILTRAR SOLO CENTROS DE ESCALADA
            if (centro.tipo !== 'escalada') {
              console.log(`⚠️ [Escalada] Centro ${id} no es de escalada (${centro.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedCentro = {
              id: centro.id,
              imageUrl: `/sports/escalada/centros/Centro${centro.id}.png`,
              name: centro.nombre,
              address: `Complejo ${centro.establecimientoId}`,
              rating: centro.rating || 4.5,
              tags: [
                centro.techada ? "Centro techado" : "Escalada al aire libre",
                centro.activa ? "Disponible" : "No disponible",
                "Equipo incluido",
                "Instructor disponible"
              ],
              description: `Centro de escalada ${centro.nombre} - ID: ${centro.id}`,
              price: centro.precioPorHora?.toString() || "25",
              nextAvailable: centro.activa ? "Disponible ahora" : "No disponible",
              sport: "escalada"
            };
            
            console.log('🗺️ [Escalada] Centro mapeado:', mappedCentro);
            return mappedCentro;
            
          } catch (error) {
            console.log(`❌ [Escalada] Error cargando centro ${id}:`, error);
            return null;
          }
        });
        
        const centrosResults = await Promise.all(centrosPromises);
        const centrosValidos = centrosResults.filter(centro => centro !== null);
        
        console.log('🎉 [Escalada] Centros de escalada cargados exitosamente:', centrosValidos.length);
        console.log('📋 [Escalada] Centros finales:', centrosValidos);
        
        setCentros(centrosValidos);
        
      } catch (error: any) {
        console.error('❌ [Escalada] ERROR DETALLADO cargando centros:', error);
        setErrorCentros(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Escalada] USANDO FALLBACK - Error en el API');
        setCentros([
          {
            id: 1,
            imageUrl: "/sports/escalada/centros/Centro1.png",
            name: "🚨 FALLBACK - Centro Escalada Temuco",
            address: "Norte, Centro, Sur",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Equipo incluido", "Instructor", "Vestuarios"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "25",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/escalada/centros/Centro2.png",
            name: "🚨 FALLBACK - Escalada Outdoor",
            address: "Sector Norte",
            rating: 4.4,
            tags: ["DATOS OFFLINE", "Al aire libre", "Diferentes niveles"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "20",
            nextAvailable: "14:30-15:30",
          }
        ]);
      } finally {
        setLoadingCentros(false);
      }
    };

    loadCentros();
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

  // 🔥 USAR CENTROS REALES PARA EL CARRUSEL
  const topRatedCenters = centros.slice(0, 6);
  const totalSlides = Math.max(1, topRatedCenters.length - cardsToShow + 1);

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

  const handleCentroClick = (center: any) => {
    console.log('Navegando a centro:', center);
    router.push(`/sports/escalada/centros/centroseleccionado?id=${center.id}`);
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
      ...escaladaStats[0],
      value: centros.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    escaladaStats[1], // Mantener precio por defecto
    {
      ...escaladaStats[2],
      value: `${(centros.reduce((acc, c) => acc + c.rating, 0) / centros.length || 4.5).toFixed(1)}⭐`
    },
    escaladaStats[3] // Mantener rutas por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="escalada" />
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
      <Sidebar userRole="usuario" sport="escalada" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🧗</div>
            <h1 className={styles.headerTitle}>Escalada</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del centro..."
              sport="escalada"
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
            Estadísticas de la Escalada en Temuco
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
                sport="escalada"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Centros")) {
                    router.push('/sports/escalada/centros');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/escalada/centros/'}
          >
            <div className={styles.courtButtonIcon}>🧗</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Centros</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los centros disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Centros mejor calificados
              {loadingCentros && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorCentros && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button
                onClick={prevSlide}
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingCentros}
                style={{ opacity: currentSlide === 0 || loadingCentros ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingCentros}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingCentros ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>

          <div className={styles.carouselContainer}>
            {loadingCentros ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando centros...</p>
              </div>
            ) : (
              <div
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedCenters.map((center, index) => (
                  <CourtCard
                    key={center.id || index}
                    {...center}
                    sport="escalada"
                    onClick={() => handleCentroClick(center)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los centros</h2>

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
            sport="escalada"
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