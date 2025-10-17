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

// 🛹 DATOS PARA LAS ESTADÍSTICAS DE SKATE (SERÁN ACTUALIZADOS CON DATOS REALES)
const skateStats = [
  {
    title: "Skateparks Disponibles",
    value: "6",
    icon: "🛹",
    subtitle: "Listos para practicar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$15-30",
    icon: "💰",
    subtitle: "Por sesión",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.5⭐",
    icon: "🏆",
    subtitle: "De nuestros skateparks",
    trend: { value: 0.2, isPositive: true }
  },
  {
    title: "Skaters Activos",
    value: "42",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 8, isPositive: true }
  }
];

export default function SkatePage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA SKATEPARKS DEL BACKEND
  const [skateparks, setSkateparks] = useState<any[]>([]);
  const [loadingSkateparks, setLoadingSkateparks] = useState(true);
  const [errorSkateparks, setErrorSkateparks] = useState<string | null>(null);

  // 🔥 CARGAR SKATEPARKS DEL BACKEND
  useEffect(() => {
    const loadSkateparks = async () => {
      try {
        setLoadingSkateparks(true);
        setErrorSkateparks(null);
        
        console.log('🔄 [Skate] Cargando skateparks individuales del backend...');
        
        // 🔥 IDs de los skateparks que quieres mostrar
        const skateparkIds = [1, 2, 3, 4, 5, 6, 7, 8];
        
        const skateparksPromises = skateparkIds.map(async (id) => {
          try {
            console.log(`🔍 [Skate] Cargando skatepark ID: ${id}`);
            const skatepark = await canchaService.getCanchaById(id);
            console.log(`✅ [Skate] Skatepark ${id} obtenido:`, skatepark);
            
            // 🔥 FILTRAR SOLO SKATEPARKS
            if (skatepark.tipo !== 'skate') {
              console.log(`⚠️ [Skate] Skatepark ${id} no es de skate (${skatepark.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedSkatepark = {
              id: skatepark.id,
              imageUrl: `/sports/skate/canchas/Skatepark${skatepark.id}.png`,
              name: skatepark.nombre,
              address: `Complejo ${skatepark.establecimientoId}`,
              rating: skatepark.rating || 4.5,
              tags: [
                skatepark.techada ? "Skatepark cubierto" : "Skatepark al aire libre",
                skatepark.activa ? "Disponible" : "No disponible",
                "Rampas incluidas",
                "Equipo de seguridad"
              ],
              description: `Skatepark ${skatepark.nombre} - ID: ${skatepark.id}`,
              price: skatepark.precioPorHora?.toString() || "20",
              nextAvailable: skatepark.activa ? "Disponible ahora" : "No disponible",
              sport: "skate"
            };
            
            console.log('🗺️ [Skate] Skatepark mapeado:', mappedSkatepark);
            return mappedSkatepark;
            
          } catch (error) {
            console.log(`❌ [Skate] Error cargando skatepark ${id}:`, error);
            return null;
          }
        });
        
        const skateparksResults = await Promise.all(skateparksPromises);
        const skateparksValidos = skateparksResults.filter(skatepark => skatepark !== null);
        
        console.log('🎉 [Skate] Skateparks cargados exitosamente:', skateparksValidos.length);
        console.log('📋 [Skate] Skateparks finales:', skateparksValidos);
        
        setSkateparks(skateparksValidos);
        
      } catch (error: any) {
        console.error('❌ [Skate] ERROR DETALLADO cargando skateparks:', error);
        setErrorSkateparks(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Skate] USANDO FALLBACK - Error en el API');
        setSkateparks([
          {
            id: 1,
            imageUrl: "/sports/skate/canchas/Skatepark1.png",
            name: "🚨 FALLBACK - Skatepark Centro",
            address: "Norte, Centro, Sur",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Rampas incluidas", "Bowl", "Street"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "20",
            nextAvailable: "16:00-18:00",
          },
          {
            id: 2,
            imageUrl: "/sports/skate/canchas/Skatepark2.png",
            name: "🚨 FALLBACK - Skate Plaza Norte",
            address: "Sector Norte",
            rating: 4.4,
            tags: ["DATOS OFFLINE", "Skatepark al aire libre", "Mini ramps"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "15",
            nextAvailable: "14:00-16:00",
          }
        ]);
      } finally {
        setLoadingSkateparks(false);
      }
    };

    loadSkateparks();
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

  // 🔥 USAR SKATEPARKS REALES PARA EL CARRUSEL
  const topRatedParks = skateparks.slice(0, 6);
  const totalSlides = Math.max(1, topRatedParks.length - cardsToShow + 1);

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

  const handleSkateparkClick = (park: any) => {
    console.log('Navegando a skatepark:', park);
    router.push(`/sports/skate/canchas/canchaseleccionada?id=${park.id}`);
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
      ...skateStats[0],
      value: skateparks.filter(s => s.nextAvailable !== "No disponible").length.toString()
    },
    skateStats[1], // Mantener precio por defecto
    {
      ...skateStats[2],
      value: `${(skateparks.reduce((acc, s) => acc + s.rating, 0) / skateparks.length || 4.5).toFixed(1)}⭐`
    },
    skateStats[3] // Mantener skaters por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="skate" />
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
      <Sidebar userRole="usuario" sport="skate" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🛹</div>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del skatepark..."
              sport="skate"
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
            Estadísticas de Skate en Temuco
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
                sport="skate"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Skateparks")) {
                    router.push('/sports/skate/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/skate/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🛹</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Skateparks</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los skateparks disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Skateparks mejor calificados
              {loadingSkateparks && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorSkateparks && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button
                onClick={prevSlide}
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingSkateparks}
                style={{ opacity: currentSlide === 0 || loadingSkateparks ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingSkateparks}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingSkateparks ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>

          <div className={styles.carouselContainer}>
            {loadingSkateparks ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando skateparks...</p>
              </div>
            ) : (
              <div
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedParks.map((park, index) => (
                  <CourtCard
                    key={park.id || index}
                    {...park}
                    sport="skate"
                    onClick={() => handleSkateparkClick(park)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los skateparks</h2>

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
            sport="skate"
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