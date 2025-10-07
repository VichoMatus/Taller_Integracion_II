"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';
import StatsCard from '../../../components/charts/StatsCard';

// Datos de ejemplo para las rutas mejor calificadas
const topRatedCourts = [
  {
    imageUrl: "/sports/ciclismo/ciclismo.png",
    name: "Ciclismo - Sendero Bosque",
    address: "Parque Nacional, Zona Norte",
    rating: 4.7,
    tags: ["Sendero natural", "Dificultad media", "Paisajes", "Estacionamiento"],
    description: "Ruta de ciclismo de montaña con senderos naturales y vistas panorámicas",
    price: "15",
    nextAvailable: "08:00-09:00", 
  },
  {
    imageUrl: "/sports/ciclismo/ciclismo.png",
    name: "Ciclismo - Ruta Urbana",
    address: "Centro Ciudad",
    rating: 4.4,
    tags: ["Ciclovía urbana", "Fácil acceso", "Iluminación"],
    description: "Ciclovía urbana segura con conexiones a puntos de interés de la ciudad",
    price: "8",
    nextAvailable: "16:00-17:00", 
  },
  {
    imageUrl: "/sports/ciclismo/ciclismo.png",
    name: "Ciclismo - Sendero Lago",
    address: "Orilla del Lago",
    rating: 4.8,
    tags: ["Vista al lago", "Dificultad alta", "Naturaleza", "Área de descanso"],
    description: "Ruta desafiante con hermosas vistas al lago y áreas de descanso",
    price: "20",
    nextAvailable: "10:30-11:30", 
  }
];

export default function CiclismoPage() {
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
    disponiblesHoy: 15,
    precioPromedio: { min: 8, max: 25 },
    promedioCalificacion: 4.6,
    cantidadCiclistas: 18
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
        <Sidebar userRole="usuario" sport="ciclismo" />
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
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚴‍♂️</div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="ciclismo"
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <StatsCard
            title="Rutas disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span style={{fontSize: 20}}>📅</span>}
            subtitle="Disponible ahora"
            color="red"
            className={styles.statCard}
            ariaLabel="Rutas disponibles hoy"
            sport="ciclismo"
          />

          <StatsCard
            title="Rango de precios por hora"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span style={{fontSize: 20}}>💲</span>}
            subtitle="Precio promedio"
            color="yellow"
            className={styles.statCard}
            ariaLabel="Rango de precios por hora"
            sport="ciclismo"
          />

          <StatsCard
            title="Promedio de calificación"
            value={`${stats.promedioCalificacion} ⭐`}
            icon={<span style={{fontSize: 20}}>⭐</span>}
            subtitle="Reseñas acumuladas"
            color="purple"
            className={styles.statCard}
            ariaLabel="Promedio de calificación"
            sport="ciclismo"
          />

          <StatsCard
            title="Ciclistas en ruta"
            value={stats.cantidadCiclistas}
            icon={<span style={{fontSize: 20}}>🚴‍♂️</span>}
            subtitle="Asistentes activos"
            color="blue"
            className={styles.statCard}
            ariaLabel="Ciclistas en ruta"
            sport="ciclismo"
          />
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={`${styles.mainCourtButton} ${styles.containerCard}`}
            onClick={() => router.push('/sports/ciclismo/canchas')}
          >
            <div className={styles.courtButtonIcon}>🚴‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Rutas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las rutas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Rutas mejor calificadas
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
                <CourtCard key={index} {...court} sport="ciclismo" onClick={() => router.push('/sports/ciclismo/canchas/canchaseleccionada')} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las rutas</h2>
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

          <LocationMap sport="ciclismo" latitude={-38.7359} longitude={-72.5904} address="Temuco, Chile" zoom={13} height="400px" />
          <div className={styles.mapActions}><button className={styles.helpButton}>❓ Ayuda</button></div>
        </div>
      </div>
    </div>
  );
}
