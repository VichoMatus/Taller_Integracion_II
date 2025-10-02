'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import StatsCard from '../../../components/charts/StatsCard';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';

// Datos de ejemplo para las pistas de patinaje mejor calificadas
const topRatedCourts = [
  {
    imageUrl: "/sports/patinaje/pistas/Pista1.png",
    name: "Pista de Patinaje - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.8,
    reviews: "320 reseñas",
    tags: ["Pista Cubierta", "Estacionamiento", "Iluminación", "Alquiler Patines"],
    description: "Pista profesional de patinaje ubicada en el centro con alquiler de equipos y clases",
    price: "25",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/patinaje/pistas/Pista2.png",
    name: "Pista - Norte",
    address: "Sector Norte",
    rating: 4.6,
    reviews: "185 reseñas",
    tags: ["Pista Techada", "Estacionamiento", "Cafetería"],
    description: "Pista techada ideal para patinaje artístico y recreativo con áreas de descanso",
    price: "22",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/skating-rink3.jpg",
    name: "Pista - Sur",
    address: "Sector Sur",
    rating: 4.4,
    reviews: "97 reseñas",
    tags: ["Pista Cubierta", "Estacionamiento", "Clases"],
    description: "Pista climatizada perfecta para patinaje en todas las estaciones del año",
    price: "28",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/path/to/skating-rink4.jpg",
    name: "Centro de Patinaje Premium",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "242 reseñas",
    tags: ["Pista Olímpica", "Estacionamiento", "Tienda", "Restaurante", "Vestuarios"],
    description: "Complejo premium de patinaje con pista olímpica y servicios de primera",
    price: "35",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/path/to/skating-rink5.jpg",
    name: "Pista - Elite",
    address: "Zona Elite", 
    rating: 4.7,
    reviews: "156 reseñas",
    tags: ["Pista Techada", "Estacionamiento", "Hockey", "Cafetería"],
    description: "Pista de alta gama especializada en hockey y patinaje artístico",
    price: "32",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/path/to/skating-rink6.jpg",
    name: "Complejo Deportivo de Patinaje",
    address: "Centro Deportivo", 
    rating: 4.5,
    reviews: "128 reseñas",
    tags: ["Pista Semi-olímpica", "Estacionamiento", "Área infantil"],
    description: "Complejo deportivo con pistas para diferentes modalidades de patinaje",
    price: "26",
    nextAvailable: "16:30-17:30",
  }
];

export default function PatinajePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourts, setFilteredCourts] = useState(topRatedCourts);
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    const filtered = topRatedCourts.filter(court => 
      court.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      court.address.toLowerCase().includes(searchValue.toLowerCase()) ||
      court.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      court.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
    );
    setFilteredCourts(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    handleSearch(newValue);
  };

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

  // Stats específicos para patinaje
  const stats = {
    disponiblesHoy: 7,
    precioPromedio: { min: 22, max: 35 },
    promedioCalificacion: 4.7,
    modalidades: 4
  };

  const totalSlides = Math.max(1, topRatedCourts.length - cardsToShow + 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleLocationSearch = () => {
    console.log('Buscando ubicación:', locationSearch, 'Radio:', radiusKm);
  };

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
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <StatsCard
            title="Pistas Disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span>⛸️</span>}
            color="blue"
          />
          <StatsCard
            title="Rango de precios por hora"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span>💰</span>}
            color="green"
          />
          <StatsCard
            title="Promedio de calificación"
            value={stats.promedioCalificacion}
            subtitle="⭐"
            color="yellow"
            icon={<span>⭐</span>}
          />
          <StatsCard
            title="Modalidades disponibles"
            value={stats.modalidades}
            icon={<span>🔄</span>}
            color="purple"
          />
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/patinaje/pistas'}
          >
            <div className={styles.courtButtonIcon}>⛸️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Pistas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* Pistas mejor calificadas con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Pistas mejor calificadas
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
              {filteredCourts.map((court, index) => (
                <CourtCard 
                  key={index} 
                  {...court} 
                  sport="patinaje"
                  onClick={() => router.push('/sports/patinaje/pistas/pistaseleccionada')}
                />
              ))}
            </div>
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