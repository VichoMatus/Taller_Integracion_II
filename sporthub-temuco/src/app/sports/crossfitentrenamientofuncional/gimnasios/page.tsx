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

  // 🔥 FUNCIÓN PARA CARGAR GIMNASIOS DE CROSSFIT
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CrossFitGimnasios] Cargando gimnasios individuales del backend...');
      
      // 🔥 IDs de los gimnasios de CrossFit que quieres mostrar
      const crossfitCanchaIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const canchasPromises = crossfitCanchaIds.map(async (id) => {
        try {
          console.log(`🔍 [CrossFitGimnasios] Cargando gimnasio ID: ${id}`);
          const cancha = await canchaService.getCanchaById(id);
          console.log(`✅ [CrossFitGimnasios] Gimnasio ${id} obtenido:`, cancha);
          
          // 🔥 FILTRAR SOLO GIMNASIOS DE CROSSFIT/ENTRENAMIENTO FUNCIONAL
          if (cancha.tipo !== 'crossfit' && cancha.tipo !== 'entrenamiento_funcional') {
            console.log(`⚠️ [CrossFitGimnasios] Gimnasio ${id} no es de CrossFit/Entrenamiento Funcional (${cancha.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio${cancha.id}.png`,
            name: cancha.nombre,
            address: `Complejo ${cancha.establecimientoId}`,
            rating: cancha.rating || 4.7,
            tags: [
              cancha.techada ? "Gimnasio techado" : "Espacio al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Equipamiento completo",
              "Entrenadores certificados"
            ],
            description: `Gimnasio de CrossFit ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "30",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: "crossfitentrenamientofuncional"
          };
          
          console.log('🗺️ [CrossFitGimnasios] Gimnasio mapeado:', mappedCancha);
          return mappedCancha;
          
        } catch (error) {
          console.log(`❌ [CrossFitGimnasios] Error cargando gimnasio ${id}:`, error);
          return null;
        }
      });
      
      const canchasResults = await Promise.all(canchasPromises);
      const canchasValidas = canchasResults.filter(cancha => cancha !== null);
      
      console.log('🎉 [CrossFitGimnasios] Gimnasios de CrossFit cargados exitosamente:', canchasValidas.length);
      console.log('📋 [CrossFitGimnasios] Gimnasios finales:', canchasValidas);
      
      setCanchas(canchasValidas);
      setFilteredCanchas(canchasValidas);
      
    } catch (error: any) {
      console.error('❌ [CrossFitGimnasios] ERROR DETALLADO cargando gimnasios:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [CrossFitGimnasios] USANDO FALLBACK - Error en el API');
      const canchasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio1.png",
          name: "🚨 FALLBACK - CrossFit Centro",
          address: "Norte, Centro, Sur",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Equipamiento completo", "Estacionamiento"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "30",
          nextAvailable: "20:00-21:00",
        },
        {
          id: 2,
          imageUrl: "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio2.png",
          name: "🚨 FALLBACK - CrossFit Norte",
          address: "Sector Norte",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Entrenadores certificados"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "25",
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

  const handleBackToCrossFit = () => {
    router.push('/sports/crossfitentrenamientofuncional');
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
    console.log('Navegando a gimnasio:', court);
    router.push(`/sports/crossfitentrenamientofuncional/gimnasios/gimnasioseleccionado?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏋️</div>
            <h1 className={styles.headerTitle}>CrossFit & Entrenamiento Funcional</h1>
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

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToCrossFit}
          >
            <span>←</span>
            <span>CrossFit & Entrenamiento Funcional</span>
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
            <span>🏋️</span>
            <span>Cargando gimnasios de CrossFit...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar gimnasios de CrossFit</h3>
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
                <span>Precio (max por sesión)</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#15803d'}}>🏋️</span>
                <span>Tipo de gimnasio</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de gimnasio</option>
                <option>CrossFit Box</option>
                <option>Entrenamiento Funcional</option>
                <option>Gimnasio híbrido</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar gimnasios</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron gimnasios de CrossFit para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todos los gimnasios de CrossFit
            </button>
          </div>
        )}

        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <h3>🏋️ No hay gimnasios de CrossFit registrados</h3>
            <p>Aún no se han registrado gimnasios de CrossFit/Entrenamiento Funcional en el sistema</p>
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
                  sport="crossfitentrenamientofuncional"
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