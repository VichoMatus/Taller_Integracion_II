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
    imageUrl: "/sports/ciclismo/rutas/Ruta5.png",
    name: "Ciclismo - Sendero Familiar",
    address: "Parque Recreativo",
    rating: 4.3,
    tags: ["Familiar", "Dificultad baja", "Área de picnic", "Alquiler bicicletas"],
    description: "Ruta familiar ideal para principiantes con servicios de alquiler",
    price: "10",
    nextAvailable: "14:00-15:00", 
  },
  {
    imageUrl: "/sports/ciclismo/rutas/Ruta6.png",
    name: "Ciclismo - Ruta Costera",
    address: "Borde Costero",
    rating: 4.6,
    tags: ["Vista al mar", "Brisa marina", "Dificultad media", "Cafeterías"],
    description: "Hermosa ruta costera con paradas en cafeterías locales",
    price: "18",
    nextAvailable: "09:30-10:30", 
  }
];

export default function CiclismoCanchasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRutas, setFilteredRutas] = useState(rutas);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    const filtered = rutas.filter(ruta =>
      ruta.name.toLowerCase().includes(term.toLowerCase()) ||
      ruta.address.toLowerCase().includes(term.toLowerCase()) ||
      ruta.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredRutas(filtered);
  };

  const handleSearch = () => {
    console.log('Buscando:', searchTerm);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    let filtered = rutas;
    
    switch (filter) {
      case 'facil':
        filtered = rutas.filter(ruta => 
          ruta.tags.some(tag => tag.toLowerCase().includes('fácil') || tag.toLowerCase().includes('baja'))
        );
        break;
      case 'medio':
        filtered = rutas.filter(ruta => 
          ruta.tags.some(tag => tag.toLowerCase().includes('media'))
        );
        break;
      case 'dificil':
        filtered = rutas.filter(ruta => 
          ruta.tags.some(tag => tag.toLowerCase().includes('alta') || tag.toLowerCase().includes('extrema'))
        );
        break;
      case 'urbano':
        filtered = rutas.filter(ruta => 
          ruta.tags.some(tag => tag.toLowerCase().includes('urbana'))
        );
        break;
      case 'natural':
        filtered = rutas.filter(ruta => 
          ruta.tags.some(tag => 
            tag.toLowerCase().includes('natural') || 
            tag.toLowerCase().includes('sendero') ||
            tag.toLowerCase().includes('montaña')
          )
        );
        break;
      default:
        filtered = rutas;
    }
    
    if (searchTerm) {
      filtered = filtered.filter(ruta =>
        ruta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredRutas(filtered);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    
    const sorted = [...filteredRutas].sort((a, b) => {
      switch (sort) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return parseInt(a.price) - parseInt(b.price);
        case 'price-high':
          return parseInt(b.price) - parseInt(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    setFilteredRutas(sorted);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="ciclismo" />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚴‍♂️</div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="ciclismo"
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Dificultad:</label>
            <div className={styles.filterButtons}>
              {[
                { value: 'all', label: 'Todas' },
                { value: 'facil', label: 'Fácil' },
                { value: 'medio', label: 'Medio' },
                { value: 'dificil', label: 'Difícil' }
              ].map(filter => (
                <button
                  key={filter.value}
                  className={`${styles.filterButton} ${selectedFilter === filter.value ? styles.active : ''}`}
                  onClick={() => handleFilterChange(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tipo:</label>
            <div className={styles.filterButtons}>
              {[
                { value: 'urbano', label: 'Urbano' },
                { value: 'natural', label: 'Natural' }
              ].map(filter => (
                <button
                  key={filter.value}
                  className={`${styles.filterButton} ${selectedFilter === filter.value ? styles.active : ''}`}
                  onClick={() => handleFilterChange(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sortGroup}>
            <label className={styles.filterLabel}>Ordenar por:</label>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="rating">Mejor valoradas</option>
              <option value="price-low">Precio: Menor a mayor</option>
              <option value="price-high">Precio: Mayor a menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        <div className={styles.resultsInfo}>
          <h3 className={styles.resultsTitle}>
            {filteredRutas.length} rutas encontradas
          </h3>
          <p className={styles.resultsSubtitle}>
            Descubre las mejores rutas de ciclismo en Temuco
          </p>
        </div>

        <div className={styles.rutasGrid}>
          {filteredRutas.map((ruta, index) => (
            <CourtCard
              key={index}
              {...ruta}
              sport="ciclismo"
              onClick={() => router.push('/sports/ciclismo/canchas/canchaseleccionada')}
            />
          ))}
        </div>

        {filteredRutas.length === 0 && (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No se encontraron rutas</h3>
            <p>Intenta ajustar los filtros o términos de búsqueda</p>
            <button 
              className={styles.clearFiltersButton}
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
                setFilteredRutas(rutas);
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}