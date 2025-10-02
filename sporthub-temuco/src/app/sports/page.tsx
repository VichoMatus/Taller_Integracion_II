 'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  {
    id: 'atletismo',
    name: 'Atletismo',
    imageUrl: '/sports/atletismo/atletismo.png',
    description: 'Pistas de atletismo, eventos de carreras y competencias deportivas.',
    tag: 'Nuevo',
    tagColor: '#1E40AF', // Blue/gray palette for Atletismo
    href: '/sports/atletismo'
  },
  {
    id: 'skate',
    name: 'Skate',
    imageUrl: '/sports/skate/skate.png',
    description: 'Skateparks, rampas, bowls y zonas de street skating.',
    tag: 'Nuevo',
    tagColor: '#6b7280', // neutral gray (no naranja)
    href: '/sports/skate'
  },
  {
    id: 'ciclismo',
    name: 'Ciclismo',
    imageUrl: '/sports/ciclismo/ciclismo.png',
    description: 'Ciclovías urbanas, rutas de montaña y pistas de ciclismo.',
    tag: 'Nuevo',
    tagColor: '#22c55e', // Verde para ciclismo
    href: '/sports/ciclismo'
  },
  {
    id: 'karting',
    name: 'Karting',
    imageUrl: '/sports/karting/karting.png',
    description: 'Kartódromos profesionales, pistas techadas y competencias de velocidad.',
    tag: 'Nuevo',
    tagColor: '#ef4444', // Rojo para karting
    href: '/sports/karting'
  }
];

export default function SportsPage() {
  const router = useRouter();
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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    // Aquí podrías implementar la lógica de ordenamiento
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
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
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
                    width={300}  // Requerido
                    height={200} // Requerido
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                {/* Tag del deporte */}
                <div 
                  className={styles.sportTag}
                  style={{ backgroundColor: sport.tagColor }}
                >
                  {sport.tag}
                </div>
              </div>

              {/* Contenido de la card */}
              <div className={styles.sportContent}>
                <h3 className={styles.sportName}>{sport.name}</h3>
                <p className={styles.sportDescription}>{sport.description}</p>
                
                {/* Botón de acción */}
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