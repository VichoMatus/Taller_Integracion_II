'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../hooks/useAuthStatus';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import StatsCard from '../../../components/charts/StatsCard';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './page.module.css';

// Datos de ejemplo para las piscinas de natación mejor calificadas
const topRatedCourts = [
  {
    imageUrl: "/sports/natacion/piscinas/Piscina1.png",
    name: "Piscina Olímpica - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.8,
    tags: ["Piscina Techada", "Estacionamiento", "Iluminación", "Vestuarios"],
    description: "Piscina olímpica ubicada en el centro con carriles separados y equipamiento profesional",
    price: "35",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/natacion/piscinas/Piscina2.png",
    name: "Piscina - Norte",
    address: "Sector Norte",
    rating: 4.6,
    tags: ["Piscina Semi-olímpica", "Estacionamiento", "Sauna"],
    description: "Piscina semi-olímpica con áreas de descanso y servicios complementarios",
    price: "28",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/swimming-pool3.jpg",
    name: "Piscina - Sur",
    address: "Sector Sur",
    rating: 4.4,
    tags: ["Piscina Techada", "Estacionamiento", "Jacuzzi"],
    description: "Piscina climatizada con áreas recreativas y profesionales",
    price: "32",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/path/to/swimming-pool4.jpg",
    name: "Centro Acuático Premium",
    address: "Centro Premium", 
    rating: 4.9,
    tags: ["Piscina Olímpica", "Estacionamiento", "Spa", "Restaurante", "Vestuarios"],
    description: "Complejo acuático premium con múltiples piscinas y servicios de lujo",
    price: "45",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/path/to/swimming-pool5.jpg",
    name: "Piscina - Elite",
    address: "Zona Elite", 
    rating: 4.7,
    tags: ["Piscina Techada", "Estacionamiento", "Hidromasaje", "Cafetería"],
    description: "Piscina de alta gama con tecnología de filtración avanzada",
    price: "38",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/path/to/swimming-pool6.jpg",
    name: "Complejo Deportivo Acuático",
    address: "Centro Deportivo", 
    rating: 4.5,
    tags: ["Piscina Semi-olímpica", "Estacionamiento", "Área infantil"],
    description: "Complejo deportivo con piscinas para diferentes niveles y edades",
    price: "30",
    nextAvailable: "16:30-17:30",
  }
];

const swimmingStats = [
  {
    title: "Piscinas Disponibles Hoy",
    value: "6",
    icon: "🏊‍♀️",
    subtitle: "Listas para reservar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$28-45",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestras piscinas",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Carriles Promedio",
    value: "8",
    icon: "➡️",
    subtitle: "Por piscina",
    trend: { value: 1, isPositive: true }
  }
];

export default function NatacionPage() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
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

  const handleCanchaClick = (court: any) => {
    console.log('Navegando a piscinas de natación...');
    router.push('/sports/natacion/piletas/piletaseleccionada');
  };

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="natacion" />
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
      <Sidebar userRole="usuario" sport="natacion" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏊‍♂️</div>
            <h1 className={styles.headerTitle}>Natación</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la piscina..."
              sport="natacion" 
            />
            <button 
              className={styles.userButton} 
              onClick={handleUserButtonClick}
              disabled={buttonProps.disabled}
            >
              <span>👤</span>
              <span>{buttonProps.text}</span>
            </button>
          </div>
        </div>

        {/* 🔥 STATS CARDS MEJORADAS CON STATSCARD (nueva estructura) */}
        <div className={styles.statsSection}>
          <h2 className={styles.statsTitle}>
            <span className={styles.statsTitleIcon}>📊</span>
            Estadísticas de Natación en Temuco
          </h2>
          <div className={styles.statsContainer}>
            {swimmingStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                trend={stat.trend}
                sport="natacion"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  // Agregar navegación específica si es necesario
                  if (stat.title.includes("Piscinas")) {
                    router.push('/sports/natacion/piletas');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
          <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/natacion/piletas'}
          >
            <div className={styles.courtButtonIcon}>🏊‍♂️</div>
            <div className={styles.courtButtonText}>
              <span className={styles.courtButtonTitle}>Explorar Piscinas</span>
              <span className={styles.courtButtonSubtitle}>Ver todas las piscinas disponibles</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
          </button>
        </div>

        {/* Piscinas mejor calificadas con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Piscinas mejor calificadas
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
                  sport="natacion"
                  onClick={() => router.push('/sports/natacion/piletas/piletaseleccionada')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de las piscinas</h2>
          
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
            sport="natacion"
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