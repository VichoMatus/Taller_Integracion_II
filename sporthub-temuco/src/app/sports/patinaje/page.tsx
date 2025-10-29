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

// ⛸️ DATOS PARA LAS ESTADÍSTICAS DE PATINAJE
const patinajeStats = [
  {
    title: "Pistas Disponibles Hoy",
    value: "4",
    icon: "⛸️",
    subtitle: "Listas para reservar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$18-30",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 3, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.8⭐",
    icon: "🏆",
    subtitle: "De nuestras pistas",
    trend: { value: 0.4, isPositive: true }
  },
  {
    title: "Patinadores Activos",
    value: "18",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 5, isPositive: true }
  }
];

// ⛸️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Pista de Hielo Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Centro de Patinaje Centro", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Patinodromo Sur",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Centro de Patinaje",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function PatinajePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // ⛸️ ESTADOS PARA PISTAS DEL BACKEND
  const [pistas, setPistas] = useState<any[]>([]);
  const [loadingPistas, setLoadingPistas] = useState(true);
  const [errorPistas, setErrorPistas] = useState<string | null>(null);

  // ⛸️ Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // ⛸️ CARGAR PISTAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadPistas = async () => {
      try {
        setLoadingPistas(true);
        setErrorPistas(null);
        
        console.log('🔄 [PatinajePage] Cargando TODAS las canchas del backend...');
        
        // ⛸️ OBTENER TODAS LAS CANCHAS
        const todasLasCanchas = await canchaService.getCanchas();
        console.log('✅ [PatinajePage] Todas las canchas obtenidas:', todasLasCanchas);
        
        // ⛸️ FILTRAR PISTAS DE PATINAJE
        const pistasDePatinaje = todasLasCanchas.filter((cancha: any) => {
          console.log(`🔍 [PatinajePage] Evaluando cancha ID ${cancha.id}: tipo="${cancha.tipo}"`);
          return ['patinaje', 'pista de hielo', 'skating', 'hockey sobre hielo'].includes(cancha.tipo.toLowerCase());
        });
        
        console.log('⛸️ [PatinajePage] Pistas de patinaje encontradas:', pistasDePatinaje.length);
        
        // ⛸️ OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
        const pistasMapeadas = await Promise.all(
          pistasDePatinaje.map(async (cancha: any) => {
            let complejoData = null;
            let addressInfo = `Complejo ${cancha.establecimientoId}`;
            
            // ⛸️ INTENTAR OBTENER DATOS DEL COMPLEJO
            if (cancha.establecimientoId) {
              try {
                console.log(`🔍 [PatinajePage] Cargando complejo ID ${cancha.establecimientoId} para pista ${cancha.id}`);
                complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [PatinajePage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [PatinajePage] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // ⛸️ MAPEAR PISTA CON DATOS DEL COMPLEJO
            const mappedPista = {
              id: cancha.id,
              imageUrl: `/sports/patinaje/pistas/Pista${cancha.id}.png`,
              name: cancha.nombre,
              address: addressInfo, // ⛸️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: cancha.rating || 4.8,
              tags: [
                cancha.techada ? "Techada" : "Al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                "Superficie de Hielo"
              ],
              description: `Pista de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
              price: cancha.precioPorHora?.toString() || "20",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: cancha.tipo
            };
            
            console.log('🗺️ [PatinajePage] Pista mapeada:', mappedPista);
            return mappedPista;
          })
        );
        
        console.log('🎉 [PatinajePage] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
        setPistas(pistasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [PatinajePage] ERROR cargando pistas:', error);
        setErrorPistas(`Error: ${error.message}`);
        
        // ⛸️ FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const pistasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/patinaje/patinaje.png",
            name: "🚨 FALLBACK - Pista Hielo Norte",
            address: "Pista de Hielo Norte - Av. Alemania 1234, Temuco",
            rating: 4.9,
            tags: ["DATOS OFFLINE", "Techada", "Superficie de Hielo"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "25",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/patinaje/patinaje.png",
            name: "🚨 FALLBACK - Centro Patinaje",
            address: "Centro de Patinaje Centro - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Techada", "Patinaje Artístico"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "20",
            nextAvailable: "14:30-15:30", 
          },
          {
            id: 3,
            imageUrl: "/sports/patinaje/patinaje.png",
            name: "🚨 FALLBACK - Patinodromo Sur",
            address: "Patinodromo Sur - Calle Montt 890, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Al aire libre", "Hockey sobre Hielo"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "22",
            nextAvailable: "Mañana 09:00-10:00",
          }
        ];
        
        setPistas(pistasEstaticas);
      } finally {
        setLoadingPistas(false);
      }
    };

    loadPistas();
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

  // ⛸️ USAR PISTAS REALES PARA EL CARRUSEL
  const topRatedCourts = pistas.slice(0, 6); // Máximo 6 pistas para el carrusel
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

  const handlePistaClick = (court: any) => {
    console.log('Navegando a pista:', court);
    router.push(`/sports/patinaje/pistas/pistaseleccionada?id=${court.id}`);
  };

  // ⛸️ Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // ⛸️ ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...patinajeStats[0],
      value: pistas.filter(p => p.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...patinajeStats[1],
      value: pistas.length > 0 ? 
        `$${Math.min(...pistas.map(p => parseInt(p.price || '0')))}-${Math.max(...pistas.map(p => parseInt(p.price || '0')))}` : 
        "$18-30"
    },
    {
      ...patinajeStats[2],
      value: pistas.length > 0 ? 
        `${(pistas.reduce((acc, p) => acc + p.rating, 0) / pistas.length).toFixed(1)}⭐` : 
        "4.8⭐"
    },
    patinajeStats[3] // Mantener patinadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="patinaje" />
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
      <Sidebar userRole="usuario" sport="patinaje" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⛸️</div>
            <h1 className={styles.headerTitle}>Patinaje</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista..."
              sport="patinaje" 
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

        {/* ⛸️ STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Patinaje en Temuco
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
                sport="patinaje"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Pistas")) {
                    router.push('/sports/patinaje/pistas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/patinaje/pistas/'}
          >
            <div className={styles.courtButtonIcon}>⛸️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Pistas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las pistas de patinaje disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* ⛸️ CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Pistas de patinaje mejor calificadas
              {loadingPistas && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorPistas && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button 
                onClick={prevSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingPistas}
                style={{ opacity: currentSlide === 0 || loadingPistas ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingPistas}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingPistas ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          
          <div className={styles.carouselContainer}>
            {loadingPistas ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando pistas de patinaje...</p>
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
                    sport="patinaje"
                    onClick={() => handlePistaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las pistas de patinaje</h2>
          
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
            sport="patinaje"
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