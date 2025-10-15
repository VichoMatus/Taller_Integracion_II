'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../hooks/useAuthStatus';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import StatsCard from '../../../components/charts/StatsCard'; // ✅ Importar StatsCard
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
    tags: ["Cancha Cerrada", "Estacionamiento", "Iluminación"],
    description: "Cancha de tenis en complejo deportivo con múltiples servicios disponibles",
    price: "26",
    nextAvailable: "16:30-17:30",
  }
];

const tennisStats = [
  {
    title: "Canchas Disponibles Hoy",
    value: "12",
    icon: "🎾",
    subtitle: "Listas para reservar",
    trend: { value: 4, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$22-35",
    icon: "💰",
    subtitle: "Por hora",
    trend: { value: 6, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.7⭐",
    icon: "🏆",
    subtitle: "De nuestras canchas",
    trend: { value: 0.4, isPositive: true }
  },
  {
    title: "Jugadores en Cancha",
    value: "4",
    icon: "👥",
    subtitle: "Ahora mismo",
    trend: { value: 2, isPositive: true }
  }
];

export default function TenisPage() {
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
    console.log('Navegando a cancha de tenis...');
    router.push('/sports/tenis/canchas/canchaseleccionada');
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
            Estadísticas del Tenis en Temuco
          </h2>
          <div className={styles.statsContainer}>
            {tennisStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                trend={stat.trend}
                sport="tenis"
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  // Agregar navegación específica si es necesario
                  if (stat.title.includes("Canchas")) {
                    router.push('/sports/tenis/canchas');
                  }
                }}
              />
            ))}
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
              {filteredCourts.map((court, index) => (
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
            sport="tenis"
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