"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';
import StatsCard from '../../../components/charts/StatsCard';


const topRatedCourts = [
  {
    imageUrl: "/sports/skate/canchas/Skate1.svg",
    name: "Skate - Plaza Central",
    address: "Plaza, Centro",
    rating: 4.6,
    reviews: "72 reseñas",
    tags: ["Skatepark", "Bordes", "Rampas"],
    description: "Skatepark en el centro con bowl y rampas diversas",
    price: "0",
    nextAvailable: "Abierto", 
  }
];

export default function SkatePage() {
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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = {
    disponiblesHoy: 3,
    precioPromedio: { min: 0, max: 0 },
    promedioCalificacion: 4.6,
    cantidadAtletas: 12
  };

  const totalSlides = Math.max(1, topRatedCourts.length - cardsToShow + 1);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSearch = () => console.log('Buscando:', searchTerm);
  const handleLocationSearch = () => console.log('Buscando ubicación:', locationSearch, 'Radio:', radiusKm);

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="skate" />
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
      <Sidebar userRole="usuario" sport="skate" />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🛹</div>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del skatepark o ubicación..."
              sport="skate"
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <StatsCard
            title="Skateparks disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span style={{fontSize: 20}}>📅</span>}
            subtitle="Disponible ahora"
            color="green"
            className={styles.statCard}
            ariaLabel="Skateparks disponibles hoy"
            sport="skate"
          />

          <StatsCard
            title="Rango de precios"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span style={{fontSize: 20}}>💲</span>}
            subtitle="Precio promedio"
            color="blue"
            className={styles.statCard}
            ariaLabel="Rango de precios por hora"
            sport="skate"
          />

          <StatsCard
            title="Promedio de calificación"
            value={`${stats.promedioCalificacion} ⭐`}
            icon={<span style={{fontSize: 20}}>⭐</span>}
            subtitle="Reseñas acumuladas"
            color="yellow"
            className={styles.statCard}
            ariaLabel="Promedio de calificación"
            sport="skate"
          />

          <StatsCard
            title="Skaters activos"
            value={stats.cantidadAtletas}
            icon={<span style={{fontSize: 20}}>🛹</span>}
            subtitle="Asistentes activos"
            color="purple"
            className={styles.statCard}
            ariaLabel="Skaters en park"
            sport="skate"
          />
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={`${styles.mainCourtButton} ${styles.containerCard}`}
            onClick={() => router.push('/sports/skate/canchas')}
          >
            <div className={styles.courtButtonIcon}>🛹</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Skateparks</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los skateparks disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Skateparks mejor valorados
            </h2>
            <div className={styles.carouselControls}>
              <button onClick={prevSlide} className={styles.carouselButton} disabled={currentSlide === 0}>←</button>
              <span className={styles.slideIndicator}>{currentSlide + 1} / {totalSlides}</span>
              <button onClick={nextSlide} className={styles.carouselButton} disabled={currentSlide === totalSlides - 1}>→</button>
            </div>
          </div>

          <div className={styles.carouselContainer}>
            <div className={styles.courtsGrid} style={{ transform: `translateX(-${currentSlide * (320 + 20)}px)` }}>
              {topRatedCourts.map((court, index) => (
                <CourtCard key={index} {...court} sport="skate" onClick={() => router.push('/sports/skate/canchas/canchaseleccionada')} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los skateparks</h2>
            <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input type="text" placeholder="Dirección, barrio o ciudad" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className={styles.locationInput} />
            </div>
            <div className={styles.radiusContainer}>
              <span className={styles.radiusIcon}>📏</span>
              <select value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className={styles.radiusSelect}>
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={styles.searchButton}>Buscar</button>
          </div>

          <LocationMap sport="skate" latitude={-38.7359} longitude={-72.5904} address="Temuco, Chile" zoom={13} height="400px" />
          <div className={styles.mapActions}><button className={styles.helpButton}>❓ Ayuda</button></div>
        </div>
      </div>
    </div>
  );
}

