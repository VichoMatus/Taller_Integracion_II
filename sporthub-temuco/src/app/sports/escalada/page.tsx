'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './page.module.css';

// Datos de ejemplo para los centros de escalada mejor calificados (6 tarjetas)
const topRatedClimbingCenters = [
  {
    imageUrl: "/sports/escalada/centros/Centro1.png",
    name: "Escalada Vertical - Centro",
    address: "Centro, Temuco",
    rating: 4.7,
    reviews: "89 reseñas",
    tags: ["Escalada Indoor", "Boulder", "Equipos Incluidos", "Instructores"],
    description: "Centro de escalada indoor con rutas de diferentes niveles, boulder y alquiler de equipos completo",
    price: "18",
    nextAvailable: "14:00-15:00", 
  },
  {
    imageUrl: "/sports/escalada/centros/Centro2.png",
    name: "Boulder & Climb Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "67 reseñas",
    tags: ["Boulder", "Escalada Deportiva", "Cafetería", "Estacionamiento"],
    description: "Centro especializado en boulder y escalada deportiva con muro de 15 metros y zona de entrenamiento",
    price: "15",
    nextAvailable: "16:30-17:30", 
  },
  {
    imageUrl: "/sports/escalada/centros/Centro3.png",
    name: "Escalada Outdoor Sur",
    address: "Sector Sur",
    rating: 4.8,
    reviews: "124 reseñas",
    tags: ["Escalada Outdoor", "Guías", "Transporte", "Equipos"],
    description: "Centro de escalada en roca natural con guías certificados y tours a sectores cercanos a Temuco",
    price: "35",
    nextAvailable: "Mañana 08:00-09:00",
  },
  {
    imageUrl: "/sports/escalada/centros/Centro4.png",
    name: "Climb Gym Premium",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "156 reseñas",
    tags: ["Escalada Indoor", "Boulder", "Entrenamiento", "Sauna"],
    description: "Gimnasio de escalada premium con muros de 18 metros, boulder avanzado y área de recuperación",
    price: "25",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/escalada/centros/Centro5.png",
    name: "Escalada Volcán",
    address: "Zona Volcánica", 
    rating: 4.6,
    reviews: "203 reseñas",
    tags: ["Escalada Outdoor", "Volcanes", "Expediciones", "Camping"],
    description: "Centro especializado en escalada en volcanes con expediciones guiadas y camping base",
    price: "45",
    nextAvailable: "Sábado 06:00-07:00",
  },
  {
    imageUrl: "/sports/escalada/centros/Centro6.png",
    name: "Rock Climbing Temuco",
    address: "Centro Deportivo", 
    rating: 4.4,
    reviews: "78 reseñas",
    tags: ["Escalada Indoor", "Cursos", "Certificación", "Competencias"],
    description: "Centro de escalada con cursos de certificación, competencias regulares y entrenamiento técnico",
    price: "20",
    nextAvailable: "19:00-20:00",
  }
];

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE ESCALADA
const climbingStats = [
  {
    title: "Centros Disponibles Hoy",
    value: "8",
    icon: "🧗‍♂️",
    subtitle: "Listos para escalar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$15-45",
    icon: "💰",
    subtitle: "Por sesión",
    trend: { value: 5, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestros centros",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Escaladores Activos",
    value: "34",
    icon: "🏔️",
    subtitle: "Ahora mismo",
    trend: { value: 12, isPositive: true }
  }
];

export default function EscaladaPage() {
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

  const totalSlides = Math.max(1, topRatedClimbingCenters.length - cardsToShow + 1);

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
    console.log('Buscando centro de escalada:', searchTerm);
  };

  const handleLocationSearch = () => {
    console.log('Buscando ubicación de centros de escalada:', locationSearch, 'Radio:', radiusKm);
  };

  const handleCentroClick = (center: any) => {
    console.log('Navegando a centro de escalada...');
    router.push('/sports/escalada/centros/centroseleccionado');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="escalada" />
        <div className={styles.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando centros de escalada...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="escalada" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🧗‍♂️</div>
            <h1 className={styles.headerTitle}>Escalada</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del centro o ruta..."
              sport="escalada" 
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
            Estadísticas de Escalada en Temuco
          </h2>
          <div className={styles.statsContainer}>
            {climbingStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                trend={stat.trend}
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  // Navegación específica para escalada
                  if (stat.title.includes("Centros")) {
                    router.push('/sports/escalada/centros');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/escalada/centros/'}
          >
            <div className={styles.courtButtonIcon}>🧗‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Centros de Escalada</span>
              <span className={styles.courtButtonSubtitle}>Ver todos los centros y rutas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}> → </div>
          </button>
        </div>

        {/* Centros de escalada mejor calificados con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Centros mejor calificados
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
              {topRatedClimbingCenters.map((center, index) => (
                <CourtCard 
                  key={index} 
                  {...center} 
                  sport="escalada"
                  onClick={() => router.push('/sports/escalada/centros/centroseleccionado')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los centros de escalada</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Dirección, barrio o zona de escalada"
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
                <option value="25">Radio 25km</option>
                <option value="50">Radio 50km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={styles.searchLocationButton}>
              Buscar centros
            </button>
          </div>

          <LocationMap 
            latitude={-38.7359}
            longitude={-72.5904}
            address="Temuco, Chile"
            zoom={13}
            height="400px"
            sport="escalada"
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