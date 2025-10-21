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
import styles from './karting.module.css';

// 🏁 DATOS PARA LAS ESTADÍSTICAS DE KARTING
const kartingStats = [
  {
    title: "Pistas Disponibles Hoy",
    value: "6",
    icon: "🏁",
    subtitle: "Listas para correr",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$30-60",
    icon: "💰",
    subtitle: "Por sesión",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestras pistas",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Pilotos en Pista",
    value: "18",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 6, isPositive: true }
  }
];

// 🏁 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO DE KARTING
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Kartódromo Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Kartódromo Centro", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Kartódromo Sur",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Kartódromo",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function KartingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🏁 ESTADOS PARA PISTAS DEL BACKEND
  const [pistas, setPistas] = useState<any[]>([]);
  const [loadingPistas, setLoadingPistas] = useState(true);
  const [errorPistas, setErrorPistas] = useState<string | null>(null);

  // 🏁 Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🏁 CARGAR PISTAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadPistas = async () => {
      try {
        setLoadingPistas(true);
        setErrorPistas(null);
        
        console.log('🔄 [KartingPage] Cargando TODAS las pistas del backend...');
        
        // 🏁 OBTENER TODAS LAS PISTAS
        const todasLasPistas = await canchaService.getCanchas();
        console.log('✅ [KartingPage] Todas las pistas obtenidas:', todasLasPistas);
        
        // 🏁 FILTRAR PISTAS DE KARTING
        const pistasDeKarting = todasLasPistas.filter((pista: any) => {
          console.log(`🔍 [KartingPage] Evaluando pista ID ${pista.id}: tipo="${pista.tipo}"`);
          return ['karting', 'kart', 'automovilismo'].includes(pista.tipo);
        });
        
        console.log('🏁 [KartingPage] Pistas de karting encontradas:', pistasDeKarting.length);
        
        // 🏁 OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
        const pistasMapeadas = await Promise.all(
          pistasDeKarting.map(async (pista: any) => {
            let complejoData = null;
            let addressInfo = `Kartódromo ${pista.establecimientoId}`;
            
            // 🏁 INTENTAR OBTENER DATOS DEL COMPLEJO
            if (pista.establecimientoId) {
              try {
                console.log(`🔍 [KartingPage] Cargando complejo ID ${pista.establecimientoId} para pista ${pista.id}`);
                complejoData = await complejosService.getComplejoById(pista.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [KartingPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [KartingPage] Error cargando complejo ${pista.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(pista.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🏁 MAPEAR PISTA CON DATOS DEL COMPLEJO
            const mappedPista = {
              id: pista.id,
              imageUrl: `/sports/karting/pistas/Pista${pista.id}.png`,
              name: pista.nombre,
              address: addressInfo, // 🏁 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: pista.rating || 4.7,
              tags: [
                pista.techada ? "Pista cubierta" : "Pista exterior",
                pista.activa ? "Disponible" : "No disponible",
                "Karting",
                "Cronómetro"
              ],
              description: `Pista de karting ${pista.nombre} - ID: ${pista.id}`,
              price: pista.precioPorHora?.toString() || "45",
              nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
              sport: "karting"
            };
            
            console.log('🗺️ [KartingPage] Pista mapeada:', mappedPista);
            return mappedPista;
          })
        );
        
        console.log('🎉 [KartingPage] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
        setPistas(pistasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [KartingPage] ERROR cargando pistas:', error);
        setErrorPistas(`Error: ${error.message}`);
        
        // 🏁 FALLBACK CON DATOS ESTÁTICOS DE KARTING
        const pistasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/karting/pistas/Pista1.png",
            name: "🚨 FALLBACK - Kartódromo Norte",
            address: "Kartódromo Norte - Av. Alemania 1234, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Cronómetro", "Karting Pro"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "45",
            nextAvailable: "15:00-16:00",
          },
          {
            id: 2,
            imageUrl: "/sports/karting/pistas/Pista2.png",
            name: "🚨 FALLBACK - Kartódromo Centro",
            address: "Kartódromo Centro - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Pista Rápida", "Karting"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "40",
            nextAvailable: "18:00-19:00", 
          },
          {
            id: 3,
            imageUrl: "/sports/karting/pistas/Pista3.png",
            name: "🚨 FALLBACK - Kartódromo Sur",
            address: "Kartódromo Sur - Calle Montt 890, Temuco",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Circuito Técnico", "Pro"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "50",
            nextAvailable: "Mañana 10:00-11:00",
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

  // 🏁 USAR PISTAS REALES PARA EL CARRUSEL
  const topRatedTracks = pistas.slice(0, 6); // Máximo 6 pistas para el carrusel
  const totalSlides = Math.max(1, topRatedTracks.length - cardsToShow + 1);

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

  const handlePistaClick = (track: any) => {
    console.log('Navegando a pista:', track);
    router.push(`/sports/karting/canchas/canchaseleccionada?id=${track.id}`);
  };

  // 🏁 Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🏁 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...kartingStats[0],
      value: pistas.filter(p => p.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...kartingStats[1],
      value: pistas.length > 0 ? 
        `$${Math.min(...pistas.map(p => parseInt(p.price || '0')))}-${Math.max(...pistas.map(p => parseInt(p.price || '0')))}` : 
        "$30-60"
    },
    {
      ...kartingStats[2],
      value: pistas.length > 0 ? 
        `${(pistas.reduce((acc, p) => acc + p.rating, 0) / pistas.length).toFixed(1)}⭐` : 
        "4.7⭐"
    },
    kartingStats[3] // Mantener pilotos por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="karting" />
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
      <Sidebar userRole="usuario" sport="karting" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏁</div>
            <h1 className={styles.headerTitle}>Karting</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del kartódromo..."
              sport="karting" 
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

        {/* 🏁 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Karting en Temuco
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
                sport="karting"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Pistas")) {
                    router.push('/sports/karting/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/karting/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🏁</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Kartódromos</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🏁 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Kartódromos mejor calificados
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
                <p>Cargando kartódromos...</p>
              </div>
            ) : (
              <div 
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedTracks.map((track, index) => (
                  <CourtCard 
                    key={track.id || index} 
                    {...track} 
                    sport="karting"
                    onClick={() => handlePistaClick(track)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los kartódromos</h2>
          
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
            sport="karting"
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