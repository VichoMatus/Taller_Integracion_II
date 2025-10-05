'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/rugby/canchas/Cancha1.png",
    name: "Rugby - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Campo Abierto", "Estacionamiento", "Iluminación", "Vestuarios"],
    description: "Campo de rugby ubicado en el centro con vestuarios y equipamiento profesional",
    price: "45",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/rugby/canchas/Cancha2.png",
    name: "Rugby - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Campo Abierto", "Estacionamiento", "Vestuarios"],
    description: "Campo de rugby con excelente mantenimiento y áreas de entrenamiento",
    price: "42",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/rugby-field3.jpg",
    name: "Rugby - Sur",
    address: "Sector Sur",
    rating: 4.1,
    reviews: "67 reseñas",
    tags: ["Campo Abierto", "Estacionamiento", "Iluminación"],
    description: "Campo profesional de rugby con medidas reglamentarias",
    price: "48",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/path/to/rugby-field4.jpg",
    name: "Rugby - Premium",
    address: "Centro Premium", 
    rating: 4.7,
    reviews: "142 reseñas",
    tags: ["Campo Abierto", "Estacionamiento", "Iluminación", "Vestuarios"],
    description: "Campo premium para rugby con todas las comodidades profesionales",
    price: "52",
    nextAvailable: "No disponible hoy",
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

  const handleBackToRugby = () => {
    router.push('/sports/rugby');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="rugby" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏉</div>
            <h1 className={styles.headerTitle}>Rugby</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Nombre del campo"
            sport="rugby" 
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
            onClick={handleBackToRugby}
          >
            <span>←</span>
            <span>Rugby</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar campos</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#722F37'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#722F37'}}>📅</span>
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
                <span style={{color: '#722F37'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#722F37'}}>📏</span>
                <span>Superficie</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de superficie</option>
                <option>Césped natural</option>
                <option>Césped sintético</option>
                <option>Tierra batida</option>
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
              Ver todos los campos
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredCanchas.map((cancha, idx) => (
              <CourtCard key={idx} {...cancha} sport="rugby" />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Campos Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}