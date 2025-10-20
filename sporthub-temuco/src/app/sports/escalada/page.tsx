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

// 🧗‍♂️ DATOS PARA LAS ESTADÍSTICAS DE ESCALADA
const escaladaStats = [
  {
    title: "Muros Disponibles Hoy",
    value: "8",
    icon: "🧗‍♂️",
    subtitle: "Listos para escalar",
    trend: { value: 2, isPositive: true }
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
    subtitle: "De nuestros muros",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Escaladores Activos",
    value: "16",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 4, isPositive: true }
  }
];

// 🧗‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Centro de Escalada Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Rocódromo Centro", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Climbing Wall Sur",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Centro de Escalada",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };

  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

export default function EscaladaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🧗‍♂️ ESTADOS PARA CENTROS DEL BACKEND
  const [centros, setCentros] = useState<any[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(true);
  const [errorCentros, setErrorCentros] = useState<string | null>(null);

  // 🧗‍♂️ Hook de autenticación
  const { buttonProps } = useAuthStatus();

  // 🧗‍♂️ CARGAR CENTROS DEL BACKEND CON DATOS DE COMPLEJO
  useEffect(() => {
    const loadCentros = async () => {
      try {
        setLoadingCentros(true);
        setErrorCentros(null);
        
        console.log('🔄 [EscaladaPage] Cargando TODAS las instalaciones del backend...');
        
        // 🧗‍♂️ OBTENER TODAS LAS INSTALACIONES
        const todasLasInstalaciones = await canchaService.getCanchas();
        console.log('✅ [EscaladaPage] Todas las instalaciones obtenidas:', todasLasInstalaciones);
        
        // 🧗‍♂️ FILTRAR INSTALACIONES DE ESCALADA
        const centrosDeEscalada = todasLasInstalaciones.filter((instalacion: any) => {
          console.log(`🔍 [EscaladaPage] Evaluando instalación ID ${instalacion.id}: tipo="${instalacion.tipo}"`);
          return ['escalada', 'climbing', 'rocodromo', 'boulder'].includes(instalacion.tipo.toLowerCase());
        });
        
        console.log('🧗‍♂️ [EscaladaPage] Centros de escalada encontrados:', centrosDeEscalada.length);
        
        // 🧗‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA CENTRO
        const centrosMapeados = await Promise.all(
          centrosDeEscalada.map(async (centro: any) => {
            let complejoData = null;
            let addressInfo = `Complejo ${centro.establecimientoId}`;
            
            // 🧗‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
            if (centro.establecimientoId) {
              try {
                console.log(`🔍 [EscaladaPage] Cargando complejo ID ${centro.establecimientoId} para centro ${centro.id}`);
                complejoData = await complejosService.getComplejoById(centro.establecimientoId);
                
                if (complejoData) {
                  addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                  console.log(`✅ [EscaladaPage] Complejo cargado: ${addressInfo}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [EscaladaPage] Error cargando complejo ${centro.establecimientoId}:`, complejoError.message);
                // Usar datos de fallback
                const staticComplejo = getStaticComplejoData(centro.establecimientoId);
                addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
              }
            }
            
            // 🧗‍♂️ MAPEAR CENTRO CON DATOS DEL COMPLEJO
            const mappedCentro = {
              id: centro.id,
              imageUrl: `/sports/escalada/centros/Centro${centro.id}.png`,
              name: centro.nombre,
              address: addressInfo,
              rating: centro.rating || 4.7,
              tags: [
                centro.techada ? "Techado" : "Al aire libre",
                centro.activa ? "Disponible" : "No disponible",
                "Muros de Escalada"
              ],
              description: `Centro de ${centro.tipo} ${centro.nombre} - ID: ${centro.id}`,
              price: centro.precioPorHora?.toString() || "18",
              nextAvailable: centro.activa ? "Disponible ahora" : "No disponible",
              sport: centro.tipo
            };
            
            console.log('🗺️ [EscaladaPage] Centro mapeado:', mappedCentro);
            return mappedCentro;
          })
        );
        
        console.log('🎉 [EscaladaPage] Centros con datos de complejo cargados:', centrosMapeados.length);
        setCentros(centrosMapeados);
        
      } catch (error: any) {
        console.error('❌ [EscaladaPage] ERROR cargando centros:', error);
        setErrorCentros(`Error: ${error.message}`);
        
        // 🧗‍♂️ FALLBACK CON DATOS ESTÁTICOS MEJORADOS
        const centrosEstaticos = [
          {
            id: 1,
            imageUrl: "/sports/escalada/escalada.png",
            name: "🚨 FALLBACK - Rocódromo Norte",
            address: "Centro de Escalada Norte - Av. Alemania 1234, Temuco",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Techado", "Boulder"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "18",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/escalada/escalada.png",
            name: "🚨 FALLBACK - Climbing Center",
            address: "Rocódromo Centro - Av. Pedro de Valdivia 567, Temuco",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Techado", "Rutas Variadas"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "15",
            nextAvailable: "14:30-15:30", 
          },
          {
            id: 3,
            imageUrl: "/sports/escalada/escalada.png",
            name: "🚨 FALLBACK - Muro Sur",
            address: "Climbing Wall Sur - Calle Montt 890, Temuco",
            rating: 4.9,
            tags: ["DATOS OFFLINE", "Al aire libre", "Escalada Natural"],
            description: "🚨 Datos de fallback - API no disponible",
            price: "22",
            nextAvailable: "Mañana 09:00-10:00",
          }
        ];
        
        setCentros(centrosEstaticos);
      } finally {
        setLoadingCentros(false);
      }
    };

    loadCentros();
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

  // 🧗‍♂️ USAR CENTROS REALES PARA EL CARRUSEL
  const topRatedCenters = centros.slice(0, 6); // Máximo 6 centros para el carrusel
  const totalSlides = Math.max(1, topRatedCenters.length - cardsToShow + 1);

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

  const handleCentroClick = (center: any) => {
    console.log('Navegando a centro:', center);
    router.push(`/sports/escalada/centros/centroseleccionado?id=${center.id}`);
  };

  // 🧗‍♂️ Manejador del botón de usuario
  const handleUserButtonClick = () => {
    if (!buttonProps.disabled) {
      router.push(buttonProps.href);
    }
  };

  // 🧗‍♂️ ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...escaladaStats[0],
      value: centros.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    {
      ...escaladaStats[1],
      value: centros.length > 0 ? 
        `$${Math.min(...centros.map(c => parseInt(c.price || '0')))}-${Math.max(...centros.map(c => parseInt(c.price || '0')))}` : 
        "$12-25"
    },
    {
      ...escaladaStats[2],
      value: centros.length > 0 ? 
        `${(centros.reduce((acc, c) => acc + c.rating, 0) / centros.length).toFixed(1)}⭐` : 
        "4.7⭐"
    },
    escaladaStats[3] // Mantener escaladores por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="escalada" />
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
      <Sidebar userRole="usuario" sport="escalada" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🧗‍♂️</div>
            <h1 className={styles.headerTitle}>Escalada</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del centro..."
              sport="escalada" 
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

        {/* 🧗‍♂️ STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas de Escalada en Temuco
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
                sport="escalada"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Muros")) {
                    router.push('/sports/escalada/centros');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/escalada/centros/'}
          >
            <div className={styles.courtButtonIcon}>🧗‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Centros</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los centros de escalada disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🧗‍♂️ CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Centros de escalada mejor calificados
              {loadingCentros && <span style={{ fontSize: '14px', marginLeft: '10px' }}>Cargando...</span>}
              {errorCentros && <span style={{ fontSize: '14px', marginLeft: '10px', color: 'red' }}>⚠️ Usando datos offline</span>}
            </h2>
            <div className={styles.carouselControls}>
              <button 
                onClick={prevSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === 0 || loadingCentros}
                style={{ opacity: currentSlide === 0 || loadingCentros ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1 || loadingCentros}
                style={{ opacity: currentSlide === totalSlides - 1 || loadingCentros ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          
          <div className={styles.carouselContainer}>
            {loadingCentros ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <p>Cargando centros de escalada...</p>
              </div>
            ) : (
              <div 
                className={styles.courtsGrid}
                style={{
                  transform: `translateX(-${currentSlide * (320 + 20)}px)`,
                }}
              >
                {topRatedCenters.map((center, index) => (
                  <CourtCard 
                    key={center.id || index} 
                    {...center} 
                    sport="escalada"
                    onClick={() => handleCentroClick(center)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los centros de escalada</h2>
          
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
            sport="escalada"
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