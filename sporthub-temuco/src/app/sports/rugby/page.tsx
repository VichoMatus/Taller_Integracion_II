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

// 🏉 DATOS PARA LAS ESTADÍSTICAS DE RUGBY
const rugbyStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "6",
    icon: "🏉",
    subtitle: "Listas para reservar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$25-50",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Jugadores en Cancha",
    value: "30",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 5, isPositive: true }
  }
];

// 🏉 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Club Rugby Elite",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Centro Deportivo Rugby", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Rugby Club Temuco",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Club de Rugby",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function RugbyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🏉 ESTADOS PARA CANCHAS DEL BACKEND
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loadingCanchas, setLoadingCanchas] = useState(true);
  const [errorCanchas, setErrorCanchas] = useState<string | null>(null);

  // 🏉 Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🏉 CARGAR CANCHAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoadingCanchas(true);
        setErrorCanchas(null);
        
        console.log('🔄 [RugbyPage] Cargando TODAS las canchas del backend...');
        
        // 🏉 OBTENER TODAS LAS CANCHAS
        const todasLasCanchas = await canchaService.getCanchas();
        console.log('✅ [RugbyPage] Todas las canchas obtenidas:', todasLasCanchas);
        
        // 🏉 FILTRAR CANCHAS DE RUGBY
        const canchasDeRugby = todasLasCanchas.filter((cancha: any) => {
          console.log(`🔍 [RugbyPage] Evaluando cancha ID ${cancha.id}: tipo="${cancha.tipo}"`);
          return ['rugby', 'rugby 7', 'rugby 15'].includes(cancha.tipo.toLowerCase());
        });
        
        console.log('🏉 [RugbyPage] Canchas de rugby encontradas:', canchasDeRugby.length);
        
        // 🏉 OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
        const canchasMapeadas = await Promise.all(
          canchasDeRugby.map(async (cancha: any) => {
            let complejoData = null;
            let addressInfo = `Complejo ${cancha.establecimientoId}`;
            
            // 🏉 INTENTAR OBTENER DATOS DEL COMPLEJO
            if (cancha.establecimientoId) {
              try {
                console.log(`🔍 [RugbyPage] Cargando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
                complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [RugbyPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [RugbyPage] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🏉 MAPEAR CANCHA CON DATOS DEL COMPLEJO
            const mappedCancha = {
              id: cancha.id,
              imageUrl: `/sports/rugby/canchas/Cancha${cancha.id}.png`,
              name: cancha.nombre,
              address: addressInfo, // 🏉 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: cancha.rating || 4.7,
              tags: [
                cancha.techada ? "Techada" : "Al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                "Postes H Profesionales"
              ],
              description: `Cancha de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
              price: cancha.precioPorHora?.toString() || "35",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: cancha.tipo
            };
            
            console.log('🗺️ [RugbyPage] Cancha mapeada:', mappedCancha);
            return mappedCancha;
          })
        );
        
        console.log('🎉 [RugbyPage] Canchas con datos de complejo cargadas:', canchasMapeadas.length);
        setCanchas(canchasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [RugbyPage] ERROR cargando canchas:', error);
        setErrorCanchas(`Error: ${error.message}`);
        
        // 🏉 FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const canchasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/rugby/rugby.png",
            name: "🚨 FALLBACK - Club Rugby Elite",
            address: "Club Rugby Elite - Av. Alemania 1234, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Postes H", "Césped Natural"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "35",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/rugby/rugby.png",
            name: "🚨 FALLBACK - Centro Deportivo Rugby",
            address: "Centro Deportivo Rugby - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Rugby 7", "Iluminación"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "30",
            nextAvailable: "14:30-15:30", 
          },
          {
            id: 3,
            imageUrl: "/sports/rugby/rugby.png",
            name: "🚨 FALLBACK - Rugby Club Temuco",
            address: "Rugby Club Temuco - Calle Montt 890, Temuco",
            rating: 4.9,
            tags: ["DATOS OFFLINE", "Rugby 15", "Profesional"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "40",
            nextAvailable: "Mañana 09:00-10:00",
          }
        ];
        
        setCanchas(canchasEstaticas);
      } finally {
        setLoadingCanchas(false);
      }
    };

    loadCanchas();
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

  // 🏉 USAR CANCHAS REALES PARA EL CARRUSEL
  const topRatedCourts = canchas.slice(0, 6); // Máximo 6 canchas para el carrusel
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

  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha:', court);
    router.push(`/sports/rugby/canchas/canchaseleccionada?id=${court.id}`);
  };

  // 🏉 Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🏉 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...rugbyStats[0],
      value: canchas.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...rugbyStats[1],
      value: canchas.length > 0 ? 
        `$${Math.min(...canchas.map(c => parseInt(c.price || '0')))}-${Math.max(...canchas.map(c => parseInt(c.price || '0')))}` : 
        "$25-50"
    },
    {
      ...rugbyStats[2],
      value: canchas.length > 0 ? 
        `${(canchas.reduce((acc, c) => acc + c.rating, 0) / canchas.length).toFixed(1)}⭐` : 
        "4.7⭐"
    },
    rugbyStats[3] // Mantener jugadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="rugby" />
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
      <Sidebar userRole="usuario" sport="rugby" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏉</div>
            <h1 className={styles.headerTitle}>Rugby</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="rugby" 
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

        {/* 🏉 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Rugby en Temuco
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
                sport="rugby"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/rugby/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/rugby/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🏉</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Canchas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las canchas de rugby disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🏉 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Canchas de rugby mejor calificadas
              {loadingCanchas && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorCanchas && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button 
                onClick={prevSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingCanchas}
                style={{ opacity: currentSlide === 0 || loadingCanchas ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingCanchas}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingCanchas ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          
          <div className={styles.carouselContainer}>
            {loadingCanchas ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando canchas de rugby...</p>
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
                    sport="rugby"
                    onClick={() => handleCanchaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las canchas de rugby</h2>
          
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
            sport="rugby"
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