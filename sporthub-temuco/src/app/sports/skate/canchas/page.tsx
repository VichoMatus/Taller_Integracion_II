"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import skateCommon from '../skate.module.css';

const canchas = [
  {
    imageUrl: "/sports/skate/canchas/Skate1.svg",
    name: "Skate - Plaza Central",
    address: "Plaza, Centro",
    rating: 4.6,
    reviews: "72 reseñas",
    tags: ["Skatepark", "Bowl", "Rampas"],
    description: "Skatepark en el centro",
    price: "0",
    nextAvailable: "Abierto",
  }
];

export default function Page() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCanchas, setFilteredCanchas] = useState(canchas);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSearch = () => {
    if (searchTerm.trim() === '') setFilteredCanchas(canchas);
    else setFilteredCanchas(canchas.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  const handleBackToSkate = () => router.push('/sports/skate');

  const availableNow = filteredCanchas.filter(c => c.nextAvailable !== "No disponible hoy" && !c.nextAvailable.includes("Mañana")).length;

  return (
    <div className={skateCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />
      <div className={skateCommon.mainContent}>
        <div className={skateCommon.header}>
          <div className={skateCommon.headerLeft}>
            <div className={skateCommon.headerIcon}>🛹</div>
            <h1 className={skateCommon.headerTitle}>Skateparks</h1>
          </div>
          <div className={skateCommon.headerRight}>
            <SearchBar value={searchTerm} onChange={handleSearchChange} onSearch={handleSearch} placeholder="Nombre del skatepark" sport="skate" />
            <button className={skateCommon.userButton} onClick={() => router.push('/usuario/perfil')}>👤 Usuario</button>
          </div>
        </div>

        <div className={skateCommon.breadcrumb}>
          <button className={skateCommon.breadcrumbButton} onClick={handleBackToSkate}>← Skate</button>
        </div>

        <div className={skateCommon.filtersContainer}>
          <h3 className={skateCommon.filtersTitle}>Filtrar skateparks</h3>
          <div className={skateCommon.filtersGrid}>
            <div className={skateCommon.filterField}><label className={skateCommon.filterLabel}>📍 Ubicación</label><input type="text" placeholder="Centro, Barrio..." className={skateCommon.filterInput} /></div>
            <div className={skateCommon.filterField}><label className={skateCommon.filterLabel}>📅 Fecha</label><input type="text" placeholder="dd-mm-aaaa" className={skateCommon.filterInput} /></div>
            <div className={skateCommon.filterField}><label className={skateCommon.filterLabel}>💰 Precio</label><input type="range" min="0" max="100" className={skateCommon.priceSlider} /></div>
            <div className={skateCommon.filterField}><label className={skateCommon.filterLabel}>⚙️ Tipo</label><select className={skateCommon.filterSelect}><option>Tipo</option></select></div>
          </div>
          <div className={skateCommon.filtersActions}><button className={skateCommon.searchButton}>🔍 Buscar</button></div>
        </div>

  {filteredCanchas.length === 0 && searchTerm && <div className={skateCommon.noResults}><h3>No se encontraron resultados para &quot;{searchTerm}&quot;</h3></div>}

        <div className={skateCommon.cardsContainer}>
          <div className={skateCommon.cardsGrid}>{filteredCanchas.map((cancha, idx) => (<CourtCard key={idx} {...cancha} sport="skate" />))}</div>
          <div className={skateCommon.availabilityMessage}><div className={skateCommon.availabilityCard}><span>Skateparks Disponibles ahora: <strong>{availableNow}</strong></span></div></div>
        </div>
      </div>
    </div>
  );
}
