'use client';

import { useState } from 'react';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './canchas.module.css';

// Datos mock de todas las pistas de karting
const allTracks = [
  {
    id: 1,
    name: "Kartódromo Speedway Temuco",
    location: "Sector Industrial, Temuco",
    rating: 4.8,
    price: "$15.000",
    image: "/imagenes/sports/karting/karting1.jpg",
    distance: "2.5 km",
    features: ["Pista Techada", "Karts Eléctricos", "Cronometraje Digital"],
    difficulty: "Intermedio",
    trackType: "Indoor",
    duration: "10 min",
    maxSpeed: "45 km/h"
  },
  {
    id: 2,
    name: "Circuit Racing Park",
    location: "Labranza, Temuco",
    rating: 4.6,
    price: "$12.000",
    image: "/imagenes/sports/karting/karting2.jpg",
    distance: "3.2 km",
    features: ["Pista Outdoor", "Karts de Competición", "Área VIP"],
    difficulty: "Avanzado",
    trackType: "Outdoor",
    duration: "15 min",
    maxSpeed: "60 km/h"
  },
  {
    id: 3,
    name: "Thunder Kart Arena",
    location: "Pedro de Valdivia, Temuco",
    rating: 4.9,
    price: "$18.000",
    image: "/imagenes/sports/karting/karting3.jpg",
    distance: "1.8 km",
    features: ["Pista Nocturna", "Simuladores", "Escuela de Karting"],
    difficulty: "Principiante",
    trackType: "Mixed",
    duration: "12 min",
    maxSpeed: "40 km/h"
  },
  {
    id: 4,
    name: "Velocity Karting Center",
    location: "Av. Alemania, Temuco",
    rating: 4.5,
    price: "$14.000",
    image: "/imagenes/sports/karting/karting4.jpg",
    distance: "3.8 km",
    features: ["Pista Cubierta", "Karts Infantiles", "Caféteria"],
    difficulty: "Principiante",
    trackType: "Indoor",
    duration: "8 min",
    maxSpeed: "35 km/h"
  },
  {
    id: 5,
    name: "Extreme Racing Track",
    location: "Camino a Vilcún, Temuco",
    rating: 4.7,
    price: "$20.000",
    image: "/imagenes/sports/karting/karting5.jpg",
    distance: "4.2 km",
    features: ["Pista Profesional", "Timing System", "Boxes"],
    difficulty: "Avanzado",
    trackType: "Outdoor",
    duration: "20 min",
    maxSpeed: "70 km/h"
  },
  {
    id: 6,
    name: "Family Kart Fun",
    location: "Mall Mirage, Temuco",
    rating: 4.3,
    price: "$10.000",
    image: "/imagenes/sports/karting/karting6.jpg",
    distance: "1.2 km",
    features: ["Pista Familiar", "Karts Seguros", "Entretenimiento"],
    difficulty: "Principiante",
    trackType: "Indoor",
    duration: "6 min",
    maxSpeed: "25 km/h"
  }
];

export default function KartingCanchasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Filtrar pistas
  const filteredTracks = allTracks.filter(track => {
    const matchesSearch = track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || track.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || track.trackType === selectedType;
    
    return matchesSearch && matchesDifficulty && matchesType;
  });

  // Ordenar pistas
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className={styles.pageContainer}>
      <Sidebar sport="karting" userRole="usuario" />
      
      <main className={styles.mainContent}>
        {/* Header */}
        <section className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              🏎️ Pistas de Karting en Temuco
            </h1>
            <p className={styles.pageSubtitle}>
              Descubre las mejores pistas de karting de la región. 
              {sortedTracks.length} pistas disponibles
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <div className={styles.searchContainer}>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Buscar pistas de karting..."
                sport="karting"
              />
            </div>
            
            <div className={styles.filterGroup}>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Dificultad:</label>
                <select 
                  value={selectedDifficulty} 
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todas</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Tipo de Pista:</label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todas</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Mixed">Mixta</option>
                </select>
              </div>
              
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Ordenar por:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="rating">Rating</option>
                  <option value="price">Precio</option>
                  <option value="distance">Distancia</option>
                  <option value="name">Nombre</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              Resultados ({sortedTracks.length})
            </h2>
          </div>
          
          <div className={styles.tracksGrid}>
            {sortedTracks.map((track) => (
              <CourtCard
                key={track.id}
                imageUrl={track.image}
                name={track.name}
                address={track.location}
                rating={track.rating}
                reviews={Math.floor(Math.random() * 100) + 20}
                tags={track.features}
                description={`Pista de karting ${track.trackType} de nivel ${track.difficulty} con duración de ${track.duration}`}
                price={track.price}
                nextAvailable="Disponible hoy"
                sport="karting"
              />
            ))}
          </div>
          
          {sortedTracks.length === 0 && (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🏎️</div>
              <h3 className={styles.noResultsTitle}>No se encontraron pistas</h3>
              <p className={styles.noResultsText}>
                Intenta ajustar los filtros o cambiar el término de búsqueda
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}