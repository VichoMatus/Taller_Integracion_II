'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';

// Datos de ejemplo para las rutas mejor calificadas (6 tarjetas)
const topRatedCourts = [
  {
    imageUrl: "/sports/mountain-bike/rutas/Ruta1.png",
    name: "Ruta Montaña - Centro",
    address: "Cerro Ñielol, Temuco",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Dificultad Media", "Estacionamiento", "Mirador", "Área de Descanso"],
    description: "Ruta escénica de mountain bike con vistas panorámicas y terreno variado",
    price: "15",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/mountain-bike/rutas/Ruta2.png",
    name: "Ruta Bosque - Norte",
    address: "Sector Norte, Bosque Nativo",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Dificultad Alta", "Técnica", "Descenso"],
    description: "Ruta técnica con descensos desafiantes y paisajes de bosque nativo",
    price: "12",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/mountain-bike-route3.jpg",
    name: "Ruta Valle - Sur",
    address: "Valle Deportivo",
    rating: 4.1,
    reviews: "67 reseñas",
    tags: ["Dificultad Baja", "Familiar", "Paisajística"],
    description: "Ruta ideal para principiantes y familias con paisajes del valle",
    price: "10",
    nextAvailable: "Mañana 09:00-10:00",
  }
];

export default function MountainBikePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
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

  // Stats de ejemplo para mountain bike
  const stats = {
    disponiblesHoy: 8,
    precioPromedio: { min: 12, max: 25 },
    promedioCalificacion: 4.6,
    kilometrosTotales: 45
  };

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

  const handleRutaClick = (court: any) => {
    console.log('Test navigation...');
    router.push('/sports/mountain-bike/rutas/rutaseleccionada');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="mountain-bike" />
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
      <Sidebar userRole="usuario" sport="mountain-bike" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚵</div>
            <h1 className={styles.headerTitle}>Mountain Bike</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Nombre de la ruta..."
            sport="mountain-bike" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>usuario</span>
            </button>
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.disponiblesHoy}</div>
            <div className={styles.statLabel}>Rutas Disponibles hoy</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>${stats.precioPromedio.min}-{stats.precioPromedio.max}</div>
            <div className={styles.statLabel}>Rango de precios por día</div>
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
        <div className={styles.quickAccessSection}>
        <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/mountain-bike/rutas'}
            >
            <div className={styles.courtButtonIcon}>🚵</div>
            <div className={styles.courtButtonText}>
            <span className={styles.courtButtonTitle}>Explorar Rutas</span>
            <span className={styles.courtButtonSubtitle}>Ver todas las rutas disponibles</span>
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
              {topRatedCourts.map((court, index) => (
                <CourtCard 
                  key={index} 
                  {...court} 
                  sport="mountain-bike"
                  onClick={() => router.push('/sports/mountain-bike/rutas/rutaseleccionada')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las rutas</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Cerro, valle o ubicación..."
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