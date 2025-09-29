"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import atletismoCommon from './atletismo.module.css';
import StatsCard from '../../../components/charts/StatsCard';


// Datos de ejemplo para las canchas mejor calificadas (6 tarjetas)
const topRatedCourts = [
  {
    imageUrl: "/sports/atletismo/canchas/Cancha1.png",
    name: "Atletismo - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Pista al aire libre", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Pista de atletismo ubicada en el centro con áreas para salto y lanzamiento",
    price: "21",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha2.png",
    name: "Atletismo - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Pista al aire libre", "Estacionamiento"],
    description: "Pista de atletismo con cronometraje y carriles reglamentarios",
    price: "19",
    nextAvailable: "14:30-15:30", 
  }
];

export default function AtletismoPage() {
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
    disponiblesHoy: 8,
    precioPromedio: { min: 12, max: 20 },
    promedioCalificacion: 4.4,
    cantidadAtletas: 6
  };

  const totalSlides = Math.max(1, topRatedCourts.length - cardsToShow + 1);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSearch = () => console.log('Buscando:', searchTerm);
  const handleLocationSearch = () => console.log('Buscando ubicación:', locationSearch, 'Radio:', radiusKm);

  if (!isClient) {
    return (
      <div className={atletismoCommon.pageContainer}>
        <Sidebar userRole="usuario" sport="atletismo" />
        <div className={atletismoCommon.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className={atletismoCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />
      <div className={atletismoCommon.mainContent}>
        <div className={atletismoCommon.header}>
          <div className={atletismoCommon.headerLeft}>
            <div className={atletismoCommon.headerIcon}>🏃‍♂️</div>
            <h1 className={atletismoCommon.headerTitle}>{/* page title */}Pistas de Atletismo</h1>
          </div>
          <div className={atletismoCommon.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="atletismo"
            />
            <button className={atletismoCommon.userButton} onClick={() => router.push('/usuario/perfil')}>
              👤 Usuario
            </button>
          </div>
        </div>

        <div className={atletismoCommon.statsContainer}>
          <StatsCard
            title="Pistas disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span style={{fontSize: 20}}>📅</span>}
            subtitle="Disponible ahora"
            color="green"
            className={atletismoCommon.statCard}
            ariaLabel="Pistas disponibles hoy"
            sport="atletismo"
          />

          <StatsCard
            title="Rango de precios por hora"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span style={{fontSize: 20}}>💲</span>}
            subtitle="Precio promedio"
            color="blue"
            className={atletismoCommon.statCard}
            ariaLabel="Rango de precios por hora"
            sport="atletismo"
          />

          <StatsCard
            title="Promedio de calificación"
            value={`${stats.promedioCalificacion} ⭐`}
            icon={<span style={{fontSize: 20}}>⭐</span>}
            subtitle="Reseñas acumuladas"
            color="yellow"
            className={atletismoCommon.statCard}
            ariaLabel="Promedio de calificación"
            sport="atletismo"
          />

          <StatsCard
            title="Atletas en pista"
            value={stats.cantidadAtletas}
            icon={<span style={{fontSize: 20}}>🏃‍♂️</span>}
            subtitle="Asistentes activos"
            color="purple"
            className={atletismoCommon.statCard}
            ariaLabel="Atletas en pista"
            sport="atletismo"
          />
        </div>

        <div className={atletismoCommon.quickAccessSection}>
          <button 
            className={`${atletismoCommon.mainCourtButton} ${atletismoCommon.containerCard}`}
            onClick={() => router.push('/sports/atletismo/canchas')}
          >
            <div className={atletismoCommon.courtButtonIcon}>🏃‍♂️</div>
            <div className={atletismoCommon.courtButtonText}>
              <span className={atletismoCommon.courtButtonTitle}>Explorar Pistas</span>
              <span className={atletismoCommon.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={atletismoCommon.courtButtonArrow}>→</div>
          </button>
        </div>

        <div className={atletismoCommon.topRatedSection}>
          <div className={atletismoCommon.sectionHeader}>
            <h2 className={atletismoCommon.sectionTitle}>
              <span className={atletismoCommon.sectionIcon}>⭐</span>
              Pistas mejor calificadas
            </h2>
            <div className={atletismoCommon.carouselControls}>
              <button onClick={prevSlide} className={atletismoCommon.carouselButton} disabled={currentSlide === 0}>←</button>
              <span className={atletismoCommon.slideIndicator}>{currentSlide + 1} / {totalSlides}</span>
              <button onClick={nextSlide} className={atletismoCommon.carouselButton} disabled={currentSlide === totalSlides - 1}>→</button>
            </div>
          </div>

          <div className={atletismoCommon.carouselContainer}>
            <div className={atletismoCommon.courtsGrid} style={{ transform: `translateX(-${currentSlide * (320 + 20)}px)` }}>
              {topRatedCourts.map((court, index) => (
                <CourtCard key={index} {...court} sport="atletismo" onClick={() => router.push('/sports/atletismo/canchas/canchaseleccionada')} />
              ))}
            </div>
          </div>
        </div>

        <div className={atletismoCommon.mapSection}>
          <h2 className={atletismoCommon.sectionTitle}>Ubicación en el mapa de las pistas</h2>
            <div className={atletismoCommon.locationSearch}>
            <div className={atletismoCommon.locationInputContainer}>
              <span className={atletismoCommon.locationIcon}>📍</span>
              <input type="text" placeholder="Dirección, barrio o ciudad" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className={atletismoCommon.locationInput} />
            </div>
            <div className={atletismoCommon.radiusContainer}>
              <span className={atletismoCommon.radiusIcon}>📏</span>
              <select value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className={atletismoCommon.radiusSelect}>
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={atletismoCommon.searchButton}>Buscar</button>
          </div>

          <LocationMap sport="atletismo" latitude={-38.7359} longitude={-72.5904} address="Temuco, Chile" zoom={13} height="400px" />
          <div className={atletismoCommon.mapActions}><button className={atletismoCommon.helpButton}>❓ Ayuda</button></div>
        </div>
      </div>
    </div>
  );
}
