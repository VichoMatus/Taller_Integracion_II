'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 ESTADOS PARA LA API
  const [estadios, setEstadios] = useState<any[]>([]);
  const [filteredEstadios, setFilteredEstadios] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingEstadios, setIsLoadingEstadios] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR ESTADIOS DE FÚTBOL AMERICANO
  const cargarEstadios = async () => {
    try {
      setIsLoadingEstadios(true);
      setError('');
      
      console.log('🔄 [EstadiosFutbolAmericano] Cargando estadios individuales del backend...');
      
      // 🔥 IDs de los estadios de fútbol americano que quieres mostrar
      const futbolAmericanoEstadioIds = [1, 2, 3, 4, 5, 6];
      
      const estadiosPromises = futbolAmericanoEstadioIds.map(async (id) => {
        try {
          console.log(`🔍 [EstadiosFutbolAmericano] Cargando estadio ID: ${id}`);
          const estadio = await canchaService.getCanchaById(id);
          console.log(`✅ [EstadiosFutbolAmericano] Estadio ${id} obtenido:`, estadio);
          
          // 🔥 FILTRAR SOLO ESTADIOS DE FÚTBOL AMERICANO
          if (estadio.tipo !== 'futbol_americano') {
            console.log(`⚠️ [EstadiosFutbolAmericano] Estadio ${id} no es de fútbol americano (${estadio.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedEstadio = {
            id: estadio.id,
            imageUrl: `/sports/futbol-americano/estadios/Estadio${estadio.id}.png`,
            name: estadio.nombre,
            address: `Complejo ${estadio.establecimientoId}`,
            rating: estadio.rating || 4.8,
            tags: [
              estadio.techada ? "Estadio techado" : "Estadio al aire libre",
              estadio.activa ? "Disponible" : "No disponible",
              "Césped artificial",
              "Marcador electrónico"
            ],
            description: `Estadio de fútbol americano ${estadio.nombre} - ID: ${estadio.id}`,
            price: estadio.precioPorHora?.toString() || "60",
            nextAvailable: estadio.activa ? "Disponible ahora" : "No disponible",
            sport: "futbol-americano"
          };
          
          console.log('🗺️ [EstadiosFutbolAmericano] Estadio mapeado:', mappedEstadio);
          return mappedEstadio;
          
        } catch (error) {
          console.log(`❌ [EstadiosFutbolAmericano] Error cargando estadio ${id}:`, error);
          return null;
        }
      });
      
      const estadiosResults = await Promise.all(estadiosPromises);
      const estadiosValidos = estadiosResults.filter(estadio => estadio !== null);
      
      console.log('🎉 [EstadiosFutbolAmericano] Estadios de fútbol americano cargados exitosamente:', estadiosValidos.length);
      console.log('📋 [EstadiosFutbolAmericano] Estadios finales:', estadiosValidos);
      
      setEstadios(estadiosValidos);
      setFilteredEstadios(estadiosValidos);
      
    } catch (error: any) {
      console.error('❌ [EstadiosFutbolAmericano] ERROR DETALLADO cargando estadios:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [EstadiosFutbolAmericano] USANDO FALLBACK - Error en el API');
      const estadiosEstaticos = [
        {
          id: 1,
          imageUrl: "/sports/futbol-americano/estadios/Estadio1.png",
          name: "🚨 FALLBACK - Estadio Champions",
          address: "Norte, Centro, Sur",
          rating: 4.9,
          tags: ["DATOS OFFLINE", "Césped artificial", "Marcador electrónico"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "60",
          nextAvailable: "20:00-22:00",
        },
        {
          id: 2,
          imageUrl: "/sports/futbol-americano/estadios/Estadio2.png",
          name: "🚨 FALLBACK - Arena Temuco",
          address: "Sector Norte",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Estadio techado", "Graderías"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "45",
          nextAvailable: "16:00-18:00",
        }
      ];
      
      setEstadios(estadiosEstaticos);
      setFilteredEstadios(estadiosEstaticos);
    } finally {
      setIsLoadingEstadios(false);
    }
  };

  useEffect(() => {
    cargarEstadios();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEstadios(estadios);
    } else {
      const filtered = estadios.filter(estadio =>
        estadio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estadio.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEstadios(filtered);
    }
  };

  const handleBackToFutbolAmericano = () => {
    router.push('/sports/futbol-americano');
  };

  const availableNow = filteredEstadios.filter(estadio => 
    estadio.nextAvailable !== "No disponible hoy" && 
    !estadio.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleRefresh = () => {
    cargarEstadios();
  };

  const handleEstadioClick = (stadium: any) => {
    console.log('Navegando a estadio:', stadium);
    router.push(`/sports/futbol-americano/estadios/estadioseleccionado?id=${stadium.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="futbol-americano" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏈</div>
            <h1 className={styles.headerTitle}>Fútbol Americano</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del estadio"
              sport="futbol-americano" 
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
            onClick={handleBackToFutbolAmericano}
          >
            <span>←</span>
            <span>Fútbol Americano</span>
          </button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {isLoadingEstadios && (
          <div className={styles.loadingMessage}>
            <span>🏈</span>
            <span>Cargando estadios de fútbol americano...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar estadios de fútbol americano</h3>
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
                max="120"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#15803d'}}>🏈</span>
                <span>Tipo de estadio</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de estadio</option>
                <option>Estadio al aire libre</option>
                <option>Estadio techado</option>
                <option>Arena cubierta</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar estadios</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredEstadios.length === 0 && searchTerm && !isLoadingEstadios && (
          <div className={styles.noResults}>
            <h3>No se encontraron estadios de fútbol americano para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredEstadios(estadios);}}>
              Ver todos los estadios de fútbol americano
            </button>
          </div>
        )}

        {filteredEstadios.length === 0 && !searchTerm && !isLoadingEstadios && !error && (
          <div className={styles.noData}>
            <h3>🏈 No hay estadios de fútbol americano registrados</h3>
            <p>Aún no se han registrado estadios de fútbol americano en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingEstadios && filteredEstadios.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredEstadios.map((estadio, idx) => (
                <CourtCard 
                  key={estadio.id || idx} 
                  {...estadio} 
                  sport="futbol-americano"
                  onClick={() => handleEstadioClick(estadio)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}