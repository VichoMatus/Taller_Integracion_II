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

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE FÚTBOL
const footballStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "15",
    icon: "⚽",
    subtitle: "Listas para reservar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$20-40",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 7, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.5⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.2, isPositive: true }
  },
  {
    title: "Jugadores en Cancha",
    value: "22",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 8, isPositive: true }
  }
];

// 🔥 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Complejo Deportivo Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Complejo Deportivo Centro", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Complejo Deportivo Sur",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Complejo Deportivo",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function FutbolPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA CANCHAS DEL BACKEND
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loadingCanchas, setLoadingCanchas] = useState(true);
  const [errorCanchas, setErrorCanchas] = useState<string | null>(null);

  // 🔥 Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🔥 CARGAR CANCHAS DEL BACKEND CON DATOS DE COMPLEJO - CORREGIDO
  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoadingCanchas(true);
        setErrorCanchas(null);
        
        console.log('🔄 [FutbolPage] Cargando TODAS las canchas del backend...');
        
        // 🔥 OBTENER TODAS LAS CANCHAS
        const response = await canchaService.getCanchas();
        console.log('✅ [FutbolPage] Respuesta completa:', response);
        
        // 🔥 VALIDAR QUE LA RESPUESTA SEA UN ARRAY - CORRECCIÓN PRINCIPAL
        const todasLasCanchas = Array.isArray(response) 
          ? response 
          : Array.isArray(response?.data) 
            ? response.data 
            : Array.isArray(response?.items) 
              ? response.items 
              : [];
        
        if (!Array.isArray(todasLasCanchas)) {
          throw new Error('La respuesta del servidor no contiene un array de canchas válido');
        }
        
        console.log('✅ [FutbolPage] Canchas validadas como array:', todasLasCanchas);
        console.log('📊 [FutbolPage] Total de canchas recibidas:', todasLasCanchas.length);
        
        // 🔥 FILTRAR CANCHAS DE FÚTBOL, FUTSAL Y FUTBOLITO
        const canchasDeFutbol = todasLasCanchas.filter((cancha: any) => {
          console.log(`🔍 [FutbolPage] Evaluando cancha ID ${cancha.id}: tipo="${cancha.tipo}"`);
          return ['futbol', 'futsal', 'futbolito'].includes(cancha.tipo);
        });

        console.log('⚽ [FutbolPage] Canchas de fútbol encontradas:', canchasDeFutbol.length);
        
        if (canchasDeFutbol.length === 0) {
          console.warn('⚠️ [FutbolPage] No se encontraron canchas de fútbol, usando fallback');
          throw new Error('No se encontraron canchas de fútbol en la respuesta del servidor');
        }
        
        // 🔥 OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
        const canchasMapeadas = await Promise.all(
          canchasDeFutbol.map(async (cancha: any) => {
            let complejoData = null;
            let addressInfo = `Complejo ${cancha.establecimientoId}`;
            
            // 🔥 INTENTAR OBTENER DATOS DEL COMPLEJO
            if (cancha.establecimientoId) {
              try {
                console.log(`🔍 [FutbolPage] Cargando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
                complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [FutbolPage] Complejo cargado: ${addressInfo}`);
                } else {
                  console.warn(`⚠️ [FutbolPage] Complejo ${cancha.establecimientoId} no encontrado, usando fallback`);
                  const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
                  addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [FutbolPage] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            } else {
              console.warn(`⚠️ [FutbolPage] Cancha ${cancha.id} no tiene establecimientoId`);
              const staticComplejo = getStaticComplejoData(1); // Usar complejo por defecto
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
            
            // 🔥 MAPEAR CANCHA CON DATOS DEL COMPLEJO
            const mappedCancha = {
              id: cancha.id,
              imageUrl: `/sports/futbol/canchas/Cancha${cancha.id}.png`,
              name: cancha.nombre || `Cancha ${cancha.id}`,
              address: addressInfo,
              rating: cancha.rating || 4.9,
              tags: [
                cancha.techada ? "Techada" : "Al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                cancha.tipo.charAt(0).toUpperCase() + cancha.tipo.slice(1)
              ],
              description: `Cancha de ${cancha.tipo} ${cancha.nombre || `ID: ${cancha.id}`}`,
              price: cancha.precioPorHora?.toString() || "25",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: cancha.tipo
            };
            
            console.log('🗺️ [FutbolPage] Cancha mapeada:', mappedCancha);
            return mappedCancha;
          })
        );
        
        console.log('🎉 [FutbolPage] Canchas con datos de complejo cargadas:', canchasMapeadas.length);
        setCanchas(canchasMapeadas);
        
      } catch (error: any) {
        console.error('❌ [FutbolPage] ERROR cargando canchas:', error);
        setErrorCanchas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        console.log('🔄 [FutbolPage] Aplicando fallback con datos estáticos...');
        const canchasEstaticas = [
          {
            id: 1,
            imageUrl: "/sports/futbol/canchas/Cancha1.png",
            name: "🚨 FALLBACK - Fútbol Centro",
            address: "Complejo Deportivo Norte - Av. Alemania 1234, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "35",
            nextAvailable: "20:00-21:00",
            sport: "futbol"
          },
          {
            id: 2,
            imageUrl: "/sports/futbol/canchas/Cancha2.png",
            name: "🚨 FALLBACK - Futsal Norte",
            address: "Complejo Deportivo Centro - Av. Pedro de Valdivia 567, Temuco",
            rating: 3.5,
            tags: ["DATOS OFFLINE", "Estacionamiento", "Futsal"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "92",
            nextAvailable: "14:30-15:30",
            sport: "futsal"
          },
          {
            id: 3,
            imageUrl: "/sports/futbol/canchas/Cancha3.png",
            name: "🚨 FALLBACK - Futbolito Sur",
            address: "Complejo Deportivo Sur - Calle Montt 890, Temuco",
            rating: 2.1,
            tags: ["DATOS OFFLINE", "Estacionamiento", "Futbolito"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "77",
            nextAvailable: "Mañana 09:00-10:00",
            sport: "futbolito"
          }
        ];
        
        setCanchas(canchasEstaticas);
        console.log('✅ [FutbolPage] Fallback aplicado correctamente');
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

  // 🔥 USAR CANCHAS REALES PARA EL CARRUSEL
  const topRatedCourts = canchas.slice(0, 6);
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
    router.push(`/sports/futbol/canchas/canchaseleccionada?id=${court.id}`);
  };

  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🔥 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...footballStats[0],
      value: canchas.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...footballStats[1],
      value: canchas.length > 0 ? 
        `$${Math.min(...canchas.map(c => parseInt(c.price || '0')))}-${Math.max(...canchas.map(c => parseInt(c.price || '0')))}` : 
        "$20-40"
    },
    {
      ...footballStats[2],
      value: canchas.length > 0 ? 
        `${(canchas.reduce((acc, c) => acc + c.rating, 0) / canchas.length).toFixed(1)}⭐` : 
        "4.5⭐"
    },
    footballStats[3]
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol" />
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
      <Sidebar userRole="usuario" sport="futbol" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>Fútbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="futbol" 
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

        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Fútbol en Temuco
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
                sport="futbol"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/futbol/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/futbol/canchas/'}
          >
            <div className={styles.courtButtonIcon}>⚽</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Canchas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las canchas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

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
                    sport="futbol"
                    onClick={() => handleCanchaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

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
            sport="futbol"
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