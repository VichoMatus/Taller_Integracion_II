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

// 🏀 DATOS PARA LAS ESTADÍSTICAS DE BÁSQUETBOL
const basketballStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "8",
    icon: "🏀",
    subtitle: "Listas para reservar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$18-35",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Jugadores en Cancha",
    value: "10",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 6, isPositive: true }
  }
];

// 🏀 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Gimnasio Municipal Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Centro Deportivo Los Andes", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Polideportivo Universidad",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Gimnasio de Básquetbol",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function BasquetbolPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🏀 ESTADOS PARA CANCHAS DEL BACKEND
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loadingCanchas, setLoadingCanchas] = useState(true);
  const [errorCanchas, setErrorCanchas] = useState<string | null>(null);

  // 🏀 Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🏀 CARGAR CANCHAS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoadingCanchas(true);
        setErrorCanchas(null);
        
        console.log('🔄 [BasquetbolPage] Cargando TODAS las canchas del backend...');
        
        // 🏀 OBTENER TODAS LAS CANCHAS
        const todasLasCanchas = await canchaService.getCanchas();
        console.log('✅ [BasquetbolPage] Todas las canchas obtenidas:', todasLasCanchas);
        
        // 🏀 FILTRAR CANCHAS DE BÁSQUETBOL Y BASKETBALL
        const canchasDeBasquetbol = todasLasCanchas.filter((cancha: any) => {
          console.log(`🔍 [BasquetbolPage] Evaluando cancha ID ${cancha.id}: tipo="${cancha.tipo}"`);
          return ['basquetbol', 'basketball', 'basquet'].includes(cancha.tipo.toLowerCase());
        });
        
        console.log('🏀 [BasquetbolPage] Canchas de básquetbol encontradas:', canchasDeBasquetbol.length);
        
        // 🏀 OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
        const canchasMapeadas = await Promise.all(
          canchasDeBasquetbol.map(async (cancha: any) => {
            let complejoData = null;
            let addressInfo = `Gimnasio ${cancha.establecimientoId}`;
            
            // 🏀 INTENTAR OBTENER DATOS DEL COMPLEJO
            if (cancha.establecimientoId) {
              try {
                console.log(`🔍 [BasquetbolPage] Cargando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
                complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [BasquetbolPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [BasquetbolPage] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🏀 MAPEAR CANCHA CON DATOS DEL COMPLEJO
            const mappedCancha = {
              id: cancha.id,
              imageUrl: `/sports/basquetbol/canchas/Cancha${cancha.id}.png`,
              name: cancha.nombre,
              address: addressInfo, // 🏀 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
              rating: cancha.rating || 4.6,
              tags: [
                cancha.techada ? "Cancha Techada" : "Cancha Exterior",
                cancha.activa ? "Disponible" : "No disponible",
                cancha.tipo.charAt(0).toUpperCase() + cancha.tipo.slice(1) // Capitalizar tipo
              ],
              description: `Cancha de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
              price: cancha.precioPorHora?.toString() || "22",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: "basquetbol"
            };
            
            console.log('🗺️ [BasquetbolPage] Cancha mapeada:', mappedCancha);
            return mappedCancha;
          })
        );
        
        console.log('🎉 [BasquetbolPage] Canchas con datos de complejo cargadas:', canchasMapeadas.length);
        setCanchas(canchasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [BasquetbolPage] ERROR cargando canchas:', error);
        setErrorCanchas(`Error: ${error.message}`);
        
        // 🏀 FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const canchasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/basquetbol/basquetbol.png",
            name: "🚨 FALLBACK - Basquetbol Centro",
            address: "Gimnasio Municipal Norte - Av. Alemania 1234, Temuco", // 🏀 FORMATO MEJORADO
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Cancha Techada", "Piso Sintético"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "22",
            nextAvailable: "18:00-19:00",
            sport: "basquetbol"
          },
          {
            id: 2,
            imageUrl: "/sports/basquetbol/basquetbol.png",
            name: "🚨 FALLBACK - Basketball Norte",
            address: "Centro Deportivo Los Andes - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Cancha Techada", "Tableros Profesionales"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "25",
            nextAvailable: "15:30-16:30",
            sport: "basquetbol"
          },
          {
            id: 3,
            imageUrl: "/sports/basquetbol/basquetbol.png",
            name: "🚨 FALLBACK - Basquet Sur",
            address: "Polideportivo Universidad - Calle Montt 890, Temuco",
            rating: 4.4,
            tags: ["DATOS OFFLINE", "Cancha Exterior", "Concreto"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "18",
            nextAvailable: "Mañana 10:00-11:00",
            sport: "basquetbol"
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

  // 🏀 USAR CANCHAS REALES PARA EL CARRUSEL
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
    router.push(`/sports/basquetbol/canchas/canchaseleccionada?id=${court.id}`);
  };

  // 🏀 Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🏀 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...basketballStats[0],
      value: canchas.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...basketballStats[1],
      value: canchas.length > 0 ? 
        `$${Math.min(...canchas.map(c => parseInt(c.price || '0')))}-${Math.max(...canchas.map(c => parseInt(c.price || '0')))}` : 
        "$18-35"
    },
    {
      ...basketballStats[2],
      value: canchas.length > 0 ? 
        `${(canchas.reduce((acc, c) => acc + c.rating, 0) / canchas.length).toFixed(1)}⭐` : 
        "4.6⭐"
    },
    basketballStats[3] // Mantener jugadores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="basquetbol" />
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
      <Sidebar userRole="usuario" sport="basquetbol" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏀</div>
            <h1 className={styles.headerTitle}>Básquetbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="basquetbol" 
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

        {/* 🏀 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Básquetbol en Temuco
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
                sport="basquetbol"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/basquetbol/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/basquetbol/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🏀</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Canchas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las canchas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🏀 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Canchas mejor calificadas
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
                <p>Cargando canchas...</p>
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
                    sport="basquetbol"
                    onClick={() => handleCanchaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las canchas</h2>
          
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
            sport="basquetbol"
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