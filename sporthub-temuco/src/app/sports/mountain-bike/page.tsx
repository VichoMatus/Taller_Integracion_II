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

// 🚵‍♂️ DATOS PARA LAS ESTADÍSTICAS DE MOUNTAIN BIKE
const mountainBikeStats = [
  {
    title: "Rutas Disponibles Hoy",
    value: "12",
    icon: "🚵‍♂️",
    subtitle: "Listas para recorrer",
    trend: { value: 3, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$15-35",
    icon: "💰",
    subtitle: "Por día",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestras rutas",
    trend: { value: 0.4, isPositive: true }
  },
  {
    title: "Ciclistas Activos",
    value: "18",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 6, isPositive: true }
  }
];

// 🚵‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Centro MTB Cordillera",
      direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
    },
    2: {
      nombre: "Base Mountain Bike Sur", 
      direccion: "Camino a Cunco Km 15, Temuco, Chile"
    },
    3: {
      nombre: "MTB Park Araucanía",
      direccion: "Ruta 5 Sur Km 680, Temuco, Chile"
    },
    default: {
      nombre: "Centro de Mountain Bike",
      direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function MountainBikePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🚵‍♂️ ESTADOS PARA RUTAS DEL BACKEND
  const [rutas, setRutas] = useState<any[]>([]);
  const [loadingRutas, setLoadingRutas] = useState(true);
  const [errorRutas, setErrorRutas] = useState<string | null>(null);

  // 🚵‍♂️ Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🚵‍♂️ CARGAR RUTAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadRutas = async () => {
      try {
        setLoadingRutas(true);
        setErrorRutas(null);
        
        console.log('🔄 [MountainBikePage] Cargando TODAS las rutas del backend...');
        
        // 🚵‍♂️ OBTENER TODAS LAS CANCHAS/RUTAS
        const todasLasRutas = await canchaService.getCanchas();
        console.log('✅ [MountainBikePage] Todas las rutas obtenidas:', todasLasRutas);
        
        // 🚵‍♂️ FILTRAR RUTAS DE MOUNTAIN BIKE
        const rutasDeMTB = todasLasRutas.filter((ruta: any) => {
          console.log(`🔍 [MountainBikePage] Evaluando ruta ID ${ruta.id}: tipo="${ruta.tipo}"`);
          return ['mountain bike', 'mtb', 'ciclismo', 'bicicleta'].includes(ruta.tipo.toLowerCase());
        });
        
        console.log('🚵‍♂️ [MountainBikePage] Rutas de mountain bike encontradas:', rutasDeMTB.length);
        
        // 🚵‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA RUTA
        const rutasMapeadas = await Promise.all(
          rutasDeMTB.map(async (ruta: any) => {
            let complejoData = null;
            let addressInfo = `Centro MTB ${ruta.establecimientoId}`;
            
            // 🚵‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
            if (ruta.establecimientoId) {
              try {
                console.log(`🔍 [MountainBikePage] Cargando complejo ID ${ruta.establecimientoId} para ruta ${ruta.id}`);
                complejoData = await complejosService.getComplejoById(ruta.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [MountainBikePage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [MountainBikePage] Error cargando complejo ${ruta.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(ruta.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🚵‍♂️ MAPEAR RUTA CON DATOS DEL COMPLEJO
            const mappedRuta = {
              id: ruta.id,
              imageUrl: `/sports/mountain-bike/rutas/Ruta${ruta.id}.png`,
              name: ruta.nombre,
              address: addressInfo, // 🚵‍♂️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: ruta.rating || 4.6,
              tags: [
                ruta.techada ? "Sendero Cubierto" : "Sendero Abierto",
                ruta.activa ? "Disponible" : "No disponible",
                "Sendero Natural"
              ],
              description: `Ruta de ${ruta.tipo} ${ruta.nombre} - ID: ${ruta.id}`,
              price: ruta.precioPorHora?.toString() || "25",
              nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
              sport: ruta.tipo
            };
            
            console.log('🗺️ [MountainBikePage] Ruta mapeada:', mappedRuta);
            return mappedRuta;
          })
        );
        
        console.log('🎉 [MountainBikePage] Rutas con datos de complejo cargadas:', rutasMapeadas.length);
        setRutas(rutasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [MountainBikePage] ERROR cargando rutas:', error);
        setErrorRutas(`Error: ${error.message}`);
        
        // 🚵‍♂️ FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const rutasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/mountain-bike/mountain-bike.png",
            name: "🚨 FALLBACK - Sendero Cordillera",
            address: "Centro MTB Cordillera - Cordillera de Nahuelbuta, Temuco",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Sendero Abierto", "Dificultad Media"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "25",
            nextAvailable: "Disponible ahora",
          },
          {
            id: 2,
            imageUrl: "/sports/mountain-bike/mountain-bike.png",
            name: "🚨 FALLBACK - Ruta del Bosque",
            address: "Base Mountain Bike Sur - Camino a Cunco Km 15, Temuco",
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Sendero Natural", "Dificultad Alta"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "30",
            nextAvailable: "Disponible ahora", 
          },
          {
            id: 3,
            imageUrl: "/sports/mountain-bike/mountain-bike.png",
            name: "🚨 FALLBACK - Trail Araucanía",
            address: "MTB Park Araucanía - Ruta 5 Sur Km 680, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Sendero Técnico", "Dificultad Extrema"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "35",
            nextAvailable: "Disponible ahora",
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

  // 🚵‍♂️ USAR RUTAS REALES PARA EL CARRUSEL
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
    router.push(`/sports/mountain-bike/rutas/rutaseleccionada?id=${route.id}`);
  };

  // 🚵‍♂️ Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🚵‍♂️ ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...mountainBikeStats[0],
      value: rutas.filter(r => r.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...mountainBikeStats[1],
      value: rutas.length > 0 ? 
        `$${Math.min(...rutas.map(r => parseInt(r.price || '0')))}-${Math.max(...rutas.map(r => parseInt(r.price || '0')))}` : 
        "$15-35"
    },
    {
      ...mountainBikeStats[2],
      value: rutas.length > 0 ? 
        `${(rutas.reduce((acc, r) => acc + r.rating, 0) / rutas.length).toFixed(1)}⭐` : 
        "4.6⭐"
    },
    mountainBikeStats[3] // Mantener ciclistas por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="mountain-bike" />
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
      <Sidebar userRole="usuario" sport="mountain-bike" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚵‍♂️</div>
            <h1 className={styles.headerTitle}>Mountain Bike</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta..."
              sport="mountain-bike" 
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

        {/* 🚵‍♂️ STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Mountain Bike en Temuco
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
                sport="mountain-bike"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Rutas")) {
                    router.push('/sports/mountain-bike/rutas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/mountain-bike/rutas/'}
          >
            <div className={styles.courtButtonIcon}>🚵‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Rutas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las rutas de mountain bike disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🚵‍♂️ CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Rutas de mountain bike mejor calificadas
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
                <p>Cargando rutas de mountain bike...</p>
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
                    sport="mountain-bike"
                    onClick={() => handleRutaClick(route)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las rutas de mountain bike</h2>
          
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
            sport="mountain-bike"
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