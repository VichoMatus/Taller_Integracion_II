"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../hooks/useAuthStatus';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';
import StatsCard from '../../../components/charts/StatsCard';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../services/canchaService';

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE CICLISMO (SERÁN ACTUALIZADOS CON DATOS REALES)
const ciclismoStats = [
  {
    title: "Rutas Disponibles Hoy",
    value: "6",
    icon: "🚴‍♂️",
    subtitle: "Listas para recorrer",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$8-35",
    icon: "💰",
    subtitle: "Por hora",
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
    title: "Ciclistas en Ruta",
    value: "24",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 8, isPositive: true }
  }
];

export default function CiclismoPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);

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
        
        console.log('🔄 [Ciclismo] Cargando rutas individuales del backend...');
        
        // 🔥 IDs de las rutas de ciclismo que quieres mostrar
        const ciclismoRutaIds = [1, 2, 3, 4, 5, 6];
        
        const rutasPromises = ciclismoRutaIds.map(async (id) => {
          try {
            console.log(`🔍 [Ciclismo] Cargando ruta ID: ${id}`);
            const ruta = await canchaService.getCanchaById(id);
            console.log(`✅ [Ciclismo] Ruta ${id} obtenida:`, ruta);
            
            // 🔥 FILTRAR SOLO RUTAS DE CICLISMO
            if (ruta.tipo !== 'ciclismo') {
              console.log(`⚠️ [Ciclismo] Ruta ${id} no es de ciclismo (${ruta.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedRuta = {
              id: ruta.id,
              imageUrl: `/sports/ciclismo/rutas/Ruta${ruta.id}.png`,
              name: ruta.nombre,
              address: `Zona ${ruta.establecimientoId}`,
              rating: ruta.rating || 4.6,
              tags: [
                ruta.techada ? "Ruta techada" : "Sendero natural",
                ruta.activa ? "Disponible" : "No disponible",
                "Bicicletas disponibles",
                "Guía incluido"
              ],
              description: `Ruta de ciclismo ${ruta.nombre} - ID: ${ruta.id}`,
              price: ruta.precioPorHora?.toString() || "15",
              nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
              sport: "ciclismo"
            };
            
            console.log('🗺️ [Ciclismo] Ruta mapeada:', mappedRuta);
            return mappedRuta;
            
          } catch (error) {
            console.log(`❌ [Ciclismo] Error cargando ruta ${id}:`, error);
            return null;
          }
        });
        
        const rutasResults = await Promise.all(rutasPromises);
        const rutasValidas = rutasResults.filter(ruta => ruta !== null);
        
        console.log('🎉 [Ciclismo] Rutas de ciclismo cargadas exitosamente:', rutasValidas.length);
        console.log('📋 [Ciclismo] Rutas finales:', rutasValidas);
        
        setRutas(rutasValidas);
        
      } catch (error: any) {
        console.error('❌ [Ciclismo] ERROR DETALLADO cargando rutas:', error);
        setErrorRutas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Ciclismo] USANDO FALLBACK - Error en el API');
        setRutas([
          {
            id: 1,
            imageUrl: "/sports/ciclismo/rutas/Ruta1.png",
            name: "🚨 FALLBACK - Sendero Bosque",
            address: "Parque Nacional, Zona Norte",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Sendero natural", "Dificultad media", "Paisajes"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "15",
            nextAvailable: "08:00-09:00",
          },
          {
            id: 2,
            imageUrl: "/sports/ciclismo/rutas/Ruta2.png",
            name: "🚨 FALLBACK - Ruta Urbana",
            address: "Centro Ciudad",
            rating: 4.4,
            tags: ["DATOS OFFLINE", "Ciclovía urbana", "Fácil acceso"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "8",
            nextAvailable: "16:00-17:00",
          }
        ]);
      } finally {
        setLoadingRutas(false);
      }
    };

    loadRutas();
  }, []);

  // Optimización: Cálculo memoizado de cards to show
  const calculateCardsToShow = useCallback(() => {
    const screenWidth = window.innerWidth;
    const cardWidth = 320;
    const gap = 20;
    const sidebarWidth = 240;
    const padding = 40;
    const availableWidth = screenWidth - sidebarWidth - padding;
    return Math.max(1, Math.min(4, Math.floor(availableWidth / (cardWidth + gap))));
  }, []);

  // Optimización: useEffect con throttling para resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setCardsToShow(calculateCardsToShow());
      }, 150);
    };

    setCardsToShow(calculateCardsToShow());
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [calculateCardsToShow]);

  // 🔥 USAR RUTAS REALES PARA EL CARRUSEL
  const topRatedRoutes = rutas.slice(0, 6);

  // Optimización: Memoizar cálculos del carousel
  const carouselData = useMemo(() => {
    const totalSlides = Math.max(1, topRatedRoutes.length - cardsToShow + 1);
    return {
      totalSlides,
      currentSlide: Math.min(currentSlide, totalSlides - 1)
    };
  }, [cardsToShow, currentSlide, topRatedRoutes.length]);

  // Optimización: useCallback para funciones de navegación
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, carouselData.totalSlides - 1));
  }, [carouselData.totalSlides]);
  
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const handleSearch = useCallback(() => {
    console.log('Buscando:', searchTerm);
  }, [searchTerm]);
  
  const handleLocationSearch = useCallback(() => {
    console.log('Buscando ubicación:', locationSearch, 'Radio:', radiusKm);
  }, [locationSearch, radiusKm]);

  const handleRutaClick = (route: any) => {
    console.log('Navegando a ruta:', route);
    router.push(`/sports/ciclismo/canchas/canchaseleccionada?id=${route.id}`);
  };

  const handleUserClick = useCallback(() => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  }, [router, isAuthenticated]);

  // 🔥 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...ciclismoStats[0],
      value: rutas.filter(r => r.nextAvailable !== "No disponible").length.toString()
    },
    ciclismoStats[1], // Mantener precio por defecto
    {
      ...ciclismoStats[2],
      value: `${(rutas.reduce((acc, r) => acc + r.rating, 0) / rutas.length || 4.6).toFixed(1)}⭐`
    },
    ciclismoStats[3] // Mantener ciclistas por defecto
  ];

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚴‍♂️</div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="ciclismo"
            />
            <button 
              className={styles.userButton} 
              onClick={handleUserClick}
              disabled={buttonProps.disabled}
            >
              <span>👤</span>
              <span>{buttonProps.text}</span>
            </button>
          </div>
        </div>

        {/* 🔥 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsContainer}>
          {updatedStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              subtitle={stat.subtitle}
              trend={stat.trend}
              sport="ciclismo"
              onClick={() => {
                console.log(`Clicked on ${stat.title} stat`);
                if (stat.title.includes("Rutas")) {
                  router.push('/sports/ciclismo/canchas');
                }
              }}
            />
          ))}
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={`${styles.mainCourtButton} ${styles.containerCard}`}
            onClick={() => router.push('/sports/ciclismo/canchas')}
          >
            <div className={styles.courtButtonIcon}>🚴‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Rutas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las rutas disponibles</span>
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
                {carouselData.currentSlide + 1} / {carouselData.totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton} 
                disabled={carouselData.currentSlide === carouselData.totalSlides - 1 || loadingRutas}
                style={{ opacity: carouselData.currentSlide === carouselData.totalSlides - 1 || loadingRutas ? 0.5 : 1 }}
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
                style={{ transform: `translateX(-${carouselData.currentSlide * (320 + 20)}px)` }}
              >
                {topRatedRoutes.map((route, index) => (
                  <CourtCard 
                    key={route.id || index} 
                    {...route}
                    sport="ciclismo" 
                    onClick={() => handleRutaClick(route)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

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
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={styles.searchButton}>
              Buscar
            </button>
          </div>

          <LocationMap 
            sport="ciclismo" 
            latitude={-38.7359} 
            longitude={-72.5904} 
            address="Temuco, Chile" 
            zoom={13} 
            height="400px" 
          />
          <div className={styles.mapActions}>
            <button className={styles.helpButton}>❓ Ayuda</button>
          </div>
        </div>
      </div>
    </div>
  );
}