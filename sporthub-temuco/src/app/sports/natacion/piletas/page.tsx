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
  const [piletas, setPiletas] = useState<any[]>([]);
  const [filteredPiletas, setFilteredPiletas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPiletas, setIsLoadingPiletas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR PILETAS DE NATACIÓN
  const cargarPiletas = async () => {
    try {
      setIsLoadingPiletas(true);
      setError('');
      
      console.log('🔄 [PiletasNatacion] Cargando piletas individuales del backend...');
      
      // 🔥 IDs de las piletas de natación que quieres mostrar
      const natacionPiletaIds = [1, 2, 3, 4, 5, 6, 7, 8];
      
      const piletasPromises = natacionPiletaIds.map(async (id) => {
        try {
          console.log(`🔍 [PiletasNatacion] Cargando pileta ID: ${id}`);
          const pileta = await canchaService.getCanchaById(id);
          console.log(`✅ [PiletasNatacion] Pileta ${id} obtenida:`, pileta);
          
          // 🔥 FILTRAR SOLO PILETAS DE NATACIÓN
          if (pileta.tipo !== 'natacion') {
            console.log(`⚠️ [PiletasNatacion] Pileta ${id} no es de natación (${pileta.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedPileta = {
            id: pileta.id,
            imageUrl: `/sports/natacion/piletas/Pileta${pileta.id}.png`,
            name: pileta.nombre,
            address: `Centro Acuático ${pileta.establecimientoId}`,
            rating: pileta.rating || 4.6,
            tags: [
              pileta.techada ? "Pileta techada" : "Pileta al aire libre",
              pileta.activa ? "Disponible" : "No disponible",
              "Agua climatizada",
              "Vestuarios disponibles"
            ],
            description: `Pileta de natación ${pileta.nombre} - ID: ${pileta.id}`,
            price: pileta.precioPorHora?.toString() || "18",
            nextAvailable: pileta.activa ? "Disponible ahora" : "No disponible",
            sport: "natacion"
          };
          
          console.log('🗺️ [PiletasNatacion] Pileta mapeada:', mappedPileta);
          return mappedPileta;
          
        } catch (error) {
          console.log(`❌ [PiletasNatacion] Error cargando pileta ${id}:`, error);
          return null;
        }
      });
      
      const piletasResults = await Promise.all(piletasPromises);
      const piletasValidas = piletasResults.filter(pileta => pileta !== null);
      
      console.log('🎉 [PiletasNatacion] Piletas de natación cargadas exitosamente:', piletasValidas.length);
      console.log('📋 [PiletasNatacion] Piletas finales:', piletasValidas);
      
      setPiletas(piletasValidas);
      setFilteredPiletas(piletasValidas);
      
    } catch (error: any) {
      console.error('❌ [PiletasNatacion] ERROR DETALLADO cargando piletas:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [PiletasNatacion] USANDO FALLBACK - Error en el API');
      const piletasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/natacion/piletas/Pileta1.png",
          name: "🚨 FALLBACK - Aqua Center Temuco",
          address: "Norte, Centro, Sur",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Agua climatizada", "Vestuarios"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "18",
          nextAvailable: "20:00-21:00",
        },
        {
          id: 2,
          imageUrl: "/sports/natacion/piletas/Pileta2.png",
          name: "🚨 FALLBACK - Piscina Municipal",
          address: "Sector Norte",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Pileta olimpica", "Clases grupales"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "15",
          nextAvailable: "14:30-15:30",
        }
      ];
      
      setPiletas(piletasEstaticas);
      setFilteredPiletas(piletasEstaticas);
    } finally {
      setIsLoadingPiletas(false);
    }
  };

  useEffect(() => {
    cargarPiletas();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredPiletas(piletas);
    } else {
      const filtered = piletas.filter(pileta =>
        pileta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pileta.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPiletas(filtered);
    }
  };

  const handleBackToNatacion = () => {
    router.push('/sports/natacion');
  };

  const availableNow = filteredPiletas.filter(pileta => 
    pileta.nextAvailable !== "No disponible hoy" && 
    !pileta.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleRefresh = () => {
    cargarPiletas();
  };

  const handlePiletaClick = (pool: any) => {
    console.log('Navegando a pileta:', pool);
    router.push(`/sports/natacion/piletas/piletaseleccionada?id=${pool.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="natacion" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏊</div>
            <h1 className={styles.headerTitle}>Natación</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pileta"
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

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToNatacion}
          >
            <span>←</span>
            <span>Natación</span>
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

        {isLoadingPiletas && (
          <div className={styles.loadingMessage}>
            <span>🏊</span>
            <span>Cargando piletas de natación...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar piletas de natación</h3>
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
                <span>Precio (max por hora)</span>
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
                <span style={{color: '#15803d'}}>🏊</span>
                <span>Tipo de pileta</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pileta</option>
                <option>Pileta olímpica</option>
                <option>Pileta recreativa</option>
                <option>Pileta infantil</option>
                <option>Pileta techada</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar piletas</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredPiletas.length === 0 && searchTerm && !isLoadingPiletas && (
          <div className={styles.noResults}>
            <h3>No se encontraron piletas de natación para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPiletas(piletas);}}>
              Ver todas las piletas de natación
            </button>
          </div>
        )}

        {filteredPiletas.length === 0 && !searchTerm && !isLoadingPiletas && !error && (
          <div className={styles.noData}>
            <h3>🏊 No hay piletas de natación registradas</h3>
            <p>Aún no se han registrado piletas de natación en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingPiletas && filteredPiletas.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredPiletas.map((pileta, idx) => (
                <CourtCard 
                  key={pileta.id || idx} 
                  {...pileta} 
                  sport="natacion"
                  onClick={() => handlePiletaClick(pileta)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}