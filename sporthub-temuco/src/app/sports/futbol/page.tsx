'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './page.module.css';

// Datos de ejemplo para las canchas mejor calificadas (6 tarjetas)
const topRatedCourts = [
  {
    imageUrl: "/sports/futbol/canchas/Cancha1.png",
    name: "Fútbol - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    tags: ["Cancha de Césped", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de fútbol ubicada en el centro con implementos deportivos (Balones, conos y petos)",
    price: "25",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha2.png",
    name: "Fútbol - Norte",
    address: "Sector Norte",
    rating: 4.5,
    tags: ["Cancha Sintética", "Estacionamiento"],
    description: "Cancha de fútbol con césped sintético ubicada en el sector norte con vestuarios incluidos",
    price: "22",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha3.png",
    name: "Fútbol - Sur",
    address: "Sector Sur",
    rating: 4.1,
    tags: ["Cancha Natural", "Estacionamiento", "Iluminación"],
    description: "Cancha de fútbol con césped natural ubicada en el sur, ideal para partidos de fin de semana",
    price: "28",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha4.png",
    name: "Fútbol Premium",
    address: "Centro Premium", 
    rating: 4.7,
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de fútbol profesional con césped híbrido y todas las comodidades para equipos",
    price: "35",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha5.png",
    name: "Fútbol - Elite",
    address: "Zona Elite", 
    rating: 4.8,
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha premium de fútbol con estándar FIFA y equipamiento profesional completo",
    price: "40",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha6.png",
    name: "Fútbol - Deportivo",
    address: "Centro Deportivo", 
    rating: 4.4,
    tags: ["Cancha Sintética", "Estacionamiento", "Iluminación"],
    description: "Cancha de fútbol en complejo deportivo con múltiples servicios y torneos regulares",
    price: "30",
    nextAvailable: "16:30-17:30",
  }
];

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE FÚTBOL
const footballStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "15",
    icon: "⚽",
    subtitle: "Listas para reservar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$20-40",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 7, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.5⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.2, isPositive: true }
  },
  {
    title: "Jugadores en Cancha",
    value: "22",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 8, isPositive: true }
  }
];

export default function FutbolPage() {
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
    router.push('/sports/futbol/canchas/canchaseleccionada');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol" />
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
      <Sidebar userRole="usuario" sport="futbol" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>Fútbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha..."
              sport="futbol" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        {/* 🔥 STATS CARDS MEJORADAS CON STATSCARD */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Fútbol en Temuco
          </h2>
          <div className={styles.statsContainer}>
            {footballStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                trend={stat.trend}
                sport="futbol"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  // Agregar navegación específica si es necesario
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/futbol/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/futbol/canchas/'}
          >
            <div className={styles.courtButtonIcon}>⚽</div>
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
                  sport="futbol"
                  onClick={() => router.push('/sports/futbol/canchas/canchaseleccionada')}
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
            sport="futbol"
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