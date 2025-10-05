'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';


const canchas = [
  {
    imageUrl: "/sports/tenis/canchas/Cancha1.png",
    name: "Tenis - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.8,
    reviews: "215 reseñas",
    tags: ["Cancha de Arcilla", "Estacionamiento", "Iluminación LED", "Vestuarios"],
    description: "Cancha de tenis profesional con superficie de arcilla ubicada en el centro con raquetas y pelotas incluidas",
    price: "45",
    nextAvailable: "19:00-20:30", 
  },
  {
    imageUrl: "/sports/tenis/canchas/Cancha2.png",
    name: "Tenis - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "132 reseñas",
    tags: ["Cancha Dura", "Estacionamiento", "Climatizada"],
    description: "Cancha de tenis premium con superficie dura de última generación ubicada en el sector norte",
    price: "38",
    nextAvailable: "15:00-16:30", 
  },
  {
    imageUrl: "/sports/tenis/canchas/Cancha3.png",
    name: "Tenis - Sur",
    address: "Sector Sur",
    rating: 4.3,
    reviews: "98 reseñas",
    tags: ["Cancha Césped", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de tenis de césped ubicada en el sur, ideal para jugar en cualquier clima",
    price: "42",
    nextAvailable: "Mañana 10:00-11:30",
  },
  {
    imageUrl: "/sports/tenis/canchas/Cancha4.png",
    name: "Tenis Premium",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "187 reseñas",
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación LED", "Bar"],
    description: "Cancha de tenis profesional con estándar internacional y todas las comodidades VIP",
    price: "55",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/tenis/canchas/Cancha5.png",
    name: "Tenis - Elite",
    address: "Zona Elite",
    rating: 4.7,
    reviews: "256 reseñas",
    tags: ["Cancha Internacional", "Estacionamiento", "Climatizada", "Spa"],
    description: "Cancha de tenis de élite con superficie sintética de competición y servicios exclusivos",
    price: "60",
    nextAvailable: "17:30-19:00",
  },
  {
    imageUrl: "/sports/tenis/canchas/Cancha6.png",
    name: "Tenis - Club",
    address: "Club Deportivo",
    rating: 4.6,
    reviews: "145 reseñas",
    tags: ["Cancha de Club", "Estacionamiento", "Iluminación", "Torneos"],
    description: "Cancha de tenis en club deportivo con torneos regulares y ambiente competitivo",
    price: "48",
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

  const handleBackToTenis = () => {
    router.push('/sports/tenis');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      {/* 🔥 Sidebar específico para tenis */}
      <Sidebar userRole="usuario" sport="tenis" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
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
              placeholder="Nombre de la cancha de tenis"
              sport="tenis" 
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
            onClick={handleBackToTenis}
          >
            <span>←</span>
            <span>Tenis</span>
          </button>
        </div>

        {/* Filtros específicos para tenis */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de tenis</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#3b82f6'}}>📍</span>
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
                <span style={{color: '#3b82f6'}}>📅</span>
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
                <span style={{color: '#2563eb'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="30"
                max="80"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#22c55e'}}>🏟️</span>
                <span>Tipo de superficie</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de superficie</option>
                <option>Arcilla</option>
                <option>Césped</option>
                <option>Dura</option>
                <option>Sintética</option>
                <option>Premium</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar canchas</span>
            </button>
          </div>
        </div>

        {/* Mostrar mensaje si no hay resultados */}
        {filteredCanchas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron canchas de tenis para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas de tenis</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de tenis
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
                sport="tenis" // 🔥 ESPECIFICAR DEPORTE TENIS
              />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Canchas de Tenis Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}