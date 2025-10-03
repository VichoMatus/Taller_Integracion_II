'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/futbol/canchas/Cancha1.png",
    name: "Fútbol - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Cancha de Césped", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de fútbol con césped sintético ubicada en el centro con implementos deportivos (Balones, conos y petos)",
    price: "25",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha2.png",
    name: "Fútbol - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Cancha Sintética", "Estacionamiento"],
    description: "Cancha de fútbol con césped sintético ubicada en el norte con implementos deportivos (Balones, conos y petos)",
    price: "22",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha3.png",
    name: "Fútbol - Sur",
    address: "Sector Sur",
    rating: 4.1,
    reviews: "67 reseñas",
    tags: ["Cancha Natural", "Estacionamiento", "Iluminación"],
    description: "Cancha de fútbol con césped natural ubicada en el sur con implementos deportivos (Balones, conos y petos)",
    price: "28",
    nextAvailable: "Mañana 09:00-10:00",
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha4.png",
    name: "Fútbol - Premium",
    address: "Centro Premium", 
    rating: 4.7,
    reviews: "142 reseñas",
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de fútbol profesional con césped híbrido ubicada en el centro premium con todos los implementos",
    price: "35",
    nextAvailable: "No disponible hoy",
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha5.png",
    name: "Fútbol - Elite",
    address: "Zona Elite",
    rating: 4.4,
    reviews: "203 reseñas",
    tags: ["Cancha Profesional", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Cancha de fútbol de élite con césped natural ubicada en zona exclusiva con vestuarios completos",
    price: "40",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/sports/futbol/canchas/Cancha6.png",
    name: "Fútbol - Oeste",
    address: "Sector Oeste",
    rating: 4.2,
    reviews: "158 reseñas",
    tags: ["Cancha Sintética", "Estacionamiento", "Iluminación"],
    description: "Cancha de fútbol sintética ubicada en el sector oeste con implementos básicos disponibles",
    price: "24",
    nextAvailable: "16:00-17:00",
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

  const handleBackToFootball = () => {
    router.push('/sports/futbol');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      {/* 🔥 Sidebar específico para fútbol */}
      <Sidebar userRole="usuario" sport="futbol" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>Canchas de Fútbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha"
              sport="futbol" 
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
            <span>Fútbol</span>
          </button>
        </div>

        {/* Filtros específicos para fútbol */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de fútbol</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#22c55e'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Oeste..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#22c55e'}}>📅</span>
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
                <span style={{color: '#16a34a'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#15803d'}}>🌱</span>
                <span>Tipo de césped</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de césped</option>
                <option>Césped natural</option>
                <option>Césped sintético</option>
                <option>Césped híbrido</option>
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
            <h3>No se encontraron canchas de fútbol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de fútbol
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
                sport="futbol" // 🔥 ESPECIFICAR DEPORTE
              />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Canchas de Fútbol Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}