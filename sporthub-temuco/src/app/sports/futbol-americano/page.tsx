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

// 🏈 DATOS PARA LAS ESTADÍSTICAS DE FÚTBOL AMERICANO
const footballAmericanoStats = [
  {
    title: "Estadios Disponibles Hoy",
    value: "4",
    icon: "🏈",
    subtitle: "Listos para reservar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$50-80",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 10, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestros estadios",
    trend: { value: 0.4, isPositive: true }
  },
  {
    title: "Jugadores Activos",
    value: "44",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 12, isPositive: true }
  }
];

// 🏈 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Estadio Nacional Temuco",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Complejo Deportivo NFL Chile", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Estadio Araucanía Football",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Estadio de Fútbol Americano",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function FutbolAmericanoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🏈 ESTADOS PARA ESTADIOS DEL BACKEND
  const [estadios, setEstadios] = useState<any[]>([]);
  const [loadingEstadios, setLoadingEstadios] = useState(true);
  const [errorEstadios, setErrorEstadios] = useState<string | null>(null);

  // 🏈 Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🏈 CARGAR ESTADIOS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadEstadios = async () => {
      try {
        setLoadingEstadios(true);
        setErrorEstadios(null);
        
        console.log('🔄 [FutbolAmericanoPage] Cargando TODAS las canchas del backend...');
        
        // 🏈 OBTENER TODAS LAS CANCHAS
        const todasLasCanchas = await canchaService.getCanchas();
        console.log('✅ [FutbolAmericanoPage] Todas las canchas obtenidas:', todasLasCanchas);
        
        // 🏈 FILTRAR ESTADIOS DE FÚTBOL AMERICANO
        const estadiosDeFutbolAmericano = todasLasCanchas.filter((cancha: any) => {
          console.log(`🔍 [FutbolAmericanoPage] Evaluando cancha ID ${cancha.id}: tipo="${cancha.tipo}"`);
          return ['futbol americano', 'american football', 'football americano'].includes(cancha.tipo.toLowerCase());
        });
        
        console.log('🏈 [FutbolAmericanoPage] Estadios de fútbol americano encontrados:', estadiosDeFutbolAmericano.length);
        
        // 🏈 OBTENER DATOS DE COMPLEJOS PARA CADA ESTADIO
        const estadiosMapeados = await Promise.all(
          estadiosDeFutbolAmericano.map(async (cancha: any) => {
            let complejoData = null;
            let addressInfo = `Estadio ${cancha.establecimientoId}`;
            
            // 🏈 INTENTAR OBTENER DATOS DEL COMPLEJO
            if (cancha.establecimientoId) {
              try {
                console.log(`🔍 [FutbolAmericanoPage] Cargando complejo ID ${cancha.establecimientoId} para estadio ${cancha.id}`);
                complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [FutbolAmericanoPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [FutbolAmericanoPage] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🏈 MAPEAR ESTADIO CON DATOS DEL COMPLEJO
            const mappedEstadio = {
              id: cancha.id,
              imageUrl: `/sports/futbol-americano/estadios/Estadio${cancha.id}.png`,
              name: cancha.nombre,
              address: addressInfo, // 🏈 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: cancha.rating || 4.7,
              tags: [
                cancha.techada ? "Estadio Techado" : "Estadio Exterior",
                cancha.activa ? "Disponible" : "No disponible",
                "Postes Oficiales NFL"
              ],
              description: `Estadio de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
              price: cancha.precioPorHora?.toString() || "60",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: cancha.tipo
            };
            
            console.log('🗺️ [FutbolAmericanoPage] Estadio mapeado:', mappedEstadio);
            return mappedEstadio;
          })
        );
        
        console.log('🎉 [FutbolAmericanoPage] Estadios con datos de complejo cargados:', estadiosMapeados.length);
        setEstadios(estadiosMapeados);
        
      } catch (error: any) {
        console.error('❌ [FutbolAmericanoPage] ERROR cargando estadios:', error);
        setErrorEstadios(`Error: ${error.message}`);
        
        // 🏈 FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const estadiosEstaticos = [
          {
            id: 1,
            imageUrl: "/sports/futbol-americano/futbol-americano.png",
            name: "🚨 FALLBACK - Estadio Nacional",
            address: "Estadio Nacional Temuco - Av. Alemania 1234, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Postes NFL", "Césped Natural"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "60",
            nextAvailable: "16:00-18:00",
          },
          {
            id: 2,
            imageUrl: "/sports/futbol-americano/futbol-americano.png",
            name: "🚨 FALLBACK - Complejo NFL Chile",
            address: "Complejo Deportivo NFL Chile - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.9,
            tags: ["DATOS OFFLINE", "Iluminación Profesional", "Gradas"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "75",
            nextAvailable: "14:00-16:00", 
          },
          {
            id: 3,
            imageUrl: "/sports/futbol-americano/futbol-americano.png",
            name: "🚨 FALLBACK - Estadio Araucanía",
            address: "Estadio Araucanía Football - Calle Montt 890, Temuco",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Campo Reglamentario", "Vestuarios"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "55",
            nextAvailable: "Mañana 10:00-12:00",
          }
        ];
        
        setEstadios(estadiosEstaticos);
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

  // 🏈 USAR ESTADIOS REALES PARA EL CARRUSEL
  const topRatedCourts = estadios.slice(0, 6); // Máximo 6 estadios para el carrusel
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

  const handleEstadioClick = (court: any) => {
    console.log('Navegando a estadio:', court);
    router.push(`/sports/futbol-americano/estadios/estadioseleccionado?id=${court.id}`);
  };

  // 🏈 Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🏈 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...footballAmericanoStats[0],
      value: estadios.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...footballAmericanoStats[1],
      value: estadios.length > 0 ? 
        `$${Math.min(...estadios.map(c => parseInt(c.price || '0')))}-${Math.max(...estadios.map(c => parseInt(c.price || '0')))}` : 
        "$50-80"
    },
    {
      ...footballAmericanoStats[2],
      value: estadios.length > 0 ? 
        `${(estadios.reduce((acc, c) => acc + c.rating, 0) / estadios.length).toFixed(1)}⭐` : 
        "4.7⭐"
    },
    footballAmericanoStats[3] // Mantener jugadores por defecto
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

        {/* 🏈 STATS CARDS CON DATOS ACTUALIZADOS */}
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
              <span className={styles.courtButtonSubtitle}>Ver todos los estadios de fútbol americano disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🏈 CARRUSEL CON DATOS REALES */}
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
                <p>Cargando estadios de fútbol americano...</p>
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
                    sport="futbol-americano"
                    onClick={() => handleEstadioClick(court)}
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