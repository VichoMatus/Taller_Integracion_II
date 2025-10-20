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

// 🚴‍♂️ DATOS PARA LAS ESTADÍSTICAS DE CICLISMO
const ciclistasStats = [
  {
    title: "Pistas Disponibles Hoy",
    value: "8",
    icon: "🚴‍♂️",
    subtitle: "Listas para entrenar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$12-25",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 3, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestras pistas",
    trend: { value: 0.4, isPositive: true }
  },
  {
    title: "Ciclistas en Pista",
    value: "15",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 6, isPositive: true }
  }
];

// 🚴‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO DE CICLISMO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Velódromo Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Pista de Ciclismo Centro", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Circuito Ciclístico Sur",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Centro de Ciclismo",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function CiclismoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🚴‍♂️ ESTADOS PARA PISTAS DEL BACKEND
  const [pistas, setPistas] = useState<any[]>([]);
  const [loadingPistas, setLoadingPistas] = useState(true);
  const [errorPistas, setErrorPistas] = useState<string | null>(null);

  // 🚴‍♂️ Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🚴‍♂️ CARGAR PISTAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadPistas = async () => {
      try {
        setLoadingPistas(true);
        setErrorPistas(null);
        
        console.log('🔄 [CiclismoPage] Cargando TODAS las pistas del backend...');
        
        // 🚴‍♂️ OBTENER TODAS LAS CANCHAS/PISTAS
        const todasLasPistas = await canchaService.getCanchas();
        console.log('✅ [CiclismoPage] Todas las pistas obtenidas:', todasLasPistas);
        
        // 🚴‍♂️ FILTRAR PISTAS DE CICLISMO
        const pistasDeCiclismo = todasLasPistas.filter((pista: any) => {
          console.log(`🔍 [CiclismoPage] Evaluando pista ID ${pista.id}: tipo="${pista.tipo}"`);
          return ['ciclismo', 'velodromo', 'bicicleta', 'cycling'].includes(pista.tipo);
        });
        
        console.log('🚴‍♂️ [CiclismoPage] Pistas de ciclismo encontradas:', pistasDeCiclismo.length);
        
        // 🚴‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
        const pistasMapeadas = await Promise.all(
          pistasDeCiclismo.map(async (pista: any) => {
            let complejoData = null;
            let addressInfo = `Complejo ${pista.establecimientoId}`;
            
            // 🚴‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
            if (pista.establecimientoId) {
              try {
                console.log(`🔍 [CiclismoPage] Cargando complejo ID ${pista.establecimientoId} para pista ${pista.id}`);
                complejoData = await complejosService.getComplejoById(pista.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [CiclismoPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [CiclismoPage] Error cargando complejo ${pista.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(pista.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🚴‍♂️ MAPEAR PISTA CON DATOS DEL COMPLEJO
            const mappedPista = {
              id: pista.id,
              imageUrl: `/sports/ciclismo/pistas/Pista${pista.id}.png`,
              name: pista.nombre,
              address: addressInfo, // 🚴‍♂️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: pista.rating || 4.7,
              tags: [
                pista.techada ? "Pista cubierta" : "Pista exterior",
                pista.activa ? "Disponible" : "No disponible",
                "Velódromo oficial",
                "Cronometraje"
              ],
              description: `Pista de ciclismo ${pista.nombre} - ID: ${pista.id}`,
              price: pista.precioPorHora?.toString() || "18",
              nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
              sport: "ciclismo"
            };
            
            console.log('🗺️ [CiclismoPage] Pista mapeada:', mappedPista);
            return mappedPista;
          })
        );
        
        console.log('🎉 [CiclismoPage] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
        setPistas(pistasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [CiclismoPage] ERROR cargando pistas:', error);
        setErrorPistas(`Error: ${error.message}`);
        
        // 🚴‍♂️ FALLBACK CON DATOS ESTÁTICOS DE CICLISMO
        const pistasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/ciclismo/pistas/Pista1.png",
            name: "🚨 FALLBACK - Velódromo Principal",
            address: "Velódromo Norte - Av. Alemania 1234, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Velódromo", "250m", "Pista exterior"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "20",
            nextAvailable: "06:00-07:00",
          },
          {
            id: 2,
            imageUrl: "/sports/ciclismo/pistas/Pista2.png",
            name: "🚨 FALLBACK - Pista de Entrenamiento",
            address: "Pista de Ciclismo Centro - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Entrenamiento", "400m", "Pista cubierta"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "15",
            nextAvailable: "16:00-17:00", 
          },
          {
            id: 3,
            imageUrl: "/sports/ciclismo/pistas/Pista3.png",
            name: "🚨 FALLBACK - Circuito BMX",
            address: "Circuito Ciclístico Sur - Calle Montt 890, Temuco",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "BMX", "Circuito", "Obstáculos"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "12",
            nextAvailable: "Mañana 08:00-09:00",
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

  // 🚴‍♂️ USAR PISTAS REALES PARA EL CARRUSEL
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
    router.push(`/sports/ciclismo/canchas/canchaseleccionada?id=${track.id}`);
  };

  // 🚴‍♂️ Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🚴‍♂️ ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...ciclistasStats[0],
      value: pistas.filter(p => p.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...ciclistasStats[1],
      value: pistas.length > 0 ? 
        `$${Math.min(...pistas.map(p => parseInt(p.price || '0')))}-${Math.max(...pistas.map(p => parseInt(p.price || '0')))}` : 
        "$12-25"
    },
    {
      ...ciclistasStats[2],
      value: pistas.length > 0 ? 
        `${(pistas.reduce((acc, p) => acc + p.rating, 0) / pistas.length).toFixed(1)}⭐` : 
        "4.7⭐"
    },
    ciclistasStats[3] // Mantener ciclistas por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="ciclismo" />
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
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}></div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista..."
              sport="ciclismo" 
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

        {/* 🚴‍♂️ STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Ciclismo en Temuco
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
                sport="ciclismo"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Pistas")) {
                    router.push('/sports/ciclismo/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/ciclismo/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🚴‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Pistas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🚴‍♂️ CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Pistas mejor calificadas
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
                <p>Cargando pistas...</p>
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
                    sport="ciclismo"
                    onClick={() => handlePistaClick(track)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las pistas</h2>
          
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
            sport="ciclismo"
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
