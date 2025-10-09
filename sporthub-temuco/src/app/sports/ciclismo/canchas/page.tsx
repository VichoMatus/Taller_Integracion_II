'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const rutas = [
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta1.png",
    name: "Ciclismo - Sendero Bosque",
    address: "Parque Nacional, Zona Norte",
    rating: 4.7,
    tags: ["Sendero natural", "Dificultad media", "Paisajes", "Estacionamiento"],
    description: "Ruta de ciclismo de montaña con senderos naturales y vistas panorámicas",
    price: "15",
    nextAvailable: "08:00-09:00", 
  },
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta2.png",
    name: "Ciclismo - Ruta Urbana",
    address: "Centro Ciudad",
    rating: 4.4,
    tags: ["Ciclovía urbana", "Fácil acceso", "Iluminación"],
    description: "Ciclovía urbana segura con conexiones a puntos de interés de la ciudad",
    price: "8",
    nextAvailable: "16:00-17:00", 
  },
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta3.png",
    name: "Ciclismo - Sendero Lago",
    address: "Orilla del Lago",
    rating: 4.8,
    tags: ["Vista al lago", "Dificultad alta", "Naturaleza", "Área de descanso"],
    description: "Ruta desafiante con hermosas vistas al lago y áreas de descanso",
    price: "20",
    nextAvailable: "10:30-11:30", 
  },
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta4.png",
    name: "Ciclismo - Ruta Cordillera",
    address: "Zona Montañosa",
    rating: 4.9,
    tags: ["Alta montaña", "Dificultad extrema", "Aventura", "Guía incluida"],
    description: "Ruta de alta montaña para ciclistas experimentados con guía profesional",
    price: "35",
    nextAvailable: "06:00-07:00", 
  },
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta1.png",
    name: "Ciclismo - Ruta Valle",
    address: "Valle Central",
    rating: 4.5,
    tags: ["Sendero intermedio", "Paisajes", "Estacionamiento", "Cafetería"],
    description: "Ruta de ciclismo por el valle con paradas estratégicas y servicios",
    price: "12",
    nextAvailable: "12:00-13:00",
  },
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta2.png",
    name: "Ciclismo - Ruta Costera",
    address: "Borde Costero",
    rating: 4.6,
    tags: ["Vista al mar", "Brisa marina", "Dificultad media", "Cafeterías"],
    description: "Hermosa ruta costera con paradas en cafeterías locales",
    price: "18",
    nextAvailable: "09:30-10:30", 
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

  const handleBackToCiclismo = () => {
    router.push('/sports/ciclismo');
  };

  const availableNow = filteredRutas.filter(ruta => 
    ruta.nextAvailable !== "No disponible hoy" && 
    !ruta.nextAvailable.includes("Mañana")
  ).length;

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}></div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta"
              sport="ciclismo"
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
            onClick={handleBackToCiclismo}
          >
            <span>←</span>
            <span>Ciclismo</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas de ciclismo</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#16a34a'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Valle, Montaña..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#16a34a'}}>📅</span>
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
                <span style={{color: '#22c55e'}}>💰</span>
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
                <span style={{color: '#15803d'}}>🚴</span>
                <span>Tipo de ruta</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de ruta</option>
                <option>Sendero natural</option>
                <option>Ciclovía urbana</option>
                <option>Ruta de montaña</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar rutas</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredRutas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron rutas de ciclismo para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas de ciclismo
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredRutas.map((ruta, idx) => (
              <CourtCard
                key={idx}
                {...ruta}
                sport="ciclismo"
              />
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}
