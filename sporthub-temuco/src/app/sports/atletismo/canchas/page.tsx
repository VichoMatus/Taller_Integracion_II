'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/atletismo/canchas/Cancha1.png",
    name: "Atletismo - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    tags: ["Pista al aire libre", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Pista de atletismo ubicada en el centro con áreas para salto y lanzamiento",
    price: "21",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha2.png",
    name: "Atletismo - Norte",
    address: "Sector Norte",
    rating: 4.5,
    tags: ["Pista al aire libre", "Estacionamiento"],
    description: "Pista de atletismo con cronometraje y carriles reglamentarios",
    price: "19",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha1.png",
    name: "Atletismo - Sur",
    address: "Sector Sur",
    rating: 4.8,
    tags: ["Pista techada", "Vestuarios", "Entrenadores", "Áreas de salto"],
    description: "Pista de atletismo con instalaciones completas y zona de entrenamiento",
    price: "23",
    nextAvailable: "10:30-11:30",
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha2.png",
    name: "Atletismo - Premium",
    address: "Centro Premium", 
    rating: 4.7,
    tags: ["Pista Profesional", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Pista de atletismo profesional con equipos de cronometraje electrónico",
    price: "28",
    nextAvailable: "No disponible hoy",
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha1.png",
    name: "Atletismo - Elite",
    address: "Zona Elite",
    rating: 4.4,
    tags: ["Pista Profesional", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Pista de atletismo de élite con áreas especializadas para cada disciplina",
    price: "32",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha2.png",
    name: "Atletismo - Oeste",
    address: "Sector Oeste",
    rating: 4.2,
    tags: ["Pista al aire libre", "Estacionamiento", "Iluminación"],
    description: "Pista de atletismo ubicada en el sector oeste con implementos básicos",
    price: "20",
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

  const handleBackToAtletismo = () => {
    router.push('/sports/atletismo');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏃</div>
            <h1 className={styles.headerTitle}>Atletismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="atletismo"
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>Usuario</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button
            className={styles.breadcrumbButton}
            onClick={handleBackToAtletismo}
          >
            <span>←</span>
            <span>Atletismo</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de atletismo</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#3b82f6'}}>📍</span>
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
                min="0"
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#1e40af'}}>🏃</span>
                <span>Tipo de pista</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pista</option>
                <option>Pista al aire libre</option>
                <option>Pista techada</option>
                <option>Pista profesional</option>
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

        {/* Mensaje de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron pistas de atletismo para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las pistas de atletismo
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
                sport="atletismo"
              />
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}
