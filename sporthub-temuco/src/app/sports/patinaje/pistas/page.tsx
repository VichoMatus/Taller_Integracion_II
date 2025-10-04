'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/patinaje/canchas/Pista1.png",
    name: "Patinaje - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.7,
    reviews: "198 reseñas",
    tags: ["Pista Cubierta", "Estacionamiento", "Iluminación LED", "Vestuarios"],
    description: "Pista de patinaje profesional con superficie de resina ubicada en el centro con patines y protecciones incluidas",
    price: "28",
    nextAvailable: "19:00-20:30", 
  },
  {
    imageUrl: "/sports/patinaje/canchas/Pista2.png",
    name: "Patinaje - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "112 reseñas",
    tags: ["Pista Exterior", "Estacionamiento", "Climatizada"],
    description: "Pista de patinaje premium con superficie de última generación ubicada en el sector norte",
    price: "25",
    nextAvailable: "15:00-16:30", 
  },
  {
    imageUrl: "/sports/patinaje/canchas/Pista3.png",
    name: "Patinaje - Sur",
    address: "Sector Sur",
    rating: 4.4,
    reviews: "87 reseñas",
    tags: ["Pista Techada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Pista de patinaje techada ubicada en el sur, ideal para patinar en cualquier clima",
    price: "26",
    nextAvailable: "Mañana 10:00-11:30",
  },
  {
    imageUrl: "/sports/patinaje/canchas/Pista4.png",
    name: "Patinaje Premium",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "176 reseñas",
    tags: ["Pista Profesional", "Estacionamiento", "Iluminación LED", "Bar"],
    description: "Pista de patinaje profesional con estándar internacional y todas las comodidades VIP",
    price: "35",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/patinaje/canchas/Pista5.png",
    name: "Patinaje - Elite",
    address: "Zona Elite",
    rating: 4.8,
    reviews: "234 reseñas",
    tags: ["Pista Internacional", "Estacionamiento", "Climatizada", "Spa"],
    description: "Pista de patinaje de élite con superficie de competición y servicios exclusivos",
    price: "40",
    nextAvailable: "17:30-19:00",
  },
  {
    imageUrl: "/sports/patinaje/canchas/Pista6.png",
    name: "Patinaje - Club",
    address: "Club Deportivo",
    rating: 4.6,
    reviews: "134 reseñas",
    tags: ["Pista de Club", "Estacionamiento", "Iluminación", "Torneos"],
    description: "Pista de patinaje en club deportivo con torneos regulares y ambiente competitivo",
    price: "30",
    nextAvailable: "16:00-17:30",
  }
];

export default function Page() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCanchas, setFilteredCanchas] = useState(canchas);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredCanchas(canchas);
    } else {
      const filtered = canchas.filter(cancha =>
        cancha.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancha.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCanchas(filtered);
    }
  };

  const handleBackToPatinaje = () => {
    router.push('/sports/patinaje');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      {/* 🔥 Sidebar específico para patinaje */}
      <Sidebar userRole="usuario" sport="patinaje" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⛸️</div>
            <h1 className={styles.headerTitle}>Pistas de Patinaje</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista de patinaje"
              sport="patinaje" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>Usuario</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb con navegación */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToPatinaje}
          >
            <span>←</span>
            <span>Patinaje</span>
          </button>
        </div>

        {/* Filtros específicos para patinaje */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de patinaje</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#06b6d4'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Club..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#06b6d4'}}>📅</span>
                <span>Fecha</span>
              </label>
              <input
                type="text"
                placeholder="dd - mm - aaaa"
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#0d9488'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="20"
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#0f766e'}}>🏟️</span>
                <span>Tipo de pista</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pista</option>
                <option>Pista Cubierta</option>
                <option>Pista Exterior</option>
                <option>Pista Techada</option>
                <option>Pista Profesional</option>
                <option>Pista Premium</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar pistas</span>
            </button>
          </div>
        </div>

        {/* Mostrar mensaje si no hay resultados */}
        {filteredCanchas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron pistas de patinaje para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas de patinaje</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las pistas de patinaje
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredCanchas.map((cancha, idx) => (
              <CourtCard 
                key={idx} 
                {...cancha} 
                sport="patinaje" // 🔥 ESPECIFICAR DEPORTE PATINAJE
              />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Pistas de Patinaje Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}