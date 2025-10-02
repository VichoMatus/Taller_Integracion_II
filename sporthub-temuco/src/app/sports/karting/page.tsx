"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../components/charts/CourtCard';
import SearchBar from '../../../components/SearchBar';
import LocationMap from '../../../components/LocationMap';
import Sidebar from '../../../components/layout/Sidebar';
import kartingCommon from './karting.module.css';
import StatsCard from '../../../components/charts/StatsCard';

// Datos de ejemplo para las pistas mejor calificadas
const topRatedCourts = [
  {
    imageUrl: "/sports/karting/karting.png",
    name: "Kartódromo Speedway Temuco",
    address: "Sector Industrial, Temuco",
    rating: 4.8,
    reviews: "124 reseñas",
    tags: ["Pista Techada", "Karts Eléctricos", "Cronometraje Digital", "Estacionamiento"],
    description: "Pista techada de última generación con karts eléctricos de alto rendimiento",
    price: "15",
    nextAvailable: "10:00-11:00", 
  },
  {
    imageUrl: "/sports/karting/karting.png",
    name: "Circuit Racing Park",
    address: "Labranza, Temuco",
    rating: 4.6,
    reviews: "98 reseñas",
    tags: ["Pista Outdoor", "Karts de Competición", "Área VIP"],
    description: "Circuito outdoor profesional con karts de competición y área VIP",
    price: "12",
    nextAvailable: "14:00-15:00", 
  },
  {
    imageUrl: "/sports/karting/karting.png",
    name: "Thunder Kart Arena",
    address: "Pedro de Valdivia, Temuco",
    rating: 4.9,
    reviews: "156 reseñas",
    tags: ["Pista Nocturna", "Simuladores", "Escuela de Karting", "Área de descanso"],
    description: "Arena de karting con pista nocturna, simuladores y escuela profesional",
    price: "18",
    nextAvailable: "16:30-17:30", 
  }
];

