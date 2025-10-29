'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { canchaService } from '@/services/canchaService';
import { complejosService } from '@/services/complejosService';
import styles from './page.module.css';

// 🏍️ DATOS PARA LAS ESTADÍSTICAS DE ENDURO
const enduroStats = [
  {
    title: "Rutas Disponibles Hoy",
    value: "8",
    icon: "🏍️",
    subtitle: "Listas para recorrer",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$30-60",
    icon: "💰",
    subtitle: "Por día",
    trend: { value: 10, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.8⭐",
    icon: "🏆",
    subtitle: "De nuestras rutas",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Riders Activos",
    value: "12",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 3, isPositive: true }
  }
];

// 🏍️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Base Enduro Norte",
      direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
    },
    2: {
      nombre: "Centro Enduro Cordillera", 
      direccion: "Ruta 5 Sur Km 675, Temuco, Chile"
    },
    3: {
      nombre: "Base Enduro Araucanía",
      direccion: "Camino a Cunco, Temuco, Chile"
    },
    default: {
      nombre: "Base de Enduro",
      direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function EnduroPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🏍️ ESTADOS PARA RUTAS DEL BACKEND
  const [rutas, setRutas] = useState<any[]>([]);
  const [loadingRutas, setLoadingRutas] = useState(true);
  const [errorRutas, setErrorRutas] = useState<string | null>(null);

  // 🏍️ Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🏍️ CARGAR RUTAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadRutas = async () => {
      try {
        setLoadingRutas(true);
        setErrorRutas(null);
        
        console.log('🔄 [EnduroPage] Cargando TODAS las rutas del backend...');
        
        // 🏍️ OBTENER TODAS LAS CANCHAS (ADAPTADAS PARA ENDURO)
        const todasLasRutas = await canchaService.getCanchas();
        console.log('✅ [EnduroPage] Todas las rutas obtenidas:', todasLasRutas);
        
        // 🏍️ FILTRAR RUTAS DE ENDURO
        const rutasDeEnduro = todasLasRutas.filter((ruta: any) => {
          console.log(`🔍 [EnduroPage] Evaluando ruta ID ${ruta.id}: tipo="${ruta.tipo}"`);
          return ['enduro', 'motocross', 'cross country'].includes(ruta.tipo.toLowerCase());
        });
        
        console.log('🏍️ [EnduroPage] Rutas de enduro encontradas:', rutasDeEnduro.length);
        
        // 🏍️ OBTENER DATOS DE COMPLEJOS PARA CADA RUTA
        const rutasMapeadas = await Promise.all(
          rutasDeEnduro.map(async (ruta: any) => {
            let complejoData = null;
            let addressInfo = `Base ${ruta.establecimientoId}`;
            
            // 🏍️ INTENTAR OBTENER DATOS DEL COMPLEJO
            if (ruta.establecimientoId) {
              try {
                console.log(`🔍 [EnduroPage] Cargando complejo ID ${ruta.establecimientoId} para ruta ${ruta.id}`);
                complejoData = await complejosService.getComplejoById(ruta.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [EnduroPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [EnduroPage] Error cargando complejo ${ruta.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(ruta.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🏍️ MAPEAR RUTA CON DATOS DEL COMPLEJO
            const mappedRuta = {
              id: ruta.id,
              imageUrl: `/sports/enduro/rutas/Ruta${ruta.id}.png`,
              name: ruta.nombre,
              address: addressInfo, // 🏍️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: ruta.rating || 4.8,
              tags: [
                ruta.techada ? "Techada" : "Al aire libre",
                ruta.activa ? "Disponible" : "No disponible",
                "Terreno Extremo"
              ],
              description: `Ruta de ${ruta.tipo} ${ruta.nombre} - ID: ${ruta.id}`,
              price: ruta.precioPorHora?.toString() || "45",
              nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
              sport: ruta.tipo
            };
            
            console.log('🗺️ [EnduroPage] Ruta mapeada:', mappedRuta);
            return mappedRuta;
          })
        );
        
        console.log('🎉 [EnduroPage] Rutas con datos de complejo cargadas:', rutasMapeadas.length);
        setRutas(rutasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [EnduroPage] ERROR cargando rutas:', error);
        setErrorRutas(`Error: ${error.message}`);
        
        // 🏍️ FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const rutasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/enduro/enduro.png",
            name: "🚨 FALLBACK - Ruta Nahuelbuta",
            address: "Base Enduro Norte - Cordillera de Nahuelbuta, Temuco",
            rating: 4.9,
            tags: ["DATOS OFFLINE", "Terreno Extremo", "Cross Country"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "45",
            nextAvailable: "08:00-18:00",
          },
          {
            id: 2,
            imageUrl: "/sports/enduro/enduro.png",
            name: "🚨 FALLBACK - Ruta Cordillera",
            address: "Centro Enduro Cordillera - Ruta 5 Sur Km 675, Temuco",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Enduro", "Montaña"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "50",
            nextAvailable: "09:00-17:00", 
          },
          {
            id: 3,
            imageUrl: "/sports/enduro/enduro.png",
            name: "🚨 FALLBACK - Ruta Araucanía",
            address: "Base Enduro Araucanía - Camino a Cunco, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Motocross", "Aventura"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "40",
            nextAvailable: "Mañana 07:00-19:00",
          }
        ];
        
        setRutas(rutasEstaticas);
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

  // 🏍️ USAR RUTAS REALES PARA EL CARRUSEL
  const topRatedRoutes = rutas.slice(0, 6); // Máximo 6 rutas para el carrusel
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

  // 🏍️ Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🏍️ ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...enduroStats[0],
      value: rutas.filter(r => r.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...enduroStats[1],
      value: rutas.length > 0 ? 
        `$${Math.min(...rutas.map(r => parseInt(r.price || '0')))}-${Math.max(...rutas.map(r => parseInt(r.price || '0')))}` : 
        "$30-60"
    },
    {
      ...enduroStats[2],
      value: rutas.length > 0 ? 
        `${(rutas.reduce((acc, r) => acc + r.rating, 0) / rutas.length).toFixed(1)}⭐` : 
        "4.8⭐"
    },
    enduroStats[3] // Mantener riders por defecto
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
              placeholder="Nombre de la ruta..."
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

        {/* 🏍️ STATS CARDS CON DATOS ACTUALIZADOS */}
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
            onClick={() => window.location.href = '/sports/enduro/rutas/'}
          >
            <div className={styles.courtButtonIcon}>🏍️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Rutas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las rutas de enduro disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🏍️ CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Rutas de enduro mejor calificadas
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
                <p>Cargando rutas de enduro...</p>
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
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las rutas de enduro</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Dirección, zona o región"
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
                <option value="20">Radio 20km</option>
                <option value="50">Radio 50km</option>
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