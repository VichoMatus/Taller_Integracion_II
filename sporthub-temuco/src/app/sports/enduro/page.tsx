'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';

// Datos de ejemplo para las rutas de Enduro mejor calificadas (6 tarjetas)
const topRatedRoutes = [
  {
    imageUrl: "/sports/enduro/rutas/ruta1.png",
    name: "Ruta Montaña Extremo",
    address: "Cordillera Central",
    rating: 4.8,
    reviews: "95 reseñas",
    tags: ["Dificultad Alta", "Terreno Rocoso", "Vistas Panorámicas", "Guía Incluido"],
    description: "Ruta desafiante para expertos con terrenos rocosos y descensos técnicos. Incluye guía certificado.",
    price: "35",
    nextAvailable: "Mañana 08:00-12:00", 
  },
  {
    imageUrl: "/sports/enduro/rutas/ruta2.png",
    name: "Sendero Bosque Verde",
    address: "Reserva Natural",
    rating: 4.5,
    reviews: "67 reseñas",
    tags: ["Dificultad Media", "Bosque", "Ríos", "Familiar"],
    description: "Ruta intermedia a través de bosques nativos con cruces de ríos y paisajes espectaculares.",
    price: "28",
    nextAvailable: "Hoy 14:00-17:00", 
  },
  {
    imageUrl: "/path/to/enduro-route3.jpg",
    name: "Circuito Técnico",
    address: "Parque de Aventura",
    rating: 4.6,
    reviews: "82 reseñas",
    tags: ["Dificultad Alta", "Técnico", "Saltos", "Competencia"],
    description: "Circuito diseñado para entrenamiento técnico con saltos y obstáculos desafiantes.",
    price: "32",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/path/to/enduro-route4.jpg",
    name: "Trail Iniciación",
    address: "Centro de Enduro", 
    rating: 4.3,
    reviews: "45 reseñas",
    tags: ["Dificultad Baja", "Aprendizaje", "Equipo Incluido", "Instructor"],
    description: "Perfecta para principiantes. Incluye equipo completo y instructor especializado.",
    price: "40",
    nextAvailable: "Mañana 10:00-13:00",
  },
  {
    imageUrl: "/path/to/enduro-route5.jpg",
    name: "Descenso Extremo",
    address: "Cerro del Diablo", 
    rating: 4.9,
    reviews: "120 reseñas",
    tags: ["Dificultad Extrema", "Descenso", "Experto", "Seguro Incluido"],
    description: "Para riders experimentados. Descenso técnico con pendientes pronunciadas y obstáculos naturales.",
    price: "45",
    nextAvailable: "Fin de semana",
  },
  {
    imageUrl: "/path/to/enduro-route6.jpg",
    name: "Ruta Familiar",
    address: "Valle Tranquilo", 
    rating: 4.4,
    reviews: "78 reseñas",
    tags: ["Dificultad Baja", "Familiar", "Paisajes", "Picnic"],
    description: "Ruta suave ideal para familias y paseos tranquilos con áreas de descanso y picnic.",
    price: "25",
    nextAvailable: "Todos los días",
  }
];

export default function EnduroPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('10');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

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

  // Stats específicos para Enduro
  const stats = {
    rutasDisponibles: 15,
    precioPromedio: { min: 25, max: 45 },
    promedioCalificacion: 4.6,
    kilometrosTotales: 85
  };

  const totalSlides = Math.max(1, topRatedRoutes.length - cardsToShow + 1);

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

  const handleRutaClick = (route: any) => {
    console.log('Navegando a ruta:', route.name);
    router.push('/sports/enduro/rutas/rutaseleccionada');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="enduro" />
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
      <Sidebar userRole="usuario" sport="enduro" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏍️</div>
            <h1 className={styles.headerTitle}>Enduro</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport = "enduro" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        {/* Stats Cards para Enduro */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.rutasDisponibles}</div>
            <div className={styles.statLabel}>Rutas Disponibles</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>${stats.precioPromedio.min}-{stats.precioPromedio.max}</div>
            <div className={styles.statLabel}>Rango de precios por ruta</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.promedioCalificacion} ⭐</div>
            <div className={styles.statLabel}>Promedio de calificación</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.kilometrosTotales}km</div>
            <div className={styles.statLabel}>Kilómetros totales de rutas</div>
          </div>
        </div>

        {/* Botón de acceso rápido */}
        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/enduro/rutas'}
          >
            <div className={styles.courtButtonIcon}>🏍️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Rutas</span>
              <span className={styles.courtButtonSubtitle}>Descubre todas las rutas de enduro disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* Rutas mejor calificadas con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Rutas mejor calificadas
            </h2>
            <div className={styles.carouselControls}>
              <button 
                onClick={prevSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === 0}
                style={{ opacity: currentSlide === 0 ? 0.5 : 1 }}
              >
                ←
              </button>
              <span className={styles.slideIndicator}>
                {currentSlide + 1} / {totalSlides}
              </span>
              <button 
                onClick={nextSlide} 
                className={styles.carouselButton}
                disabled={currentSlide === totalSlides - 1}
                style={{ opacity: currentSlide === totalSlides - 1 ? 0.5 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          
          <div className={styles.carouselContainer}>
            <div 
              className={styles.courtsGrid}
              style={{
                transform: `translateX(-${currentSlide * (320 + 20)}px)`,
              }}
            >
              {topRatedRoutes.map((route, index) => (
                <CourtCard 
                  key={index} 
                  {...route} 
                  sport="enduro"
                  onClick={() => handleRutaClick(route)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación de las rutas de enduro</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Zona, montaña o región"
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
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
                <option value="20">Radio 20km</option>
                <option value="50">Radio 50km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={styles.searchLocationButton}>
              Buscar
            </button>
          </div>

          <LocationMap 
            latitude={-38.7359}
            longitude={-72.5904}
            address="Zona de rutas, Temuco"
            zoom={11}
            height="400px"
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