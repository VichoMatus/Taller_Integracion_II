'use client';
import React, { useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

const centros = [
  {
    imageUrl: "/sports/escalada/centros/Centro1.png",
    name: "Escalada Vertical - Centro",
    address: "Centro, Temuco",
    rating: 4.7,
    reviews: "89 reseñas",
    tags: ["Escalada Indoor", "Boulder", "Equipos Incluidos", "Instructores"],
    description: "Centro de escalada indoor con rutas de diferentes niveles, boulder y alquiler de equipos completo",
    price: "18",
    nextAvailable: "14:00-15:00", 
  },
  {
    imageUrl: "/sports/escalada/centros/Centro2.png",
    name: "Boulder & Climb Norte",
    address: "Sector Norte",
    rating: 4.5,
    reviews: "67 reseñas",
    tags: ["Boulder", "Escalada Deportiva", "Cafetería", "Estacionamiento"],
    description: "Centro especializado en boulder y escalada deportiva con muro de 15 metros y zona de entrenamiento",
    price: "15",
    nextAvailable: "16:30-17:30", 
  },
  {
    imageUrl: "/sports/escalada/centros/Centro3.png",
    name: "Escalada Outdoor Sur",
    address: "Sector Sur",
    rating: 4.8,
    reviews: "124 reseñas",
    tags: ["Escalada Outdoor", "Guías", "Transporte", "Equipos"],
    description: "Centro de escalada en roca natural con guías certificados y tours a sectores cercanos a Temuco",
    price: "35",
    nextAvailable: "Mañana 08:00-09:00",
  },
  {
    imageUrl: "/sports/escalada/centros/Centro4.png",
    name: "Climb Gym Premium",
    address: "Centro Premium", 
    rating: 4.9,
    reviews: "156 reseñas",
    tags: ["Escalada Indoor", "Boulder", "Entrenamiento", "Sauna"],
    description: "Gimnasio de escalada premium con muros de 18 metros, boulder avanzado y área de recuperación",
    price: "25",
    nextAvailable: "No disponible hoy",
  },
  {
    imageUrl: "/sports/escalada/centros/Centro5.png",
    name: "Escalada Volcán",
    address: "Zona Volcánica", 
    rating: 4.6,
    reviews: "203 reseñas",
    tags: ["Escalada Outdoor", "Volcanes", "Expediciones", "Camping"],
    description: "Centro especializado en escalada en volcanes con expediciones guiadas y camping base",
    price: "45",
    nextAvailable: "18:00-19:00",
  },
  {
    imageUrl: "/sports/escalada/centros/Centro6.png",
    name: "Rock Climbing Temuco",
    address: "Centro Deportivo",
    rating: 4.4,
    reviews: "78 reseñas",
    tags: ["Escalada Indoor", "Cursos", "Certificación", "Competencias"],
    description: "Centro de escalada con cursos de certificación, competencias regulares y entrenamiento técnico",
    price: "20",
    nextAvailable: "19:00-20:00",
  }
];

export default function Page() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCentros, setFilteredCentros] = useState(centros);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredCentros(centros);
    } else {
      const filtered = centros.filter(centro =>
        centro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCentros(filtered);
    }
  };

  const handleBackToEscalada = () => {
    router.push('/sports/escalada');
  };

  const availableNow = filteredCentros.filter(centro => 
    centro.nextAvailable !== "No disponible hoy" && 
    !centro.nextAvailable.includes("Mañana")
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
      <Sidebar userRole="usuario" sport="escalada" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🧗‍♂️</div>
            <h1 className={styles.headerTitle}>Escalada</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del centro o ruta"
              sport="escalada" 
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

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToEscalada}
          >
            <span>←</span>
            <span>Escalada</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar centros de escalada</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#A67B5B'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Volcánica..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#A67B5B'}}>📅</span>
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
                <span style={{color: '#6F4E37'}}>💰</span>
                <span>Precio (max $sesión)</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#ECB176'}}>🧗‍♀️</span>
                <span>Tipo de escalada</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de escalada</option>
                <option>Escalada Indoor</option>
                <option>Escalada Outdoor</option>
                <option>Boulder</option>
                <option>Escalada Deportiva</option>
                <option>Escalada Tradicional</option>
                <option>Escalada en Volcanes</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar centros</span>
            </button>
          </div>
        </div>


        {/* Mensaje de no resultados */}
        {filteredCentros.length === 0 && searchTerm && (
          <div className={styles.noResults}>
            <h3>No se encontraron centros de escalada para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCentros(centros);}}>
              Ver todos los centros de escalada
            </button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {filteredCentros.map((centro, idx) => (
              <CourtCard 
                key={idx} 
                {...centro} 
                sport="escalada"
                
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}