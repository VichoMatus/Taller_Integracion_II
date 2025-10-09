'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';
import StatsCard from '../../../components/charts/StatsCard';

// Datos de ejemplo para las canchas mejor calificadas de padel (6 tarjetas)
const topRatedCourts = [
  {
    imageUrl: "/sports/padel/canchas/Cancha1.png",
    name: "Padel - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.6,
    tags: ["Cancha de Cristal", "Estacionamiento", "Iluminación LED", "Vestuarios"],
    description: "Cancha de padel profesional con paredes de cristal ubicada en el centro con raquetas y pelotas incluidas",
    price: "32",
    nextAvailable: "19:00-20:30", 
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha2.png",
    name: "Padel - Norte",
    address: "Sector Norte",
    rating: 4.4,
    tags: ["Cancha Premium", "Estacionamiento", "Climatizada"],
    description: "Cancha de padel premium con superficie de última generación ubicada en el sector norte",
    price: "28",
    nextAvailable: "15:00-16:30", 
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha3.png",
    name: "Padel - Sur",
    address: "Sector Sur",
    rating: 4.2,
    tags: ["Cancha Techada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de padel techada ubicada en el sur, ideal para jugar en cualquier clima",
    price: "30",
    nextAvailable: "Mañana 10:00-11:30",
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha4.png",
    name: "Padel Premium",
    address: "Centro Premium", 
    rating: 4.8,
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación LED", "Bar"],
    description: "Cancha de padel profesional con estándar internacional y todas las comodidades VIP",
    price: "45",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha5.png",
    name: "Padel - Elite",
    address: "Zona Elite", 
    rating: 4.7,
    tags: ["Cancha Internacional", "Estacionamiento", "Climatizada", "Spa"],
    description: "Cancha de padel de élite con superficie sintética de competición y servicios exclusivos",
    price: "50",
    nextAvailable: "17:30-19:00",
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha6.png",
    name: "Padel - Club",
    address: "Club Deportivo", 
    rating: 4.5,
    tags: ["Cancha de Club", "Estacionamiento", "Iluminación", "Torneos"],
    description: "Cancha de padel en club deportivo con torneos regulares y ambiente competitivo",
    price: "35",
    nextAvailable: "16:00-17:30",
  }
];
const footballStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "15",
    icon: "⚽",
    subtitle: "Listas para reservar",
    trend: { value: 3, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$20-40",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 2, isPositive: true }
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
    value: "4",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 8, isPositive: true }
  }
];

export default function PadelPage() {
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

  // Stats de ejemplo específicos para padel
  const stats = {
    disponiblesHoy: 12,
    precioPromedio: { min: 28, max: 50 },
    promedioCalificacion: 4.6,
    cantidadJugadores: 4 // En padel son 4 jugadores (2vs2)
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
    console.log('Buscando canchas de padel:', searchTerm);
  };

  const handleLocationSearch = () => {
    console.log('Buscando ubicación de canchas de padel:', locationSearch, 'Radio:', radiusKm);
  };

  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha de padel...');
    router.push('/sports/padel/canchas/canchaseleccionada');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="padel" />
        <div className={styles.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando canchas de padel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="padel" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🎾</div>
            <h1 className={styles.headerTitle}>Padel</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha de padel..."
              sport="padel" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas del Padel en Temuco
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
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  // Agregar navegación específica si es necesario
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/padel/canchas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/padel/canchas/'}
          >
            <div className={styles.courtButtonIcon}>🎾</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Canchas de Padel</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las canchas de padel disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* Canchas de padel mejor calificadas con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Canchas de Padel mejor calificadas
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
                  sport="padel"
                  onClick={() => router.push('/sports/padel/canchas/canchaseleccionada')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa de canchas de padel */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las canchas de Padel</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Buscar canchas de padel por ubicación..."
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
            address="Temuco, Chile - Canchas de Padel"
            zoom={13}
            height="400px"
            sport="padel"
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