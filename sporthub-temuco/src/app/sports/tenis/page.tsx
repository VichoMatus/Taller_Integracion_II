'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';

// Datos de ejemplo para las canchas de tenis mejor calificadas
const topRatedCourts = [
  {
    imageUrl: "/sports/tenis/canchas/Cancha1.png",
    name: "Tenis - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.8,
    reviews: "320 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha para tenis ubicada en el centro y con implementos deportivos (Balones y raquetas)",
    price: "25",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/tenis/canchas/Cancha2.png",
    name: "Tenis - Norte",
    address: "Sector Norte",
    rating: 4.6,
    reviews: "185 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Vestuarios"],
    description: "Cancha para tenis ubicada en el centro y con implementos deportivos (Balones y raquetas)",
    price: "22",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/tennis-court3.jpg",
    name: "Tenis - Sur",
    address: "Sector Sur",
    rating: 4.4,
    reviews: "97 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación"],
    description: "Cancha para tenis ubicada en el centro y con implementos deportivos (Balones y raquetas)",
    price: "28",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/path/to/tennis-court4.jpg",
    name: "Tenis Premium",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "242 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación", "Cafetería", "Vestuarios"],
    description: "Cancha para tenis ubicada en el centro y con implementos deportivos (Balones y raquetas)",
    price: "35",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/path/to/tennis-court5.jpg",
    name: "Tenis - Elite",
    address: "Zona Elite", 
    rating: 4.7,
    reviews: "156 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha premium para tenis con todas las comodidades y equipamiento profesional",
    price: "32",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/path/to/tennis-court6.jpg",
    name: "Tenis - Deportivo",
    address: "Centro Deportivo", 
    rating: 4.5,
    reviews: "128 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación"],
    description: "Cancha de tenis en complejo deportivo con múltiples servicios disponibles",
    price: "26",
    nextAvailable: "16:30-17:30",
  }
];

export default function TenisPage() {
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

  // Stats específicos para tenis
  const stats = {
    disponiblesHoy: 12,
    precioPromedio: { min: 22, max: 35 },
    promedioCalificacion: 4.7,
    cantidadJugadores: 4
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

  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha de tenis...');
    router.push('/sports/tenis/canchas/canchaseleccionada');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="tenis" />
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
      <Sidebar userRole="usuario" sport="tenis" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🎾</div>
            <h1 className={styles.headerTitle}>Tenis</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="tenis" 
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        {/* Stats Cards para Tenis */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.disponiblesHoy}</div>
            <div className={styles.statLabel}>Canchas Disponibles hoy</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>${stats.precioPromedio.min}-{stats.precioPromedio.max}</div>
            <div className={styles.statLabel}>Rango de precios por hora</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.promedioCalificacion} ⭐</div>
            <div className={styles.statLabel}>Promedio de calificacion</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.cantidadJugadores}</div>
            <div className={styles.statLabel}>Cantidad de jugadores en cancha</div>
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/tenis/canchas'}
          >
            <div className={styles.courtButtonIcon}>🎾</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Canchas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las canchas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* Canchas mejor calificadas con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Canchas mejor calificadas
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
                  sport="tenis"
                  onClick={() => router.push('/sports/tenis/canchas/canchaseleccionada')}
                />
              ))}
            </div>
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