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

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE ENDURO (SERÁN ACTUALIZADOS CON DATOS REALES)
const enduroStats = [
  {
    title: "Rutas Disponibles Hoy",
    value: "4",
    icon: "🏍️",
    subtitle: "Listas para explorar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$25-45",
    icon: "💰",
    subtitle: "Por ruta",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestras rutas",
    trend: { value: 0.1, isPositive: true }
  },
  {
    title: "Kilómetros Totales",
    value: "85km",
    icon: "📏",
    subtitle: "De rutas disponibles",
    trend: { value: 15, isPositive: true }
  }
];

export default function EnduroPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('10');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA RUTAS DEL BACKEND
  const [rutas, setRutas] = useState<any[]>([]);
  const [loadingRutas, setLoadingRutas] = useState(true);
  const [errorRutas, setErrorRutas] = useState<string | null>(null);

  // 🔥 CARGAR RUTAS DEL BACKEND
  useEffect(() => {
    const loadRutas = async () => {
      try {
        setLoadingRutas(true);
        setErrorRutas(null);
        
        console.log('🔄 [Enduro] Cargando rutas individuales del backend...');
        
        // 🔥 IDs de las rutas de enduro que quieres mostrar
        const enduroRutaIds = [1, 2, 3, 4, 5, 6];
        
        const rutasPromises = enduroRutaIds.map(async (id) => {
          try {
            console.log(`🔍 [Enduro] Cargando ruta ID: ${id}`);
            const ruta = await canchaService.getCanchaById(id);
            console.log(`✅ [Enduro] Ruta ${id} obtenida:`, ruta);
            
            // 🔥 FILTRAR SOLO RUTAS DE ENDURO
            if (ruta.tipo !== 'enduro') {
              console.log(`⚠️ [Enduro] Ruta ${id} no es de enduro (${ruta.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedRuta = {
              id: ruta.id,
              imageUrl: `/sports/enduro/rutas/ruta${ruta.id}.png`,
              name: ruta.nombre,
              address: `Zona ${ruta.establecimientoId}`,
              rating: ruta.rating || 4.6,
              tags: [
                ruta.techada ? "Ruta techada" : "Ruta al aire libre",
                ruta.activa ? "Disponible" : "No disponible",
                "Guía incluido",
                "Equipo disponible"
              ],
              description: `Ruta de enduro ${ruta.nombre} - ID: ${ruta.id}`,
              price: ruta.precioPorHora?.toString() || "35",
              nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
              sport: "enduro"
            };
            
            console.log('🗺️ [Enduro] Ruta mapeada:', mappedRuta);
            return mappedRuta;
            
          } catch (error) {
            console.log(`❌ [Enduro] Error cargando ruta ${id}:`, error);
            return null;
          }
        });
        
        const rutasResults = await Promise.all(rutasPromises);
        const rutasValidas = rutasResults.filter(ruta => ruta !== null);
        
        console.log('🎉 [Enduro] Rutas de enduro cargadas exitosamente:', rutasValidas.length);
        console.log('📋 [Enduro] Rutas finales:', rutasValidas);
        
        setRutas(rutasValidas);
        
      } catch (error: any) {
        console.error('❌ [Enduro] ERROR DETALLADO cargando rutas:', error);
        setErrorRutas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Enduro] USANDO FALLBACK - Error en el API');
        setRutas([
          {
            id: 1,
            imageUrl: "/sports/enduro/rutas/ruta1.png",
            name: "🚨 FALLBACK - Ruta Montaña Extremo",
            address: "Cordillera Central",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Dificultad Alta", "Terreno Rocoso", "Guía Incluido"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "35",
            nextAvailable: "Mañana 08:00-12:00",
          },
          {
            id: 2,
            imageUrl: "/sports/enduro/rutas/ruta2.png",
            name: "🚨 FALLBACK - Sendero Bosque Verde",
            address: "Reserva Natural",
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Dificultad Media", "Bosque", "Ríos"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "28",
            nextAvailable: "Hoy 14:00-17:00",
          }
        ]);
      } finally {
        setLoadingRutas(false);
      }
    };

    loadRutas();
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

  // 🔥 USAR RUTAS REALES PARA EL CARRUSEL
  const topRatedRoutes = rutas.slice(0, 6);
  const totalSlides = Math.max(1, topRatedRoutes.length - cardsToShow + 1);

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

  const handleRutaClick = (route: any) => {
    console.log('Navegando a ruta:', route);
    router.push(`/sports/enduro/rutas/rutaseleccionada?id=${route.id}`);
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
      ...enduroStats[0],
      value: rutas.filter(r => r.nextAvailable !== "No disponible").length.toString()
    },
    enduroStats[1], // Mantener precio por defecto
    {
      ...enduroStats[2],
      value: `${(rutas.reduce((acc, r) => acc + r.rating, 0) / rutas.length || 4.6).toFixed(1)}⭐`
    },
    enduroStats[3] // Mantener kilómetros por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="enduro" />
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
      <Sidebar userRole="usuario" sport="enduro" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏍️</div>
            <h1 className={styles.headerTitle}>Enduro</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="enduro" 
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
            Estadísticas del Enduro en Temuco
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
                sport="enduro"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Rutas")) {
                    router.push('/sports/enduro/rutas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/enduro/rutas'}
          >
            <div className={styles.courtButtonIcon}>🏍️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Rutas</span>
              <span className={styles.courtButtonSubtitle}>Descubre todas las rutas de enduro disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Rutas mejor calificadas
              {loadingRutas && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorRutas && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button 
                onClick={prevSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingRutas}
                style={{ opacity: currentSlide === 0 || loadingRutas ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingRutas}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingRutas ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          
          <div className={styles.carouselContainer}>
            {loadingRutas ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando rutas...</p>
              </div>
            ) : (
              <div 
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedRoutes.map((route, index) => (
                  <CourtCard 
                    key={route.id || index} 
                    {...route} 
                    sport="enduro"
                    onClick={() => handleRutaClick(route)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las rutas</h2>
          
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
            sport="enduro"
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