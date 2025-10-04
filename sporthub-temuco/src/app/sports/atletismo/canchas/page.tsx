"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import atletismoCommon from '../atletismo.module.css';

const canchas = [
  {
    imageUrl: "/sports/atletismo/canchas/Cancha1.png",
    name: "Atletismo - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.3,
    reviews: "130 reseñas",
    tags: ["Pista al aire libre", "Estacionamiento", "Iluminación"],
    description: "Pista de atletismo ubicada en el centro",
    price: "21",
    nextAvailable: "20:00-21:00",
  },
  {
    imageUrl: "/sports/atletismo/canchas/Cancha2.png",
    name: "Atletismo - Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "85 reseñas",
    tags: ["Pista al aire libre", "Estacionamiento"],
    description: "Pista con cronometraje y carriles reglamentarios",
    price: "19",
    nextAvailable: "14:30-15:30",
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

  const handleBackToAtletismo = () => router.push('/sports/atletismo');

  const availableNow = filteredCanchas.filter(c => c.nextAvailable !== "No disponible hoy" && !c.nextAvailable.includes("Mañana")).length;

  return (
    <div className={atletismoCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />
      <div className={atletismoCommon.mainContent}>
        <div className={atletismoCommon.header}>
          <div className={atletismoCommon.headerLeft}>
            <div className={atletismoCommon.headerIcon}>🏃‍♂️</div>
            <h1 className={atletismoCommon.headerTitle}>Atletismo</h1>
          </div>
          <div className={atletismoCommon.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista o ubicación..."
              sport="atletismo"
            />
            <button className={atletismoCommon.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
            </button>
          </div>
        </div>

        <div className={atletismoCommon.filtersContainer}>
          <h3 className={atletismoCommon.filtersTitle}>Filtrar pistas</h3>
          <div className={atletismoCommon.filtersGrid}>
            <div className={atletismoCommon.filterField}><label className={atletismoCommon.filterLabel}>📍 Ubicación</label><input type="text" placeholder="Norte, Centro..." className={atletismoCommon.filterInput} /></div>
            <div className={atletismoCommon.filterField}><label className={atletismoCommon.filterLabel}>📅 Fecha</label><input type="text" placeholder="dd-mm-aaaa" className={atletismoCommon.filterInput} /></div>
            <div className={atletismoCommon.filterField}><label className={atletismoCommon.filterLabel}>💰 Precio</label><input type="range" min="0" max="100" className={atletismoCommon.priceSlider} /></div>
            <div className={atletismoCommon.filterField}><label className={atletismoCommon.filterLabel}>📏 Superficie</label><select className={atletismoCommon.filterSelect}><option>Tipo</option></select></div>
          </div>
          <div className={atletismoCommon.filtersActions}><button className={atletismoCommon.searchButton}>🔍 Buscar</button></div>
        </div>

  {filteredCanchas.length === 0 && searchTerm && <div className={atletismoCommon.noResults}><h3>No se encontraron resultados para &quot;{searchTerm}&quot;</h3></div>}

        <div className={atletismoCommon.cardsContainer}>
          <div className={atletismoCommon.cardsGrid}>{filteredCanchas.map((cancha, idx) => (<CourtCard key={idx} {...cancha} sport="atletismo" />))}</div>
          <div className={atletismoCommon.availabilityMessage}><div className={atletismoCommon.availabilityCard}><span>Canchas Disponibles ahora: <strong>{availableNow}</strong></span></div></div>
        </div>
      </div>
    </div>
  );
}
