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

  // 🔥 FUNCIÓN PARA CARGAR PISTAS DE ATLETISMO
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [AtletismoCanchas] Cargando pistas individuales del backend...');
      
      // 🔥 IDs de las pistas de atletismo que quieres mostrar
      const atletismoCanchaIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const canchasPromises = atletismoCanchaIds.map(async (id) => {
        try {
          console.log(`🔍 [AtletismoCanchas] Cargando pista ID: ${id}`);
          const cancha = await canchaService.getCanchaById(id);
          console.log(`✅ [AtletismoCanchas] Pista ${id} obtenida:`, cancha);
          
          // 🔥 FILTRAR SOLO PISTAS DE ATLETISMO
          if (cancha.tipo !== 'atletismo') {
            console.log(`⚠️ [AtletismoCanchas] Pista ${id} no es de atletismo (${cancha.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/atletismo/canchas/Cancha${cancha.id}.png`,
            name: cancha.nombre,
            address: `Complejo ${cancha.establecimientoId}`,
            rating: cancha.rating || 4.5,
            tags: [
              cancha.techada ? "Pista techada" : "Pista al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Cronometraje",
              "Áreas de salto"
            ],
            description: `Pista de atletismo ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "21",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [AtletismoCanchas] Pista mapeada:', mappedCancha);
          return mappedCancha;
          
        } catch (error) {
          console.log(`❌ [AtletismoCanchas] Error cargando pista ${id}:`, error);
          return null;
        }
      });
      
      const canchasResults = await Promise.all(canchasPromises);
      const canchasValidas = canchasResults.filter(cancha => cancha !== null);
      
      console.log('🎉 [AtletismoCanchas] Pistas de atletismo cargadas exitosamente:', canchasValidas.length);
      console.log('📋 [AtletismoCanchas] Pistas finales:', canchasValidas);
      
      setCanchas(canchasValidas);
      setFilteredCanchas(canchasValidas);
      
    } catch (error: any) {
      console.error('❌ [AtletismoCanchas] ERROR DETALLADO cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [AtletismoCanchas] USANDO FALLBACK - Error en el API');
      const canchasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/atletismo/canchas/Cancha1.png",
          name: "🚨 FALLBACK - Atletismo Centro",
          address: "Norte, Centro, Sur",
          rating: 4.3,
          tags: ["DATOS OFFLINE", "Pista al aire libre", "Estacionamiento"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "21",
          nextAvailable: "20:00-21:00",
        },
        {
          id: 2,
          imageUrl: "/sports/atletismo/canchas/Cancha2.png",
          name: "🚨 FALLBACK - Atletismo Norte",
          address: "Sector Norte",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Pista al aire libre"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "19",
          nextAvailable: "14:30-15:30",
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

  const handleBackToAtletismo = () => {
    router.push('/sports/atletismo');
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
    console.log('Navegando a pista:', court);
    router.push(`/sports/atletismo/canchas/canchaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏃</div>
            <h1 className={styles.headerTitle}>Atletismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="atletismo" 
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
            onClick={handleBackToAtletismo}
          >
            <span>←</span>
            <span>Atletismo</span>
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
            <span>🏃</span>
            <span>Cargando pistas de atletismo...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de atletismo</h3>
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
                <span style={{color: '#15803d'}}>🏃</span>
                <span>Tipo de pista</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pista</option>
                <option>Pista al aire libre</option>
                <option>Pista techada</option>
                <option>Pista sintética</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar pistas</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron pistas de atletismo para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las pistas de atletismo
            </button>
          </div>
        )}

        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <h3>🏃 No hay pistas de atletismo registradas</h3>
            <p>Aún no se han registrado pistas de atletismo en el sistema</p>
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
                  sport="atletismo"
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