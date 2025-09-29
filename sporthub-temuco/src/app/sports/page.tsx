'use client';
import React, { useState } from 'react';
import Image from 'next/image'
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/SearchBar';
import styles from './page.module.css';

// Datos de los deportes disponibles
const sportsData = [
  {
    id: 'futbol',
    name: 'Futbol',
    imageUrl: '/sports/futbol/futbol.png',
    description: 'Canchas de futbol 5-11 jugadores. Canchas con pasto sintético y pasto natural.',
    tag: 'Popular',
    tagColor: '#3b82f6', // Azul
    href: '/sports/futbol'
  },
  {
    id: 'basquetbol',
    name: 'Basquetbol',
    imageUrl: '/sports/basquetbol/Basquet.png',
    description: 'Explora ligas, equipos y partidos de baloncesto.',
    tag: 'Tendencia',
    tagColor: '#f97316', // Naranja
    href: '/sports/basquetbol'
  },
  {
    id: 'tenis',
    name: 'Tenis',
    imageUrl: '/sports/tenis/tenis.png',
    description: 'Grand Slams, rankings y próximos torneos.',
    tag: 'Próximamente',
    tagColor: '#10b981', // Verde
    href: '/sports/tenis'
  },
  {
    id: 'padel',
    name: 'Padel',
    imageUrl: '/sports/padel/padel.png',
    description: 'Explora ligas, equipos y partidos de padel.',
    tag: 'Próximamente',
    tagColor: '#8b5cf6', // Violeta
    href: '/sports/padel'
  },
  {
    id: 'natacion',
    name: 'Natacion',
    imageUrl: '/sports/natacion/natacion.png',
    description: 'Explora natación y deportes acuáticos.',
    tag: 'Nuevo',
    tagColor: '#06b6d4', // Cyan
    href: '/sports/natacion'
  },
  {
    id: 'voley',
    name: 'Voley',
    imageUrl: '/sports/voley/voley.png',
    description: 'Explora voleibol y competencias.',
    tag: 'Nuevo',
    tagColor: '#ec4899', // Rosa
    href: '/sports/voley'
  },
  // NUEVOS DEPORTES AGREGADOS
  {
    id: 'enduro',
    name: 'Enduro',
    imageUrl: '/sports/enduro/enduro.png',
    description: 'Rutas y circuitos para enduro. Terrenos desafiantes y emocionantes.',
    tag: 'Extremo',
    tagColor: '#4B5320', // verde militar
    href: '/sports/enduro'
  },
  {
    id: 'futbol-americano',
    name: 'Futbol Americano',
    imageUrl: '/sports/futbol-americano/futbol-americano.png',
    description: 'Campos profesionales para partidos y entrenamientos de football americano.',
    tag: 'Contacto',
    tagColor: '#002147', // azul marino
    href: '/sports/futbol-americano'
  },
  {
    id: 'rugby',
    name: 'Rugby',
    imageUrl: '/sports/rugby/rugby.png',
    description: 'Campos de rugby con medidas oficiales para partidos y entrenamientos.',
    tag: 'Intenso',
    tagColor: '#722F37', // vino titno
    href: '/sports/rugby'
  },
  {
    id: 'mountain-bike',
    name: 'Mountain Bike',
    imageUrl: '/sports/mountain-bike/mountain-bike.png',
    description: 'Senderos y circuitos para mountain bike. Diferentes niveles de dificultad.',
    tag: 'Aventura',
    tagColor: '#4E342E', // Índigo
    href: '/sports/mountain-bike'
  }
];

export default function SportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('competitivo');
  const [filteredSports, setFilteredSports] = useState(sportsData);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredSports(sportsData);
    } else {
      const filtered = sportsData.filter(sport =>
        sport.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSports(filtered);
    }
  };

  const handleSportClick = (sport: typeof sportsData[0]) => {
    if (sport.href) {
      window.location.href = sport.href;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <Sidebar userRole="usuario"  />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Explora Deportes</h1>
          <div className={styles.headerRight}>
            <button className={styles.userButton}>
              <span>👤</span>
              <span>Usuario</span>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del deporte"
            />
          </div>
        </div>

        {/* Grid de deportes */}
        <div className={styles.sportsGrid}>
          {filteredSports.map((sport) => (
            <div 
              key={sport.id} 
              className={styles.sportCard}
              onClick={() => handleSportClick(sport)}
            >
              {/* Imagen del deporte */}
              <div className={styles.sportImageContainer}>
                <Image 
                    src={sport.imageUrl} 
                    alt={sport.name}
                    className={styles.sportImage}
                    width={300}
                    height={200}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                <div 
                  className={styles.sportTag}
                  style={{ backgroundColor: sport.tagColor }}
                >
                  {sport.tag}
                </div>
              </div>

              <div className={styles.sportContent}>
                <h3 className={styles.sportName}>{sport.name}</h3>
                <p className={styles.sportDescription}>{sport.description}</p>
                
                <button className={styles.exploreButton}>
                  Explorar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredSports.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron deportes para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button 
              onClick={() => {
                setSearchTerm(''); 
                setFilteredSports(sportsData);
              }}
              className={styles.resetButton}
            >
              Ver todos los deportes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}