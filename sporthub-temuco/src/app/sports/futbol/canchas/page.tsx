'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import { useComplejosCanchas } from '../../../../hooks/useComplejosCanchas'; // 🔥 NUEVO HOOK
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // 🔥 USAR HOOK DE CANCHAS CON COMPLEJOS
  const {
    canchas,
    loading: isLoadingCanchas,
    error: errorHook
  } = useComplejosCanchas({
    deportes: ['futbol', 'futsal', 'futbolito'],
    fallbackComplejos: {
      1: {
        nombre: "Complejo Deportivo Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Complejo Deportivo Centro",
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Complejo Deportivo Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      }
    }
  });

  // Estado local para filtrado
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const error = errorHook || '';

  // 🔥 ACTUALIZAR FILTRADO CUANDO CAMBIEN LAS CANCHAS
  useEffect(() => {
    setFilteredCanchas(canchas);
  }, [canchas]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredCanchas(canchas);
    } else {
      const filtered = canchas.filter(cancha =>
        cancha.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancha.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCanchas(filtered);
    }
  };

  const handleBackToFootball = () => {
    router.push('/sports/futbol');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable !== "No disponible hoy" && 
    !cancha.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  // 🔥 FUNCIÓN PARA REFRESCAR DATOS (recarga la página para reiniciar el hook)
  const handleRefresh = () => {
    window.location.reload();
  };

  // 🔥 MANEJADOR DE CLICK EN CANCHA (como en la página principal)
  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha:', court);
    router.push(`/sports/futbol/canchas/canchaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="futbol" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>Fútbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha"
              sport="futbol" 
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
            onClick={handleBackToFootball}
          >
            <span>←</span>
            <span>Fútbol</span>
          </button>
        </div>

        {/* 🔥 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🔥 MENSAJE DE CARGA */}
        {isLoadingCanchas && (
          <div className={styles.loadingMessage}>
            <span>⚽</span>
            <span>Cargando canchas de fútbol...</span>
          </div>
        )}

        

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de fútbol</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#22c55e'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Oeste..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#22c55e'}}>📅</span>
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
                <span style={{color: '#16a34a'}}>💰</span>
                <span>Precio (max $hr)</span>
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
                <span style={{color: '#15803d'}}>🌱</span>
                <span>Tipo de césped</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de césped</option>
                <option>Césped natural</option>
                <option>Césped sintético</option>
                <option>Césped híbrido</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar canchas</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron canchas de fútbol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de fútbol
            </button>
          </div>
        )}

        {/* 🔥 MENSAJE CUANDO NO HAY CANCHAS EN LA BD */}
        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <h3>⚽ No hay canchas de fútbol registradas</h3>
            <p>Aún no se han registrado canchas de fútbol en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingCanchas && filteredCanchas.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredCanchas.map((cancha, idx) => (
                <CourtCard 
                  key={cancha.id || idx} 
                  {...cancha} 
                  sport="futbol"
                  onClick={() => handleCanchaClick(cancha)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}