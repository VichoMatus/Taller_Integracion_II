'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './page.module.css';

const topRatedCourts = [
  {
    imageUrl: "/sports/futbol-americano/estadios/estadio1.png",
    name: "Estadio Los Titanes",
    address: "Zona Deportiva Norte",
    rating: 4.8,
    tags: ["Estadio Profesional", "Cesped Natural", "Gradas", "Vestuarios"],
    description: "Estadio profesional con medidas oficiales NFL. Cesped natural y sistema de iluminación para partidos nocturnos.",
    price: "120",
    nextAvailable: "Sábado 15:00-18:00", 
  },
  {
    imageUrl: "/sports/futbol-americano/estadios/estadio2.png",
    name: "Coliseo del Fútbol",
    address: "Complejo Deportivo Central", 
    rating: 4.6,
    tags: ["Estadio Semi-Profesional", "Cesped Sintético", "Torres de Iluminación", "Cabinas"],
    description: "Estadio semi-profesional con cesped sintético de última generación. Ideal para equipos universitarios y semi-profesionales.",
    price: "85",
    nextAvailable: "Domingo 10:00-13:00",
  }
];

export default function FutbolAmericanoPage() {
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

  // Stats específicos para Fútbol Americano
  const stats = {
    disponiblesHoy: 2,
    precioPromedio: { min: 85, max: 120 },
    promedioCalificacion: 4.7,
    capacidadPromedio: "22 jugadores"
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
    console.log('Navegando a estadio...');
    router.push('/sports/futbol-americano/estadios/estadioseleccionado');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol-americano" />
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
      <Sidebar userRole="usuario" sport="futbol-americano" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏈</div>
            <h1 className={styles.headerTitle}>Fútbol Americano</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del estadio..."
              sport="futbol-americano" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        {/* 🔥 Stats Cards para Fútbol Americano - USANDO EL COMPONENTE StatsCard */}
        <div className={styles.statsContainer}>
          <StatsCard
            title="Estadios Disponibles Hoy"
            value={stats.disponiblesHoy}
            icon="🏈"
            color="blue"
            sport="futbol-americano"
            ariaLabel={`${stats.disponiblesHoy} estadios disponibles hoy`}
          />
          
          <StatsCard
            title="Rango de Precios"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon="💰"
            subtitle="Por hora"
            color="purple"
            sport="futbol-americano"
            ariaLabel={`Precios desde $${stats.precioPromedio.min} hasta $${stats.precioPromedio.max} por hora`}
          />
          
          <StatsCard
            title="Calificación Promedio"
            value={stats.promedioCalificacion}
            icon="⭐"
            subtitle="Basado en reseñas"
            color="yellow"
            sport="futbol-americano"
            ariaLabel={`Calificación promedio de ${stats.promedioCalificacion} estrellas`}
          />
          
          <StatsCard
            title="Capacidad por Equipo"
            value={stats.capacidadPromedio}
            icon="👥"
            subtitle="Jugadores por equipo"
            color="green"
            sport="futbol-americano"
            ariaLabel={`Capacidad promedio de ${stats.capacidadPromedio} jugadores por equipo`}
          />
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/futbol-americano/estadios'}
          >
            <div className={styles.courtButtonIcon}>🏈</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Estadios</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los estadios disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* Estadios mejor calificados con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Estadios mejor calificados
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
                  sport="futbol-americano"
                  onClick={() => router.push('/sports/futbol-americano/estadios/estadioseleccionado')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los estadios</h2>
          
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