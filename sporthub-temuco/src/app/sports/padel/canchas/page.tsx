'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/padel/canchas/Cancha1.png",
    name: "Padel - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.6,
    reviews: "185 reseñas",
    tags: ["Cancha de Cristal", "Estacionamiento", "Iluminación LED", "Vestuarios"],
    description: "Cancha de padel profesional con paredes de cristal ubicada en el centro con raquetas y pelotas incluidas",
    price: "32",
    nextAvailable: "19:00-20:30", 
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha2.png",
    name: "Padel - Norte",
    address: "Sector Norte",
    rating: 4.4,
    reviews: "92 reseñas",
    tags: ["Cancha Premium", "Estacionamiento", "Climatizada"],
    description: "Cancha de padel premium con superficie de última generación ubicada en el sector norte",
    price: "28",
    nextAvailable: "15:00-16:30", 
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha3.png",
    name: "Padel - Sur",
    address: "Sector Sur",
    rating: 4.2,
    reviews: "74 reseñas",
    tags: ["Cancha Techada", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de padel techada ubicada en el sur, ideal para jugar en cualquier clima",
    price: "30",
    nextAvailable: "Mañana 10:00-11:30",
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha4.png",
    name: "Padel Premium",
    address: "Centro Premium", 
    rating: 4.8,
    reviews: "156 reseñas",
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación LED", "Bar"],
    description: "Cancha de padel profesional con estándar internacional y todas las comodidades VIP",
    price: "45",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha5.png",
    name: "Padel - Elite",
    address: "Zona Elite",
    rating: 4.7,
    reviews: "221 reseñas",
    tags: ["Cancha Internacional", "Estacionamiento", "Climatizada", "Spa"],
    description: "Cancha de padel de élite con superficie sintética de competición y servicios exclusivos",
    price: "50",
    nextAvailable: "17:30-19:00",
  },
  {
    imageUrl: "/sports/padel/canchas/Cancha6.png",
    name: "Padel - Club",
    address: "Club Deportivo",
    rating: 4.5,
    reviews: "118 reseñas",
    tags: ["Cancha de Club", "Estacionamiento", "Iluminación", "Torneos"],
    description: "Cancha de padel en club deportivo con torneos regulares y ambiente competitivo",
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

  const handleBackToPadel = () => {
    router.push('/sports/padel');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      {/* 🔥 Sidebar específico para padel */}
      <Sidebar userRole="usuario" sport="padel" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🎾</div>
            <h1 className={styles.headerTitle}>Canchas de Padel</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha de padel"
              sport="padel" 
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
            onClick={handleBackToPadel}
          >
            <span>←</span>
            <span>Padel</span>
          </button>
        </div>

        {/* Filtros específicos para padel */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de padel</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#7E60BF'}}>📍</span>
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
                <span style={{color: '#7E60BF'}}>📅</span>
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
                <span style={{color: '#433878'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="20"
                max="60"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#E4B1F0'}}>🏟️</span>
                <span>Tipo de cancha</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de cancha</option>
                <option>Cancha de Cristal</option>
                <option>Cancha Techada</option>
                <option>Cancha Climatizada</option>
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
            <h3>No se encontraron canchas de padel para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas de padel</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de padel
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
                sport="padel" // 🔥 ESPECIFICAR DEPORTE PADEL
              />
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}