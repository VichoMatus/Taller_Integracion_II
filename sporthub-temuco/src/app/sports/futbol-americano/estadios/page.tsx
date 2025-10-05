'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/futbol-americano/canchas/Estadio1.png",
    name: "Estadio Azteca - Principal",
    address: "Zona Centro",
    rating: 4.8,
    reviews: "245 reseñas",
    tags: ["Estadio Profesional", "Gradas", "Vestuarios", "Iluminación Nocturna"],
    description: "Estadio profesional para fútbol americano con medidas oficiales y equipamiento completo",
    price: "85",
    nextAvailable: "19:00-21:00", 
  },
  {
    imageUrl: "/sports/futbol-americano/canchas/Estadio2.png",
    name: "Campo Universitario - Norte",
    address: "Zona Norte",
    rating: 4.4,
    reviews: "112 reseñas",
    tags: ["Campo Universitario", "Gradas", "Vestuarios"],
    description: "Campo universitario ideal para prácticas y partidos amateur con césped natural",
    price: "65",
    nextAvailable: "15:00-17:00", 
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
        cancha.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCanchas(filtered);
    }
  };

  const handleBackToFootball = () => {
    router.push('/sports/futbol-americano');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar para fútbol americano */}
      <Sidebar userRole="usuario" sport="futbol-americano" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏈</div>
            <h1 className={styles.headerTitle}>Fútbol Americano</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del estadio"
              sport="futbol-americano" 
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
            onClick={handleBackToFootball}
          >
            <span>←</span>
            <span>Fútbol Americano</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar estadios</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#002147'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#002147'}}>📅</span>
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
                <span style={{color: '#002147'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#002147'}}>📏</span>
                <span>Tipo de superficie</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de superficie</option>
                <option>Césped natural</option>
                <option>Césped sintético</option>
                <option>Turf profesional</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar</span>
            </button>
          </div>
        </div>

        {/* Mostrar mensaje si no hay resultados */}
        {filteredCanchas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron resultados para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todos los estadios
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredCanchas.map((cancha, idx) => (
              <CourtCard key={idx} {...cancha} sport="futbol-americano"/>
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Estadios Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}