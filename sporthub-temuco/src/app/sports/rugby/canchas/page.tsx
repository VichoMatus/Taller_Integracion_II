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
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR CANCHAS DE RUGBY
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CanchasRugby] Cargando canchas individuales del backend...');
      
      // 🔥 IDs de las canchas de rugby que quieres mostrar
      const rugbyCanchaIds = [1, 2, 3, 4, 5, 6, 7, 8];
      
      const canchasPromises = rugbyCanchaIds.map(async (id) => {
        try {
          console.log(`🔍 [CanchasRugby] Cargando cancha ID: ${id}`);
          const cancha = await canchaService.getCanchaById(id);
          console.log(`✅ [CanchasRugby] Cancha ${id} obtenida:`, cancha);
          
          // 🔥 FILTRAR SOLO CANCHAS DE RUGBY
          if (cancha.tipo !== 'rugby') {
            console.log(`⚠️ [CanchasRugby] Cancha ${id} no es de rugby (${cancha.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/rugby/canchas/Cancha${cancha.id}.png`,
            name: cancha.nombre,
            address: `Complejo ${cancha.establecimientoId}`,
            rating: cancha.rating || 4.6,
            tags: [
              cancha.techada ? "Campo techado" : "Campo al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Césped natural",
              "Vestuarios incluidos"
            ],
            description: `Cancha de rugby ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "40",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: "rugby"
          };
          
          console.log('🗺️ [CanchasRugby] Cancha mapeada:', mappedCancha);
          return mappedCancha;
          
        } catch (error) {
          console.log(`❌ [CanchasRugby] Error cargando cancha ${id}:`, error);
          return null;
        }
      });
      
      const canchasResults = await Promise.all(canchasPromises);
      const canchasValidas = canchasResults.filter(cancha => cancha !== null);
      
      console.log('🎉 [CanchasRugby] Canchas de rugby cargadas exitosamente:', canchasValidas.length);
      console.log('📋 [CanchasRugby] Canchas finales:', canchasValidas);
      
      setCanchas(canchasValidas);
      setFilteredCanchas(canchasValidas);
      
    } catch (error: any) {
      console.error('❌ [CanchasRugby] ERROR DETALLADO cargando canchas:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [CanchasRugby] USANDO FALLBACK - Error en el API');
      const canchasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/rugby/canchas/Cancha1.png",
          name: "🚨 FALLBACK - Campo Rugby Temuco",
          address: "Norte, Centro, Sur",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Césped natural", "Vestuarios"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "40",
          nextAvailable: "15:00-17:00",
        },
        {
          id: 2,
          imageUrl: "/sports/rugby/canchas/Cancha2.png",
          name: "🚨 FALLBACK - Club Rugby Sur",
          address: "Sector Sur",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Campo reglamentario", "Graderías"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "35",
          nextAvailable: "18:00-20:00",
        }
      ];
      
      setCanchas(canchasEstaticas);
      setFilteredCanchas(canchasEstaticas);
    } finally {
      setIsLoadingCanchas(false);
    }
  };

  useEffect(() => {
    cargarCanchas();
  }, []);

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

  const handleBackToRugby = () => {
    router.push('/sports/rugby');
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

  const handleRefresh = () => {
    cargarCanchas();
  };

  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha:', court);
    router.push(`/sports/rugby/canchas/canchaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="rugby" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏉</div>
            <h1 className={styles.headerTitle}>Rugby</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha"
              sport="rugby" 
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
            onClick={handleBackToRugby}
          >
            <span>←</span>
            <span>Rugby</span>
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

        {isLoadingCanchas && (
          <div className={styles.loadingMessage}>
            <span>🏉</span>
            <span>Cargando canchas de rugby...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de rugby</h3>
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
                max="80"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#15803d'}}>🏉</span>
                <span>Tipo de campo</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Todos los campos</option>
                <option>Campo reglamentario</option>
                <option>Campo de entrenamiento</option>
                <option>Campo con graderías</option>
                <option>Campo césped natural</option>
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

        {/* Mensajes de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron canchas de rugby para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de rugby
            </button>
          </div>
        )}

        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <h3>🏉 No hay canchas de rugby registradas</h3>
            <p>Aún no se han registrado canchas de rugby en el sistema</p>
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
                  sport="rugby"
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