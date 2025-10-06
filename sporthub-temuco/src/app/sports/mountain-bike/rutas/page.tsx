'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const rutas = [
  {
    imageUrl: "/sports/mountainbike/rutas/Ruta1.png",
    name: "Ruta Montañosa - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Dificultad Media", "Estacionamiento", "Iluminación", "Área Descanso"],
    description: "Ruta para mountain bike ubicada en zona montañosa con paisajes espectaculares y diversos terrenos",
    price: "21",
    nextAvailable: "20:00-21:00", 
  },
  {
    imageUrl: "/sports/mountainbike/rutas/Ruta2.png",
    name: "Ruta Bosque - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Dificultad Alta", "Estacionamiento"],
    description: "Ruta técnica a través del bosque con descensos desafiantes y subidas exigentes",
    price: "19",
    nextAvailable: "14:30-15:30", 
  },
  {
    imageUrl: "/path/to/mountainbike-route3.jpg",
    name: "Ruta Valle - Sur",
    address: "Sector Sur",
    rating: 4.1,
    reviews: "67 reseñas",
    tags: ["Dificultad Baja", "Estacionamiento", "Iluminación"],
    description: "Ruta ideal para principiantes con terreno estable y vistas panorámicas del valle",
    price: "23",
    nextAvailable: "Mañana 09:00-10:00",
  }
];

export default function Page() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRutas, setFilteredRutas] = useState(rutas);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredRutas(rutas);
    } else {
      const filtered = rutas.filter(ruta =>
        ruta.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRutas(filtered);
    }
  };

  const handleBackToMountainBike = () => {
    router.push('/sports/mountain-bike');
  };

  const availableNow = filteredRutas.filter(ruta => 
    ruta.nextAvailable !== "No disponible hoy" && 
    !ruta.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="mountain-bike" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚵‍♂️</div>
            <h1 className={styles.headerTitle}>Mountain Bike</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Nombre de la ruta"
            sport = "mountain-bike" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>Usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToMountainBike}
          >
            <span>←</span>
            <span>Mountain Bike</span>
          </button>
        </div>

        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4E342E'}}>📍</span>
                <span>Ubicación o sector</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4E342E'}}>📅</span>
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
                <span style={{color: '#4E342E'}}>💰</span>
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
                <span style={{color: '#4E342E'}}>📏</span>
                <span>Dificultad</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Nivel de dificultad</option>
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
                <option>Experto</option>
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

        {filteredRutas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron resultados para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas
            </button>
          </div>
        )}

        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredRutas.map((ruta, idx) => (
              <CourtCard key={idx} {...ruta} sport='mountain-bike'/>
            ))}
          </div>
          
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Rutas Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}