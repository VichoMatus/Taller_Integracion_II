"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import skateCommon from './skate.module.css';
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
      <div className={skateCommon.pageContainer}>
        <Sidebar userRole="usuario" sport="skate" />
        <div className={skateCommon.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className={skateCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />
      <div className={skateCommon.mainContent}>
        <div className={skateCommon.header}>
          <div className={skateCommon.headerLeft}>
            <div className={skateCommon.headerIcon}>🛹</div>
            <h1 className={skateCommon.headerTitle}>Skateparks</h1>
          </div>
          <div className={skateCommon.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del skatepark"
              sport="skate"
            />
            <button className={skateCommon.userButton} onClick={() => router.push('/usuario/perfil')}>
              👤 Usuario
            </button>
          </div>
        </div>

        <div className={skateCommon.statsContainer}>
          <StatsCard
            title="Skateparks disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span style={{fontSize: 20}}>📅</span>}
            subtitle="Disponible ahora"
            color="green"
            className={skateCommon.statCard}
            ariaLabel="Skateparks disponibles hoy"
            sport="skate"
          />

          <StatsCard
            title="Rango de precios"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span style={{fontSize: 20}}>💲</span>}
            subtitle="Precio promedio"
            color="blue"
            className={skateCommon.statCard}
            ariaLabel="Rango de precios por hora"
            sport="skate"
          />

          <StatsCard
            title="Promedio de calificación"
            value={`${stats.promedioCalificacion} ⭐`}
            icon={<span style={{fontSize: 20}}>⭐</span>}
            subtitle="Reseñas acumuladas"
            color="yellow"
            className={skateCommon.statCard}
            ariaLabel="Promedio de calificación"
            sport="skate"
          />

          <StatsCard
            title="Skaters activos"
            value={stats.cantidadAtletas}
            icon={<span style={{fontSize: 20}}>🛹</span>}
            subtitle="Asistentes activos"
            color="purple"
            className={skateCommon.statCard}
            ariaLabel="Skaters en park"
            sport="skate"
          />
        </div>

        <div className={skateCommon.quickAccessSection}>
          <button 
            className={`${skateCommon.mainCourtButton} ${skateCommon.containerCard}`}
            onClick={() => router.push('/sports/skate/canchas')}
          >
            <div className={skateCommon.courtButtonIcon}>🛹</div>
            <div className={skateCommon.courtButtonText}>
              <span className={skateCommon.courtButtonTitle}>Explorar Skateparks</span>
              <span className={skateCommon.courtButtonSubtitle}>Ver todos los skateparks disponibles</span>
            </div>
            <div className={skateCommon.courtButtonArrow}>→</div>
          </button>
        </div>

        <div className={skateCommon.topRatedSection}>
          <div className={skateCommon.sectionHeader}>
            <h2 className={skateCommon.sectionTitle}>
              <span className={skateCommon.sectionIcon}>⭐</span>
              Skateparks mejor valorados
            </h2>
            <div className={skateCommon.carouselControls}>
              <button onClick={prevSlide} className={skateCommon.carouselButton} disabled={currentSlide === 0}>←</button>
              <span className={skateCommon.slideIndicator}>{currentSlide + 1} / {totalSlides}</span>
              <button onClick={nextSlide} className={skateCommon.carouselButton} disabled={currentSlide === totalSlides - 1}>→</button>
            </div>
          </div>

          <div className={skateCommon.carouselContainer}>
            <div className={skateCommon.courtsGrid} style={{ transform: `translateX(-${currentSlide * (320 + 20)}px)` }}>
              {topRatedCourts.map((court, index) => (
                <CourtCard key={index} {...court} sport="skate" onClick={() => router.push('/sports/skate/canchas/canchaseleccionada')} />
              ))}
            </div>
          </div>
        </div>

        <div className={skateCommon.mapSection}>
          <h2 className={skateCommon.sectionTitle}>Ubicación en el mapa de los skateparks</h2>
            <div className={skateCommon.locationSearch}>
            <div className={skateCommon.locationInputContainer}>
              <span className={skateCommon.locationIcon}>📍</span>
              <input type="text" placeholder="Dirección, barrio o ciudad" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className={skateCommon.locationInput} />
            </div>
            <div className={skateCommon.radiusContainer}>
              <span className={skateCommon.radiusIcon}>📏</span>
              <select value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className={skateCommon.radiusSelect}>
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={skateCommon.searchButton}>Buscar</button>
          </div>

          <LocationMap sport="skate" latitude={-38.7359} longitude={-72.5904} address="Temuco, Chile" zoom={13} height="400px" />
          <div className={skateCommon.mapActions}><button className={skateCommon.helpButton}>❓ Ayuda</button></div>
        </div>
      </div>
    </div>
  );
}
