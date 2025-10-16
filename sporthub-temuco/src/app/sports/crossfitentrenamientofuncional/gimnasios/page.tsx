'use client';
import React, { useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const gimnasios = [
  {
    imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio1.png",
    name: "CrossFit Iron Box",
    address: "Centro, Temuco",
    rating: 4.8,
    tags: ["Entrenamiento Funcional", "CrossFit", "Box Profesional", "Coaching"],
    description: "Box de CrossFit completamente equipado con rigs, kettlebells, barras olímpicas y entrenadores certificados",
    price: "15",
    nextAvailable: "06:00-07:00", 
  },
  {
    imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio2.png",
    name: "Functional Fitness Center",
    address: "Sector Norte",
    rating: 4.6,
    tags: ["Entrenamiento Funcional", "TRX", "Kettlebells", "Personal Training"],
    description: "Centro especializado en entrenamiento funcional con equipos TRX, battle ropes y entrenamientos personalizados",
    price: "12",
    nextAvailable: "07:30-08:30", 
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym3.png",
    name: "Elite CrossFit Sud",
    address: "Sector Sur",
    rating: 4.7,
    tags: ["CrossFit", "Halterofilia", "Box Equipado", "Clases Grupales"],
    description: "Box de CrossFit con plataformas de halterofilia, anillas y clases grupales dirigidas por atletas certificados",
    price: "18",
    nextAvailable: "Mañana 06:30-07:30",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym4.png",
    name: "Beast Mode Gym",
    address: "Centro Premium", 
    rating: 4.9,
    tags: ["CrossFit Elite", "Competencia", "Coaching Avanzado", "Nutrición"],
    description: "Box premium de CrossFit para atletas de competencia con equipamiento profesional y coaching nutricional",
    price: "25",
    nextAvailable: "No disponible hoy",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym5.png",
    name: "Functional Training Hub",
    address: "Zona Industrial", 
    rating: 4.5,
    tags: ["Entrenamiento Funcional", "Calistenia", "Strongman", "Open Box"],
    description: "Hub de entrenamiento funcional con área de calistenia, implementos strongman y concepto open box 24/7",
    price: "20",
    nextAvailable: "05:30-06:30",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym6.png",
    name: "CrossFit Patagonia",
    address: "Centro Deportivo", 
    rating: 4.4,
    tags: ["CrossFit", "Outdoor Training", "Bootcamp", "Recuperación"],
    description: "Box de CrossFit con área outdoor, bootcamps al aire libre y zona de recuperación con sauna y masajes",
    price: "16",
    nextAvailable: "19:00-20:00",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym7.png",
    name: "Titan Functional Gym",
    address: "Sector Oriente", 
    rating: 4.3,
    tags: ["Entrenamiento Funcional", "Powerlifting", "Acondicionamiento", "Flexibilidad"],
    description: "Gimnasio especializado en entrenamiento funcional con área de powerlifting y clases de movilidad",
    price: "14",
    nextAvailable: "12:00-13:00",
  },
  {
    imageUrl: "/sports/crossfit/gimnasios/Gym8.png",
    name: "Warrior CrossFit",
    address: "Zona Norte", 
    rating: 4.6,
    tags: ["CrossFit", "MMA Conditioning", "Cardio Intensivo", "Fuerza"],
    description: "Box de CrossFit con enfoque en acondicionamiento para MMA, cardio intensivo y desarrollo de fuerza",
    price: "17",
    nextAvailable: "08:00-09:00",
  }
];

export default function Page() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGimnasios, setFilteredGimnasios] = useState(gimnasios);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredGimnasios(gimnasios);
    } else {
      const filtered = gimnasios.filter(gimnasio =>
        gimnasio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gimnasio.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGimnasios(filtered);
    }
  };

  const handleBackToCrossFit = () => {
    router.push('/sports/crossfitentrenamientofuncional');
  };

  const availableNow = filteredGimnasios.filter(gimnasio => 
    gimnasio.nextAvailable !== "No disponible hoy" && 
    !gimnasio.nextAvailable.includes("Mañana")
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
      {/* 🔥 Sidebar específico para crossfit */}
      <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏋️‍♂️</div>
            <h1 className={styles.headerTitle}>CrossFit y Entrenamiento Funcional</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del gimnasio"
              sport="crossfitentrenamientofuncional" 
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
            onClick={handleBackToCrossFit}
          >
            <span>←</span>
            <span>CrossFit y Entrenamiento Funcional</span>
          </button>
        </div>

        {/* Filtros específicos para crossfit */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar gimnasios de CrossFit y Entrenamiento Funcional</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#61677A'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Centro, Norte, Sur, Industrial..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#61677A'}}>📅</span>
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
                <span style={{color: '#272829'}}>💰</span>
                <span>Precio (max $/clase)</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#D8D9DA'}}>🏋️</span>
                <span>Tipo de entrenamiento</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de entrenamiento</option>
                <option>CrossFit</option>
                <option>Entrenamiento Funcional</option>
                <option>Powerlifting</option>
                <option>Calistenia</option>
                <option>Strongman</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar</span>
            </button>
          </div>
        </div>

        {/* Mostrar mensaje si no hay resultados */}
        {filteredGimnasios.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron gimnasios para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredGimnasios(gimnasios);}}>
              Ver todos los gimnasios
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredGimnasios.map((gimnasio, idx) => (
              <CourtCard 
                key={idx} 
                {...gimnasio} 
                sport="crossfitentrenamientofuncional" // 🔥 ESPECIFICAR DEPORTE
              />
            ))}
          </div>
          
          {/* Mensaje de disponibilidad */}
          <div className={styles.availabilityMessage}>
            <div className={styles.availabilityCard}>
              <span className={styles.availabilityText}>
                Gimnasios Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}