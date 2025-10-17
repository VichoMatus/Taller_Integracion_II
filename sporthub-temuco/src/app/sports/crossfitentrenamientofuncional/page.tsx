'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../hooks/useAuthStatus';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './page.module.css';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../services/canchaService';

// 🏋️ DATOS PARA LAS ESTADÍSTICAS DE CROSSFIT (SERÁN ACTUALIZADOS CON DATOS REALES)
const crossfitStats = [
  {
    title: "Gimnasios Disponibles Hoy",
    value: "6",
    icon: "🏋️",
    subtitle: "Listos para entrenar",
    trend: { value: 1, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$25-45",
    icon: "💰",
    subtitle: "Por sesión",
    trend: { value: 3, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestros gimnasios",
    trend: { value: 0.1, isPositive: true }
  },
  {
    title: "Atletas Activos",
    value: "28",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 4, isPositive: true }
  }
];

export default function CrossfitPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
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

  // 🔥 CARGAR CANCHAS DEL BACKEND
  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoadingCanchas(true);
        setErrorCanchas(null);
        
        console.log('🔄 [CrossFit] Cargando gimnasios individuales del backend...');
        
        // 🔥 IDs de los gimnasios de CrossFit que quieres mostrar
        const crossfitCanchaIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        const canchasPromises = crossfitCanchaIds.map(async (id) => {
          try {
            console.log(`🔍 [CrossFit] Cargando gimnasio ID: ${id}`);
            const cancha = await canchaService.getCanchaById(id);
            console.log(`✅ [CrossFit] Gimnasio ${id} obtenido:`, cancha);
            
            // 🔥 FILTRAR SOLO GIMNASIOS DE CROSSFIT/ENTRENAMIENTO FUNCIONAL
            if (cancha.tipo !== 'crossfit' && cancha.tipo !== 'entrenamiento_funcional') {
              console.log(`⚠️ [CrossFit] Gimnasio ${id} no es de CrossFit/Entrenamiento Funcional (${cancha.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedCancha = {
              id: cancha.id,
              imageUrl: `/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio${cancha.id}.png`,
              name: cancha.nombre,
              address: `Complejo ${cancha.establecimientoId}`,
              rating: cancha.rating || 4.7,
              tags: [
                cancha.techada ? "Gimnasio techado" : "Espacio al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                "Equipamiento completo",
                "Entrenadores certificados"
              ],
              description: `Gimnasio de CrossFit ${cancha.nombre} - ID: ${cancha.id}`,
              price: cancha.precioPorHora?.toString() || "30",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: "crossfitentrenamientofuncional"
            };
            
            console.log('🗺️ [CrossFit] Gimnasio mapeado:', mappedCancha);
            return mappedCancha;
            
          } catch (error) {
            console.log(`❌ [CrossFit] Error cargando gimnasio ${id}:`, error);
            return null;
          }
        });
        
        const canchasResults = await Promise.all(canchasPromises);
        const canchasValidas = canchasResults.filter(cancha => cancha !== null);
        
        console.log('🎉 [CrossFit] Gimnasios de CrossFit cargados exitosamente:', canchasValidas.length);
        console.log('📋 [CrossFit] Gimnasios finales:', canchasValidas);
        
        setCanchas(canchasValidas);
        
      } catch (error: any) {
        console.error('❌ [CrossFit] ERROR DETALLADO cargando gimnasios:', error);
        setErrorCanchas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [CrossFit] USANDO FALLBACK - Error en el API');
        setCanchas([
          {
            id: 1,
            imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio1.png",
            name: "🚨 FALLBACK - CrossFit Centro",
            address: "Norte, Centro, Sur",
            rating: 4.5,
            tags: ["DATOS OFFLINE", "Equipamiento completo", "Estacionamiento", "Duchas"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "30",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio2.png",
            name: "🚨 FALLBACK - CrossFit Norte",
            address: "Sector Norte",
            rating: 4.7,
            tags: ["DATOS OFFLINE", "Entrenadores certificados"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "25",
            nextAvailable: "14:30-15:30",
          }
        ]);
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
    console.log('Navegando a gimnasio:', court);
    router.push(`/sports/crossfitentrenamientofuncional/gimnasios/gimnasioseleccionado?id=${court.id}`);
  };

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  // 🔥 ACTUALIZAR ESTADÍSTICAS CON DATOS REALES
  const updatedStats = [
    {
      ...crossfitStats[0],
      value: canchas.filter(c => c.nextAvailable !== "No disponible").length.toString()
    },
    crossfitStats[1], // Mantener precio por defecto
    {
      ...crossfitStats[2],
      value: `${(canchas.reduce((acc, c) => acc + c.rating, 0) / canchas.length || 4.7).toFixed(1)}⭐`
    },
    crossfitStats[3] // Mantener atletas por defecto
  ];

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />
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
      <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏋️</div>
            <h1 className={styles.headerTitle}>CrossFit & Entrenamiento Funcional</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del gimnasio..."
              sport="crossfitentrenamientofuncional"
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

        {/* 🔥 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del CrossFit en Temuco
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
                sport="crossfitentrenamientofuncional"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  if (stat.title.includes("Gimnasios")) {
                    router.push('/sports/crossfitentrenamientofuncional/gimnasios');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/crossfitentrenamientofuncional/gimnasios/'}
          >
            <div className={styles.courtButtonIcon}>🏋️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Gimnasios</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los gimnasios disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Gimnasios mejor calificados
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
                <p>Cargando gimnasios...</p>
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
                    sport="crossfitentrenamientofuncional"
                    onClick={() => handleCanchaClick(court)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los gimnasios</h2>

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
            sport="crossfitentrenamientofuncional"
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