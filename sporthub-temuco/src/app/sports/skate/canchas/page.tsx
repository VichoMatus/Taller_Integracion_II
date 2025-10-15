"use client";
import React, { useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const canchas = [
  {
    imageUrl: "/sports/skate/canchas/Skate1.svg",
    name: "Skate Plaza Central",
    address: "Plaza de Armas, Centro",
    rating: 4.6,
    tags: ["Bowl", "Street", "Rampas"],
    description: "Skatepark urbano con bowl profesional y zona street completa",
    price: "0",
    nextAvailable: "Abierto",
  },
  {
    imageUrl: "/sports/skate/canchas/Skate2.svg",
    name: "Skatepark Universidad",
    address: "Campus Universitario, Temuco",
    rating: 4.4,
    tags: ["Principiantes", "Mini Ramp", "Flatground"],
    description: "Área perfecta para aprender, con obstáculos básicos",
    price: "0",
    nextAvailable: "Abierto",
  },
  {
    imageUrl: "/sports/skate/canchas/Skate1.svg",
    name: "Bowl Parque Costanera",
    address: "Costanera Norte, Temuco",
    rating: 4.8,
    tags: ["Bowl Profundo", "Avanzado", "Vert"],
    description: "Bowl de concreto de nivel profesional con transiciones perfectas",
    price: "0",
    nextAvailable: "Abierto",
  },
  {
    imageUrl: "/sports/skate/canchas/Skate2.svg",
    name: "Street Plaza Condell",
    address: "Av. Condell, Temuco",
    rating: 4.3,
    tags: ["Street", "Rails", "Escaleras"],
    description: "Plaza de street skating con rails, escaleras y bordillos",
    price: "0",
    nextAvailable: "Abierto",
  }
];

export default function Page() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCanchas, setFilteredCanchas] = useState(canchas);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSearch = () => {
    if (searchTerm.trim() === '') setFilteredCanchas(canchas);
    else setFilteredCanchas(canchas.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  const handleBackToSkate = () => router.push('/sports/skate');

  const availableNow = filteredCanchas.filter(c => c.nextAvailable !== "No disponible hoy" && !c.nextAvailable.includes("Mañana")).length;

  const handleUserButtonClick = () => {


    if (isAuthenticated) {


      router.push('/usuario/EditarPerfil');


    } else {


      router.push('/login');


    }


  };



  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon} style={{ '--emoji': 'var(--skate-main-emoji)' } as React.CSSProperties}>
              {/* Emoji desde CSS variable */}
            </div>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del skatepark o ubicación..."
              sport="skate"
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar skateparks</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}><label className={styles.filterLabel}>📍 Ubicación</label><input type="text" placeholder="Centro, Barrio..." className={styles.filterInput} /></div>
            <div className={styles.filterField}><label className={styles.filterLabel}>📅 Fecha</label><input type="text" placeholder="dd-mm-aaaa" className={styles.filterInput} /></div>
            <div className={styles.filterField}><label className={styles.filterLabel}>💰 Precio</label><input type="range" min="0" max="100" className={styles.priceSlider} /></div>
            <div className={styles.filterField}><label className={styles.filterLabel}>⚙️ Tipo</label><select className={styles.filterSelect}><option>Tipo</option></select></div>
          </div>
          <div className={styles.filtersActions}><button className={styles.searchButton}>🔍 Buscar</button></div>
        </div>

  {filteredCanchas.length === 0 && searchTerm && <div className={styles.noResults}><h3>No se encontraron resultados para &quot;{searchTerm}&quot;</h3></div>}

        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>{filteredCanchas.map((cancha, idx) => (<CourtCard key={idx} {...cancha} sport="skate" />))}</div>
          <div className={styles.availabilityMessage}><div className={styles.availabilityCard}><span>Skateparks Disponibles ahora: <strong>{availableNow}</strong></span></div></div>
        </div>
      </div>
    </div>
  );
}

