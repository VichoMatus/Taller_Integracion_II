'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';


// Datos de ejemplo para las canchas mejor calificadas (6 tarjetas)
const topRatedCourts = [
  {
    imageUrl: "/sports/basquetbol/canchas/Cancha1.png",
    name: "Basquetbol - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)",
    price: "21",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/basquetbol/canchas/Cancha2.png",
    name: "Basquetbol - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento"],
    description: "Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)",
    price: "19",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/basketball-court3.jpg",
    name: "Basquetbol - Sur",
    address: "Sector Sur",
    rating: 4.1,
    reviews: "67 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación"],
    description: "Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)",
    price: "23",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/path/to/basketball-court4.jpg",
    name: "Basquetbol Premium",
    address: "Centro Premium", 
    rating: 4.7,
    reviews: "142 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha para basquetbol ubicada en el centro y con implementos deportivos (Balones y petos)",
    price: "26",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/path/to/basketball-court5.jpg",
    name: "Basquetbol - Elite",
    address: "Zona Elite", 
    rating: 4.8,
    reviews: "203 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha premium para basquetbol con todas las comodidades y equipamiento profesional",
    price: "28",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/path/to/basketball-court6.jpg",
    name: "Basquetbol - Deportivo",
    address: "Centro Deportivo", 
    rating: 4.4,
    reviews: "97 reseñas",
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación"],
    description: "Cancha de basquetbol en complejo deportivo con múltiples servicios disponibles",
    price: "22",
    nextAvailable: "16:30-17:30",
  }
];

export default function BasquetbolPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isClient, setIsClient] = useState(false);
  // 🔥 Elimina el estado sidebarLoaded

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

    // 🔥 Elimina el setTimeout del sidebar

    return () => {
      window.removeEventListener('resize', handleResize);
      // 🔥 Elimina el clearTimeout
    };
  }, []);

  // Stats de ejemplo
  const stats = {
    disponiblesHoy: 12,
    precioPromedio: { min: 24, max: 30 },
    promedioCalificacion: 4.6,
    cantidadJugadores: 10
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
  console.log('Test navigation...');
  router.push('/sports/basquetbol/canchas/canchaseleccionada');
};

  // 🔥 Elimina el estado de carga inicial
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
      {/* 🔥 Siempre mostrar el Sidebar real */}
      <Sidebar userRole="usuario" sport="basquetbol" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏀</div>
            <h1 className={styles.headerTitle}>Basquetbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Nombre de la cancha..."
            sport="basquetbol" 
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
            
          </div>
        </div>

        {/* Stats Cards */}
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
            onClick={() => window.location.href = '/sports/basquetbol/canchas'}
            >
            <div className={styles.courtButtonIcon}>🏀</div>
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
                  sport="basquetbol"
                  onClick={() => router.push('/sports/basquetbol/canchas/canchaseleccionada')}
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