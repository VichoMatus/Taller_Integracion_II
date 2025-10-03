'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/charts/StatsCard';
import styles from './page.module.css';

// Datos de ejemplo para los gimnasios mejor calificados (6 tarjetas)
const topRatedGyms = [
  {
    imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio1.png",
    name: "CrossFit Iron Box",
    address: "Centro, Temuco",
    rating: 4.8,
    reviews: "156 reseñas",
    tags: ["Entrenamiento Funcional", "CrossFit", "Box Profesional", "Coaching"],
    description: "Box de CrossFit completamente equipado con rigs, kettlebells, barras olímpicas y entrenadores certificados",
    price: "15",
    nextAvailable: "06:00-07:00", 
  },
  {
    imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio2.png",
    name: "Functional Fitness Center",
    address: "Sector Norte",
    rating: 4.6,
    reviews: "124 reseñas",
    tags: ["Entrenamiento Funcional", "TRX", "Kettlebells", "Personal Training"],
    description: "Centro especializado en entrenamiento funcional con equipos TRX, battle ropes y entrenamientos personalizados",
    price: "12",
    nextAvailable: "07:30-08:30", 
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym3.png",
    name: "Elite CrossFit Sud",
    address: "Sector Sur",
    rating: 4.7,
    reviews: "98 reseñas",
    tags: ["CrossFit", "Halterofilia", "Box Equipado", "Clases Grupales"],
    description: "Box de CrossFit con plataformas de halterofilia, anillas y clases grupales dirigidas por atletas certificados",
    price: "18",
    nextAvailable: "Mañana 06:30-07:30",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym4.png",
    name: "Beast Mode Gym",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "187 reseñas",
    tags: ["CrossFit Elite", "Competencia", "Coaching Avanzado", "Nutrición"],
    description: "Box premium de CrossFit para atletas de competencia con equipamiento profesional y coaching nutricional",
    price: "25",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym5.png",
    name: "Functional Training Hub",
    address: "Zona Industrial", 
    rating: 4.5,
    reviews: "143 reseñas",
    tags: ["Entrenamiento Funcional", "Calistenia", "Strongman", "Open Box"],
    description: "Hub de entrenamiento funcional con área de calistenia, implementos strongman y concepto open box 24/7",
    price: "20",
    nextAvailable: "05:30-06:30",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym6.png",
    name: "CrossFit Patagonia",
    address: "Centro Deportivo", 
    rating: 4.4,
    reviews: "112 reseñas",
    tags: ["CrossFit", "Outdoor Training", "Bootcamp", "Recuperación"],
    description: "Box de CrossFit con área outdoor, bootcamps al aire libre y zona de recuperación con sauna y masajes",
    price: "16",
    nextAvailable: "19:00-20:00",
  }
];

// 🔥 DATOS PARA LAS ESTADÍSTICAS DE CROSSFIT Y ENTRENAMIENTO FUNCIONAL
const crossfitStats = [
  {
    title: "Boxes Disponibles Hoy",
    value: "8",
    icon: "🏋️‍♂️",
    subtitle: "Listos para entrenar",
    trend: { value: 2, isPositive: true }
  },
  {
    title: "Rango de Precios",
    value: "$12-25",
    icon: "💰",
    subtitle: "Por clase",
    trend: { value: 6, isPositive: true }
  },
  {
    title: "Calificación Promedio",
    value: "4.6⭐",
    icon: "🏆",
    subtitle: "De nuestros boxes",
    trend: { value: 0.3, isPositive: true }
  },
  {
    title: "Atletas Entrenando",
    value: "45",
    icon: "💪",
    subtitle: "Ahora mismo",
    trend: { value: 12, isPositive: true }
  }
];

export default function CrossfitPage() {
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

  const totalSlides = Math.max(1, topRatedGyms.length - cardsToShow + 1);

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
    console.log('Buscando gimnasio de CrossFit:', searchTerm);
  };

  const handleLocationSearch = () => {
    console.log('Buscando ubicación de boxes:', locationSearch, 'Radio:', radiusKm);
  };

  const handleGymClick = (gym: any) => {
    console.log('Navegando a gimnasio de CrossFit...');
    router.push('/sports/crossfitentrenamientofuncional/gimnasios/gimseleccionado');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda con CrossFit o Entrenamiento Funcional? Contáctanos al (45) 555-0000 o envía un email a crossfit@sporthub.cl');
  };

  if (!isClient) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />
        <div className={styles.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando boxes de CrossFit...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏋️‍♂️</div>
            <h1 className={styles.headerTitle}>CrossFit y Entrenamiento Funcional</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Nombre del box o gimnasio..."
            sport="crossfitentrenamientofuncional" 
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
            Estadísticas de CrossFit en Temuco
          </h2>
          <div className={styles.statsContainer}>
            {crossfitStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                trend={stat.trend}
                onClick={() => {
                  console.log(`Clicked on ${stat.title} stat`);
                  // Navegación específica para CrossFit
                  if (stat.title.includes("Boxes")) {
                    router.push('/sports/crossfitentrenamientofuncional/gimnasios');
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.quickAccessSection}>
        <button 
            className={styles.mainCourtButton}
            onClick={() => window.location.href = '/sports/crossfitentrenamientofuncional/gimnasios/'}
            >
            <div className={styles.courtButtonIcon}>🏋️‍♂️</div>
            <div className={styles.courtButtonText}>
            <span className={styles.courtButtonTitle}>Explorar Gimnasios</span>
            <span className={styles.courtButtonSubtitle}>Ver todos los centros de CrossFit y Entrenamiento Funcional</span>
            </div>
            <div className={styles.courtButtonArrow}>→</div>
        </button>
        </div>

        {/* Gimnasios mejor calificados con carrusel */}
        <div className={styles.topRatedSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⭐</span>
              Gimnasios mejor calificados
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
              {topRatedGyms.map((gym, index) => (
                <CourtCard 
                  key={index} 
                  {...gym} 
                  sport="crossfitentrenamientofuncional"
                  onClick={() => router.push('/sports/crossfitentrenamientofuncional/gimnasios/gimnasioseleccionado')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación en el mapa de los boxes */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Ubicación en el mapa de los gimnasios</h2>
          
          <div className={styles.locationSearch}>
            <div className={styles.locationInputContainer}>
              <span className={styles.locationIcon}>📍</span>
              <input
                type="text"
                placeholder="Dirección, barrio o zona de entrenamientos"
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
              Buscar gimnasios
            </button>
          </div>

          <LocationMap 
            latitude={-38.7359}
            longitude={-72.5904}
            address="Temuco, Chile"
            zoom={13}
            height="400px"
            sport="crossfitentrenamientofuncional"
          />

          <div className={styles.mapActions}>
            <button className={styles.helpButton} onClick={handleHelp}>
              ❓ Ayuda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}