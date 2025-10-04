"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import ciclismoCommon from './ciclismo.module.css';
import StatsCard from '../../../components/charts/StatsCard';

// Datos de ejemplo para las rutas mejor calificadas
const topRatedCourts = [
  {
    imageUrl: "/sports/ciclismo/ciclismo.png",
    name: "Ciclismo - Sendero Bosque",
    address: "Parque Nacional, Zona Norte",
    rating: 4.7,
    reviews: "156 reseñas",
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
    reviews: "89 reseñas",
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
    reviews: "203 reseñas",
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
      <div className={ciclismoCommon.pageContainer}>
        <Sidebar userRole="usuario" sport="ciclismo" />
        <div className={ciclismoCommon.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={ciclismoCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={ciclismoCommon.mainContent}>
        <div className={ciclismoCommon.header}>
          <div className={ciclismoCommon.headerLeft}>
            <div className={ciclismoCommon.headerIcon}>🚴‍♂️</div>
            <h1 className={ciclismoCommon.headerTitle}>Ciclismo</h1>
          </div>
          <div className={ciclismoCommon.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="ciclismo"
            />
            <button className={ciclismoCommon.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={ciclismoCommon.statsContainer}>
          <StatsCard
            title="Rutas disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span style={{fontSize: 20}}>📅</span>}
            subtitle="Disponible ahora"
            color="green"
            className={ciclismoCommon.statCard}
            ariaLabel="Rutas disponibles hoy"
            sport="ciclismo"
          />

          <StatsCard
            title="Rango de precios por hora"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span style={{fontSize: 20}}>💲</span>}
            subtitle="Precio promedio"
            color="blue"
            className={ciclismoCommon.statCard}
            ariaLabel="Rango de precios por hora"
            sport="ciclismo"
          />

          <StatsCard
            title="Promedio de calificación"
            value={`${stats.promedioCalificacion} ⭐`}
            icon={<span style={{fontSize: 20}}>⭐</span>}
            subtitle="Reseñas acumuladas"
            color="yellow"
            className={ciclismoCommon.statCard}
            ariaLabel="Promedio de calificación"
            sport="ciclismo"
          />

          <StatsCard
            title="Ciclistas en ruta"
            value={stats.cantidadCiclistas}
            icon={<span style={{fontSize: 20}}>🚴‍♂️</span>}
            subtitle="Asistentes activos"
            color="purple"
            className={ciclismoCommon.statCard}
            ariaLabel="Ciclistas en ruta"
            sport="ciclismo"
          />
        </div>

        <div className={ciclismoCommon.quickAccessSection}>
          <button 
            className={`${ciclismoCommon.mainCourtButton} ${ciclismoCommon.containerCard}`}
            onClick={() => router.push('/sports/ciclismo/canchas')}
          >
            <div className={ciclismoCommon.courtButtonIcon}>🚴‍♂️</div>
            <div className={ciclismoCommon.courtButtonText}>
              <span className={ciclismoCommon.courtButtonTitle}>Explorar Rutas</span>
              <span className={ciclismoCommon.courtButtonSubtitle}>Ver todas las rutas disponibles</span>
            </div>
            <div className={ciclismoCommon.courtButtonArrow}>→</div>
          </button>
        </div>

        <div className={ciclismoCommon.topRatedSection}>
          <div className={ciclismoCommon.sectionHeader}>
            <h2 className={ciclismoCommon.sectionTitle}>
              <span className={ciclismoCommon.sectionIcon}>⭐</span>
              Rutas mejor calificadas
            </h2>
            <div className={ciclismoCommon.carouselControls}>
              <button onClick={prevSlide} className={ciclismoCommon.carouselButton} disabled={currentSlide === 0}>←</button>
              <span className={ciclismoCommon.slideIndicator}>{currentSlide + 1} / {totalSlides}</span>
              <button onClick={nextSlide} className={ciclismoCommon.carouselButton} disabled={currentSlide === totalSlides - 1}>→</button>
            </div>
          </div>

          <div className={ciclismoCommon.carouselContainer}>
            <div className={ciclismoCommon.courtsGrid} style={{ transform: `translateX(-${currentSlide * (320 + 20)}px)` }}>
              {topRatedCourts.map((court, index) => (
                <CourtCard key={index} {...court} sport="ciclismo" onClick={() => router.push('/sports/ciclismo/canchas/canchaseleccionada')} />
              ))}
            </div>
          </div>
        </div>

        <div className={ciclismoCommon.mapSection}>
          <h2 className={ciclismoCommon.sectionTitle}>Ubicación en el mapa de las rutas</h2>
          <div className={ciclismoCommon.locationSearch}>
            <div className={ciclismoCommon.locationInputContainer}>
              <span className={ciclismoCommon.locationIcon}>📍</span>
              <input type="text" placeholder="Dirección, barrio o ciudad" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className={ciclismoCommon.locationInput} />
            </div>
            <div className={ciclismoCommon.radiusContainer}>
              <span className={ciclismoCommon.radiusIcon}>📏</span>
              <select value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className={ciclismoCommon.radiusSelect}>
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={ciclismoCommon.searchButton}>Buscar</button>
          </div>

          <LocationMap sport="ciclismo" latitude={-38.7359} longitude={-72.5904} address="Temuco, Chile" zoom={13} height="400px" />
          <div className={ciclismoCommon.mapActions}><button className={ciclismoCommon.helpButton}>❓ Ayuda</button></div>
        </div>
      </div>
    </div>
  );
}