'use client';
import React, { useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/SearchBar';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import styles from './page.module.css';

// 🔥 DATOS MOVIDOS FUERA + OPTIMIZACIÓN
const sportsData = [
  {
    id: 'futbol',
    name: 'Futbol',
    imageUrl: '/sports/futbol/futbol.png',
    description: 'Canchas de futbol 5-11 jugadores. Canchas con pasto sintético y pasto natural.',
    tag: 'Popular',
    tagColor: '#3b82f6',
    href: '/sports/futbol'
  },
  {
    id: 'basquetbol',
    name: 'Basquetbol',
    imageUrl: '/sports/basquetbol/Basquet.png',
    description: 'Explora ligas, equipos y partidos de baloncesto.',
    tag: 'Tendencia',
    tagColor: '#f97316',
    href: '/sports/basquetbol'
  },
  {
    id: 'tenis',
    name: 'Tenis',
    imageUrl: '/sports/tenis/tenis.png',
    description: 'Grand Slams, rankings y próximos torneos.',
    tag: 'Próximamente',
    tagColor: '#10b981',
    href: '/sports/tenis'
  },
  {
    id: 'padel',
    name: 'Padel',
    imageUrl: '/sports/padel/padel.png',
    description: 'Explora ligas, equipos y partidos de padel.',
    tag: 'Próximamente',
    tagColor: '#8b5cf6',
    href: '/sports/padel'
  },
  {
    id: 'natacion',
    name: 'Natacion',
    imageUrl: '/sports/natacion/natacion.png',
    description: 'Explora natación y deportes acuáticos.',
    tag: 'Nuevo',
    tagColor: '#06b6d4',
    href: '/sports/natacion'
  },
  {
    id: 'atletismo',
    name: 'Atletismo',
    imageUrl: '/sports/atletismo/atletismo.png',
    description: 'Pistas de atletismo, eventos de carreras y competencias deportivas.',
    tag: 'Nuevo',
    tagColor: '#1E40AF',
    href: '/sports/atletismo'
  },
  {
    id: 'skate',
    name: 'Skate',
    imageUrl: '/sports/skate/skate.png',
    description: 'Skateparks, rampas, bowls y zonas de street skating.',
    tag: 'Nuevo',
    tagColor: '#6b7280',
    href: '/sports/skate'
  },
  {
    id: 'ciclismo',
    name: 'Ciclismo',
    imageUrl: '/sports/ciclismo/ciclismo.png',
    description: 'Ciclovías urbanas, rutas de montaña y pistas de ciclismo.',
    tag: 'Nuevo',
    tagColor: '#22c55e',
    href: '/sports/ciclismo'
  },
  {
    id: 'karting',
    name: 'Karting',
    imageUrl: '/sports/karting/karting.png',
    description: 'Kartódromos profesionales, pistas techadas y competencias de velocidad.',
    tag: 'Nuevo',
    tagColor: '#ef4444',
    href: '/sports/karting'
  },
  {
    id: 'enduro',
    name: 'Enduro',
    imageUrl: '/sports/enduro/enduro.png',
    description: 'Rutas y circuitos para enduro. Terrenos desafiantes y emocionantes.',
    tag: 'Extremo',
    tagColor: '#4B5320',
    href: '/sports/enduro'
  },
  {
    id: 'futbol-americano',
    name: 'Futbol Americano',
    imageUrl: '/sports/futbol-americano/futbol-americano.png',
    description: 'Campos profesionales para partidos y entrenamientos de football americano.',
    tag: 'Contacto',
    tagColor: '#002147',
    href: '/sports/futbol-americano'
  },
  {
    id: 'rugby',
    name: 'Rugby',
    imageUrl: '/sports/rugby/rugby.png',
    description: 'Campos de rugby con medidas oficiales para partidos y entrenamientos.',
    tag: 'Intenso',
    tagColor: '#722F37',
    href: '/sports/rugby'
  },
  {
    id: 'mountain-bike',
    name: 'Mountain Bike',
    imageUrl: '/sports/mountain-bike/mountain-bike.png',
    description: 'Senderos y circuitos para mountain bike. Diferentes niveles de dificultad.',
    tag: 'Aventura',
    tagColor: '#4E342E',
    href: '/sports/mountain-bike'
  },
  {
    id: 'voleibol',
    name: 'Voleibol',
    imageUrl: '/sports/voleibol/voleibol.png',
    description: 'Campos de voleibol para partidos y entrenamientos.',
    tag: 'Equipo',
    tagColor: '#FF0000',
    href: '/sports/voleibol'
  },
  {
    id: 'entrenamientofuncional',
    name: 'Crossfit y Entrenamiento Funcional',
    imageUrl: '/sports/crossfitentrenamientofuncional/crossfitentrenamientofuncional.png',
    description: 'Explora entrenamiento funcional y rutinas de ejercicio.',
    tag: 'Nuevo',
    tagColor: '#272829',
    href: '/sports/crossfitentrenamientofuncional'
  },
  {
    id: 'patinaje',
    name: 'Patinaje',
    imageUrl: '/sports/patinaje/patinaje.png',
    description: 'Explora patinaje y competencias.',
    tag: 'Nuevo',
    tagColor: '#55f2edff',
    href: '/sports/patinaje'
  },
  {
    id: 'escalada',
    name: 'Escalada',
    imageUrl: '/sports/escalada/escalada.png',
    description: 'Explora centros de escalada y rutas.',
    tag: 'Nuevo',
    tagColor: '#A67B5B',
    href: '/sports/escalada'
  },
] as const;

// 🔥 COMPONENTE MEMOIZADO INDIVIDUAL
const SportCard = memo(({ sport, onClick }: {
  sport: any;
  onClick: (sport: any) => void;
}) => {
  const handleSportClick = useCallback((sport: any) => {
    if (sport.href) {
      // 🔥 FORZAR NAVEGACIÓN SIN PREFETCH
      window.location.href = sport.href;
    }
  }, []);

  const tagStyle = useMemo(() => ({
    backgroundColor: sport.tagColor
  }), [sport.tagColor]);

  return (
    <div 
      className={styles.sportCard}
      onClick={() => handleSportClick(sport)}
    >
      <div className={styles.sportImageContainer}>
        <Image 
          src={sport.imageUrl} 
          alt={sport.name}
          className={styles.sportImage}
          width={300}
          height={200}
          loading="lazy"
          priority={false}
          unoptimized={true}
        />
        <div 
          className={styles.sportTag}
          style={tagStyle}
        >
          {sport.tag}
        </div>
      </div>

      <div className={styles.sportContent}>
        <h3 className={styles.sportName}>{sport.name}</h3>
        <p className={styles.sportDescription}>{sport.description}</p>
        
        <div className={styles.exploreButton}>
          Explorar
        </div>
      </div>
    </div>
  );
});

SportCard.displayName = 'SportCard';

export default function SportsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { buttonProps } = useAuthStatus();

  const filteredSports = useMemo(() => {
    if (searchTerm.trim() === '') {
      return sportsData;
    }
    const searchLower = searchTerm.toLowerCase();
    return sportsData.filter(sport =>
      sport.name.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    // Búsqueda automática con useMemo
  }, []);

  // 🔥 NAVEGACIÓN SIN PREFETCH
  const handleSportClick = useCallback((sport: typeof sportsData[0]) => {
    if (sport.href) {
      // 🔥 FORZAR NAVEGACIÓN SIN PREFETCH
      window.location.href = sport.href;
    }
  }, []);

  const handleUserButtonClick = useCallback(() => {
    if (!buttonProps?.disabled) {
      router.push(buttonProps.href);
    }
  }, [buttonProps, router]);

  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const hasResults = filteredSports.length > 0;
  const showNoResults = !hasResults && searchTerm.trim() !== '';

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Explora Deportes</h1>
          <div className={styles.headerRight}>
            <button 
              className={styles.userButton} 
              onClick={handleUserButtonClick}
              disabled={buttonProps?.disabled}
            >
              <span>👤</span>
              <span>{buttonProps?.text || 'Usuario'}</span>
            </button>
          </div>
        </div>

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

        {hasResults && (
          <div className={styles.sportsGrid}>
            {filteredSports.map((sport) => (
              <SportCard 
                key={sport.id} 
                sport={sport}
                onClick={handleSportClick}
              />
            ))}
          </div>
        )}

        {showNoResults && (
          <div className={styles.noResults}>
            <h3>No se encontraron deportes para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button 
              onClick={handleResetSearch}
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