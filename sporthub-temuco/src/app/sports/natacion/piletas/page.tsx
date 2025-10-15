'use client';
import React, { useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const piscinas = [
  {
    imageUrl: "/sports/natacion/piscinas/Piscina1.png",
    name: "Natación - Centro",
    address: "Norte, Centro, Sur",
    rating: 4.8,
    reviews: "223 reseñas",
    tags: ["Piscina Olímpica", "Estacionamiento", "Iluminación LED", "Vestuarios"],
    description: "Piscina olímpica profesional con carriles demarcados ubicada en el centro con equipos de natación incluidos",
    price: "35",
    nextAvailable: "19:00-20:30", 
  },
  {
    imageUrl: "/sports/natacion/piscinas/Piscina2.png",
    name: "Natación - Norte",
    address: "Sector Norte",
    rating: 4.6,
    tags: ["Piscina Semi-olímpica", "Estacionamiento", "Climatizada"],
    description: "Piscina semi-olímpica premium con sistema de filtrado de última generación ubicada en el sector norte",
    price: "32",
    nextAvailable: "15:00-16:30", 
  },
  {
    imageUrl: "/sports/natacion/piscinas/Piscina3.png",
    name: "Natación - Sur",
    address: "Sector Sur",
    rating: 4.5,
    tags: ["Piscina Cubierta", "Estacionamiento", "Iluminación", "Cafetería"],
    description: "Piscina cubierta ubicada en el sur, ideal para nadar en cualquier clima y temporada",
    price: "30",
    nextAvailable: "Mañana 10:00-11:30",
  },
  {
    imageUrl: "/sports/natacion/piscinas/Piscina4.png",
    name: "Natación Premium",
    address: "Centro Premium", 
    rating: 4.9,
    tags: ["Piscina Profesional", "Estacionamiento", "Iluminación LED", "Bar"],
    description: "Piscina profesional con estándar internacional y todas las comodidades VIP para natación",
    price: "45",
    nextAvailable: "Disponible ahora",
  },
  {
    imageUrl: "/sports/natacion/piscinas/Piscina5.png",
    name: "Natación - Elite",
    address: "Zona Elite",
    rating: 4.7,
    tags: ["Piscina Internacional", "Estacionamiento", "Climatizada", "Spa"],
    description: "Piscina de élite con sistema de competición y servicios exclusivos para natación",
    price: "50",
    nextAvailable: "17:30-19:00",
  },
  {
    imageUrl: "/sports/natacion/piscinas/Piscina6.png",
    name: "Natación - Club",
    address: "Club Deportivo",
    rating: 4.6,
    tags: ["Piscina de Club", "Estacionamiento", "Iluminación", "Torneos"],
    description: "Piscina en club deportivo con torneos regulares y ambiente competitivo de natación",
    price: "38",
    nextAvailable: "16:00-17:30",
  }
];

export default function Page() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPiscinas, setFilteredPiscinas] = useState(piscinas);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredPiscinas(piscinas);
    } else {
      const filtered = piscinas.filter(piscina =>
        piscina.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        piscina.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPiscinas(filtered);
    }
  };

  const handleBackToNatacion = () => {
    router.push('/sports/natacion');
  };

  const availableNow = filteredPiscinas.filter(piscina => 
    piscina.nextAvailable !== "No disponible hoy" && 
    !piscina.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {


    if (isAuthenticated) {


      router.push('/usuario/EditarPerfil');


    } else {


      router.push('/login');


    }


  };



  return (
    <div className={styles.pageContainer}>
      {/* 🔥 Sidebar específico para natación */}
      <Sidebar userRole="usuario" sport="natacion" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏊‍♂️</div>
            <h1 className={styles.headerTitle}>Natación</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la piscina de natación"
              sport="natacion" 
            />
            <button 
              {...buttonProps}
              onClick={handleUserButtonClick}
              className={styles.userButton}
            >
              <span>👤</span>
              <span>{buttonProps.text}</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb con navegación */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToNatacion}
          >
            <span>←</span>
            <span>Natación</span>
          </button>
        </div>

        {/* Filtros específicos para natación */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar piscinas de natación</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#1e40af'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Club..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#1e40af'}}>📅</span>
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
                <span style={{color: '#1e3a8a'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="25"
                max="60"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#1f2937'}}>🏊‍♂️</span>
                <span>Tipo de piscina</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de piscina</option>
                <option>Piscina Olímpica</option>
                <option>Piscina Semi-olímpica</option>
                <option>Piscina Cubierta</option>
                <option>Piscina Profesional</option>
                <option>Piscina Premium</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar piscinas</span>
            </button>
          </div>
        </div>

        {/* Mostrar mensaje si no hay resultados */}
        {filteredPiscinas.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron piscinas de natación para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas de natación</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPiscinas(piscinas);}}>
              Ver todas las piscinas de natación
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredPiscinas.map((piscina, idx) => (
              <CourtCard 
                key={idx} 
                {...piscina} 
                sport="natacion" // 🔥 ESPECIFICAR DEPORTE NATACIÓN
              />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Piscinas de Natación Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}