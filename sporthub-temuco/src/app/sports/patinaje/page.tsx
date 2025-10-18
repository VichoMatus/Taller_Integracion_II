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

// ⛸️ DATOS PARA LAS ESTADÍSTICAS DE PATINAJE (SERÁN ACTUALIZADOS CON DATOS REALES)
const patinajeStats = [
  {
    title: "Pistas Disponibles Hoy",
    value: "7",
    icon: "⛸️",
    subtitle: "Listas para reservar",
    trend: { value: 3, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$22-35",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestras pistas",
    trend: { value: 0.4, isPositive: true }
  },
  {
    title: "Modalidades Disponibles",
    value: "4",
    icon: "🔄",
    subtitle: "Diferentes estilos",
    trend: { value: 1, isPositive: true }
  }
];

export default function PatinajePage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  // 🔥 ESTADOS PARA PISTAS DEL BACKEND
  const [pistas, setPistas] = useState<any[]>([]);
  const [loadingPistas, setLoadingPistas] = useState(true);
  const [errorPistas, setErrorPistas] = useState<string | null>(null);

  // 🔥 CARGAR PISTAS DEL BACKEND
  useEffect(() => {
    const loadPistas = async () => {
      try {
        setLoadingPistas(true);
        setErrorPistas(null);
        
        console.log('🔄 [Patinaje] Cargando pistas individuales del backend...');
        
        // 🔥 IDs de las pistas de patinaje que quieres mostrar
        const patinajePistaIds = [1, 2, 3, 4, 5, 6, 7, 8];
        
        const pistasPromises = patinajePistaIds.map(async (id) => {
          try {
            console.log(`🔍 [Patinaje] Cargando pista ID: ${id}`);
            const pista = await canchaService.getCanchaById(id);
            console.log(`✅ [Patinaje] Pista ${id} obtenida:`, pista);
            
            // 🔥 FILTRAR SOLO PISTAS DE PATINAJE
            if (pista.tipo !== 'patinaje') {
              console.log(`⚠️ [Patinaje] Pista ${id} no es de patinaje (${pista.tipo}), saltando...`);
              return null;
            }
            
            // Mapear al formato requerido por CourtCard
            const mappedPista = {
              id: pista.id,
              imageUrl: `/sports/patinaje/pistas/Pista${pista.id}.png`,
              name: pista.nombre,
              address: `Complejo ${pista.establecimientoId}`,
              rating: pista.rating || 4.7,
              tags: [
                pista.techada ? "Pista cubierta" : "Pista al aire libre",
                pista.activa ? "Disponible" : "No disponible",
                "Alquiler patines",
                "Iluminación"
              ],
              description: `Pista de patinaje ${pista.nombre} - ID: ${pista.id}`,
              price: pista.precioPorHora?.toString() || "25",
              nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
              sport: "patinaje"
            };
            
            console.log('🗺️ [Patinaje] Pista mapeada:', mappedPista);
            return mappedPista;
            
          } catch (error) {
            console.log(`❌ [Patinaje] Error cargando pista ${id}:`, error);
            return null;
          }
        });
        
        const pistasResults = await Promise.all(pistasPromises);
        const pistasValidas = pistasResults.filter(pista => pista !== null);
        
        console.log('🎉 [Patinaje] Pistas de patinaje cargadas exitosamente:', pistasValidas.length);
        console.log('📋 [Patinaje] Pistas finales:', pistasValidas);
        
        setPistas(pistasValidas);
        
      } catch (error: any) {
        console.error('❌ [Patinaje] ERROR DETALLADO cargando pistas:', error);
        setErrorPistas(`Error: ${error.message}`);
        
        // 🔥 FALLBACK
        console.log('🚨 [Patinaje] USANDO FALLBACK - Error en el API');
        setPistas([
          {
            id: 1,
            imageUrl: "/sports/patinaje/pistas/Pista1.png",
            name: "🚨 FALLBACK - Pista de Patinaje Centro",
            address: "Norte, Centro, Sur",
            rating: 4.8,
            tags: ["DATOS OFFLINE", "Pista Cubierta", "Alquiler Patines", "Iluminación"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "25",
            nextAvailable: "20:00-21:00",
          },
          {
            id: 2,
            imageUrl: "/sports/patinaje/pistas/Pista2.png",
            name: "🚨 FALLBACK - Pista Norte",
            address: "Sector Norte",
            rating: 4.6,
            tags: ["DATOS OFFLINE", "Pista Techada", "Cafetería"],
            description: "🚨 Estos son datos de fallback - API no disponible",
            price: "22",
            nextAvailable: "14:30-15:30",
          }
        ]);
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

  // 🔥 USAR PISTAS REALES PARA EL CARRUSEL
  const topRatedRinks = pistas.slice(0, 6);
  const totalSlides = Math.max(1, topRatedRinks.length - cardsToShow + 1);

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

  const handlePistaClick = (rink: any) => {
    console.log('Navegando a pista:', rink);
    router.push(`/sports/patinaje/pistas/pistaseleccionada?id=${rink.id}`);
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
      ...patinajeStats[0],
      value: pistas.filter(p => p.nextAvailable !== "No disponible").length.toString()
    },
    patinajeStats[1], // Mantener precio por defecto
    {
      ...patinajeStats[2],
      value: `${(pistas.reduce((acc, p) => acc + p.rating, 0) / pistas.length || 4.7).toFixed(1)}⭐`
    },
    patinajeStats[3] // Mantener modalidades por defecto
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

        {/* 🔥 STATS CARDS CON DATOS ACTUALIZADOS */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas de Patinaje en Temuco
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
              <span className={styles.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* 🔥 CARRUSEL CON DATOS REALES */}
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
                {topRatedRinks.map((rink, index) => (
                  <CourtCard
                    key={rink.id || index}
                    {...rink}
                    sport="patinaje"
                    onClick={() => handlePistaClick(rink)}
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