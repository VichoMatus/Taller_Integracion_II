'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const rutas = [
  {
    imageUrl: "/sports/enduro/rutas/ruta1.png",
    name: "Ruta Montaña Extremo",
    address: "Cordillera Central",
    rating: 4.8,
    tags: ["Dificultad Alta", "Terreno Rocoso", "Vistas Panorámicas", "Guía Incluido"],
    description: "Ruta desafiante para expertos con terrenos rocosos y descensos técnicos. Incluye guía certificado.",
    price: "35",
    nextAvailable: "Mañana 08:00-12:00", 
  },
  {
    imageUrl: "/sports/enduro/rutas/ruta2.png",
    name: "Sendero Bosque Verde",
    address: "Reserva Natural",
    rating: 4.5,
    tags: ["Dificultad Media", "Bosque", "Ríos", "Familiar"],
    description: "Ruta intermedia a través de bosques nativos con cruces de ríos y paisajes espectaculares.",
    price: "28",
    nextAvailable: "Hoy 14:00-17:00", 
  },
  {
    imageUrl: "/path/to/enduro-route3.jpg",
    name: "Circuito Técnico",
    address: "Parque de Aventura",
    rating: 4.6,
    tags: ["Dificultad Alta", "Técnico", "Saltos", "Competencia"],
    description: "Circuito diseñado para entrenamiento técnico con saltos y obstáculos desafiantes.",
    price: "32",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/path/to/enduro-route4.jpg",
    name: "Trail Iniciación",
    address: "Centro de Enduro", 
    rating: 4.3,
    tags: ["Dificultad Baja", "Aprendizaje", "Equipo Incluido", "Instructor"],
    description: "Perfecta para principiantes. Incluye equipo completo y instructor especializado.",
    price: "40",
    nextAvailable: "Mañana 10:00-13:00",
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
        ruta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRutas(filtered);
    }
  };

  const handleBackToEnduro = () => {
    router.push('/sports/enduro');
  };

  const availableNow = filteredRutas.filter(ruta => 
    ruta.nextAvailable === "Disponible ahora" || 
    ruta.nextAvailable.includes("Hoy")
  ).length;

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="enduro" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏍️</div>
            <h1 className={styles.headerTitle}>Enduro</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="enduro" 
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb con navegación */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToEnduro}
          >
            <span>←</span>
            <span>Volver a Enduro</span>
          </button>
        </div>

        {/* Filtros para Enduro */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4B5320'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Montaña, valle, reserva..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4B5320'}}>📅</span>
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
                <span style={{color: '#6B6D4A'}}>💰</span>
                <span>Precio (max $ruta)</span>
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
                <span style={{color: '#8B8C5A'}}>📏</span>
                <span>Dificultad</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Nivel de dificultad</option>
                <option>Baja (Principiante)</option>
                <option>Media (Intermedio)</option>
                <option>Alta (Avanzado)</option>
                <option>Extrema (Experto)</option>
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
        {filteredRutas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron resultados para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredRutas.map((ruta, idx) => (
              <CourtCard key={idx} {...ruta} sport="enduro"/>
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Rutas Disponibles hoy: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}