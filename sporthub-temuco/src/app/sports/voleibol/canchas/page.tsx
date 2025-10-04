'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/voleibol/canchas/Cancha1.png",
    name: "Voleibol - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.7,
    reviews: "189 reseñas",
    tags: ["Cancha Indoor", "Estacionamiento", "Iluminación LED", "Vestuarios"],
    description: "Cancha de voleibol profesional con superficie de madera ubicada en el centro con balones y redes incluidas",
    price: "30",
    nextAvailable: "19:00-20:30", 
  },
  {
    imageUrl: "/sports/voleibol/canchas/Cancha2.png",
    name: "Voleibol - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "124 reseñas",
    tags: ["Cancha Exterior", "Estacionamiento", "Climatizada"],
    description: "Cancha de voleibol premium con superficie sintética de última generación ubicada en el sector norte",
    price: "28",
    nextAvailable: "15:00-16:30", 
  },
  {
    imageUrl: "/sports/voleibol/canchas/Cancha3.png",
    name: "Voleibol - Sur",
    address: "Sector Sur",
    rating: 4.4,
    reviews: "98 reseñas",
    tags: ["Cancha Techada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de voleibol techada ubicada en el sur, ideal para jugar en cualquier clima",
    price: "32",
    nextAvailable: "Mañana 10:00-11:30",
  },
  {
    imageUrl: "/sports/voleibol/canchas/Cancha4.png",
    name: "Voleibol Premium",
    address: "Centro Premium", 
    rating: 4.8,
    reviews: "167 reseñas",
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación LED", "Bar"],
    description: "Cancha de voleibol profesional con estándar internacional y todas las comodidades VIP",
    price: "40",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/voleibol/canchas/Cancha5.png",
    name: "Voleibol - Elite",
    address: "Zona Elite",
    rating: 4.6,
    reviews: "213 reseñas",
    tags: ["Cancha Internacional", "Estacionamiento", "Climatizada", "Spa"],
    description: "Cancha de voleibol de élite con superficie de competición y servicios exclusivos",
    price: "45",
    nextAvailable: "17:30-19:00",
  },
  {
    imageUrl: "/sports/voleibol/canchas/Cancha6.png",
    name: "Voleibol - Club",
    address: "Club Deportivo",
    rating: 4.5,
    reviews: "145 reseñas",
    tags: ["Cancha de Club", "Estacionamiento", "Iluminación", "Torneos"],
    description: "Cancha de voleibol en club deportivo con torneos regulares y ambiente competitivo",
    price: "35",
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

  const handleBackToVoleibol = () => {
    router.push('/sports/voleibol');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      {/* 🔥 Sidebar específico para voleibol */}
      <Sidebar userRole="usuario" sport="voleibol" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏐</div>
            <h1 className={styles.headerTitle}>Canchas de Voleibol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha de voleibol"
              sport="voleibol" 
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
            onClick={handleBackToVoleibol}
          >
            <span>←</span>
            <span>Voleibol</span>
          </button>
        </div>

        {/* Filtros específicos para voleibol */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de voleibol</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#42A5F5'}}>📍</span>
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
                <span style={{color: '#42A5F5'}}>📅</span>
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
                <span style={{color: '#1976D2'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="25"
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#9ca3af'}}>🏟️</span>
                <span>Tipo de cancha</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de cancha</option>
                <option>Cancha Indoor</option>
                <option>Cancha Exterior</option>
                <option>Cancha Techada</option>
                <option>Cancha Profesional</option>
                <option>Cancha Premium</option>
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
            <h3>No se encontraron canchas de voleibol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas de voleibol</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de voleibol
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
                sport="voleibol" // 🔥 ESPECIFICAR DEPORTE VOLEIBOL
              />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Canchas de Voleibol Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}