export default function KartingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Estados para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  
  // Estados para búsqueda por ubicación
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  
  // Control de hidratación
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculateCardsToShow = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      return 3;
    }
    return 3;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCardsToShow(calculateCardsToShow());
    }

    const handleResize = () => {
      setCardsToShow(calculateCardsToShow());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = {
    disponiblesHoy: 8,
    precioPromedio: { min: 10, max: 20 },
    promedioCalificacion: 4.7,
    cantidadPilotos: 24
  };

  const totalSlides = Math.max(1, topRatedCourts.length - cardsToShow + 1);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSearch = () => console.log('Buscando:', searchTerm);
  const handleLocationSearch = () => console.log('Buscando ubicación:', locationSearch, 'Radio:', radiusKm);

  if (!isClient) {
    return (
      <div className={kartingCommon.pageContainer}>
        <Sidebar userRole="usuario" sport="karting" />
        <div className={kartingCommon.mainContent}>
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={kartingCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="karting" />

      <div className={kartingCommon.mainContent}>
        <div className={kartingCommon.header}>
          <div className={kartingCommon.headerLeft}>
            <div className={kartingCommon.headerIcon}>🏎️</div>
            <h1 className={kartingCommon.headerTitle}>Pistas de Karting</h1>
          </div>
          <div className={kartingCommon.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="karting"
            />
            <button className={kartingCommon.userButton} onClick={() => router.push('/usuario/perfil')}>
              👤 Usuario
            </button>
          </div>
        </div>

        <div className={kartingCommon.statsContainer}>
          <StatsCard
            title="Pistas disponibles hoy"
            value={stats.disponiblesHoy}
            icon={<span style={{fontSize: 20}}>📅</span>}
            subtitle="Disponible ahora"
            color="red"
            className={kartingCommon.statCard}
            ariaLabel="Pistas disponibles hoy"
            sport="karting"
          />

          <StatsCard
            title="Rango de precios por hora"
            value={`$${stats.precioPromedio.min}-${stats.precioPromedio.max}`}
            icon={<span style={{fontSize: 20}}>�</span>}
            subtitle="Precio promedio"
            color="blue"
            className={kartingCommon.statCard}
            ariaLabel="Rango de precios por hora"
            sport="karting"
          />

          <StatsCard
            title="Promedio de calificación"
            value={`${stats.promedioCalificacion} ⭐`}
            icon={<span style={{fontSize: 20}}>⭐</span>}
            subtitle="Reseñas acumuladas"
            color="yellow"
            className={kartingCommon.statCard}
            ariaLabel="Promedio de calificación"
            sport="karting"
          />

          <StatsCard
            title="Pilotos en pista"
            value={stats.cantidadPilotos}
            icon={<span style={{fontSize: 20}}>🏎️</span>}
            subtitle="Asistentes activos"
            color="purple"
            className={kartingCommon.statCard}
            ariaLabel="Pilotos en pista"
            sport="karting"
          />
        </div>

        <div className={kartingCommon.quickAccessSection}>
          <button 
            className={`${kartingCommon.mainCourtButton} ${kartingCommon.containerCard}`}
            onClick={() => router.push('/sports/karting/canchas')}
          >
            <div className={kartingCommon.courtButtonIcon}>🏎️</div>
            <div className={kartingCommon.courtButtonText}>
              <span className={kartingCommon.courtButtonTitle}>Explorar Pistas</span>
              <span className={kartingCommon.courtButtonSubtitle}>Ver todas las pistas disponibles</span>
            </div>
            <div className={kartingCommon.courtButtonArrow}>→</div>
          </button>
        </div>

        <div className={kartingCommon.topRatedSection}>
          <div className={kartingCommon.sectionHeader}>
            <h2 className={kartingCommon.sectionTitle}>
              <span className={kartingCommon.sectionIcon}>⭐</span>
              Pistas mejor calificadas
            </h2>
            <div className={kartingCommon.carouselControls}>
              <button onClick={prevSlide} className={kartingCommon.carouselButton} disabled={currentSlide === 0}>←</button>
              <span className={kartingCommon.slideIndicator}>{currentSlide + 1} / {totalSlides}</span>
              <button onClick={nextSlide} className={kartingCommon.carouselButton} disabled={currentSlide === totalSlides - 1}>→</button>
            </div>
          </div>

          <div className={kartingCommon.carouselContainer}>
            <div className={kartingCommon.courtsGrid} style={{ transform: `translateX(-${currentSlide * (320 + 20)}px)` }}>
              {topRatedCourts.map((court, index) => (
                <CourtCard key={index} {...court} sport="karting" onClick={() => router.push('/sports/karting/canchas/canchaseleccionada')} />
              ))}
            </div>
          </div>
        </div>

        <div className={kartingCommon.mapSection}>
          <h2 className={kartingCommon.sectionTitle}>Ubicación en el mapa de las pistas</h2>
          <div className={kartingCommon.locationSearch}>
            <div className={kartingCommon.locationInputContainer}>
              <span className={kartingCommon.locationIcon}>📍</span>
              <input type="text" placeholder="Dirección, barrio o ciudad" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className={kartingCommon.locationInput} />
            </div>
            <div className={kartingCommon.radiusContainer}>
              <span className={kartingCommon.radiusIcon}>📏</span>
              <select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className={kartingCommon.radiusSelect}>
                <option value="1">Radio 1km</option>
                <option value="3">Radio 3km</option>
                <option value="5">Radio 5km</option>
                <option value="10">Radio 10km</option>
              </select>
            </div>
            <button onClick={handleLocationSearch} className={kartingCommon.searchButton}>Buscar</button>
          </div>

          <LocationMap sport="karting" latitude={-38.7359} longitude={-72.5904} address="Temuco, Chile" zoom={13} height="400px" />
          <div className={kartingCommon.mapActions}><button className={kartingCommon.helpButton}>❓ Ayuda</button></div>
        </div>
      </div>
    </div>
  );
}