'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';
import { complejosService } from '../../../../services/complejosService';

// 🏉 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏉 ESTADOS PARA LA API
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏉 FUNCIÓN PARA CARGAR CANCHAS MODIFICADA PARA RUGBY
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CanchasRugby] Cargando TODAS las canchas del backend...');
      
      const todasLasCanchas = await canchaService.getCanchas();
      console.log('✅ [CanchasRugby] Todas las canchas obtenidas:', todasLasCanchas);
      
      // 🏉 FILTRAR CANCHAS DE RUGBY
      const canchasDeRugby = todasLasCanchas.filter((cancha: any) => {
        return ['rugby', 'rugby 7', 'rugby 15'].includes(cancha.tipo.toLowerCase());
      });
      
      console.log('🏉 [CanchasRugby] Canchas de rugby encontradas:', canchasDeRugby.length);
      
      // 🏉 OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
      const canchasMapeadas = await Promise.all(
        canchasDeRugby.map(async (cancha: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${cancha.establecimientoId}`;
          
          // 🏉 INTENTAR OBTENER DATOS DEL COMPLEJO
          if (cancha.establecimientoId) {
            try {
              console.log(`🔍 [CanchasRugby] Cargando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
              complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [CanchasRugby] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [CanchasRugby] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏉 MAPEAR CANCHA CON DATOS DEL COMPLEJO
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/rugby/canchas/Cancha${cancha.id}.png`,
            name: cancha.nombre,
            address: addressInfo, // 🏉 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: cancha.rating || 4.7,
            tags: [
              cancha.techada ? "Techada" : "Al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Postes H Profesionales"
            ],
            description: `Cancha de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "35",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [CanchasRugby] Cancha mapeada:', mappedCancha);
          return mappedCancha;
        })
      );
      
      console.log('🎉 [CanchasRugby] Canchas con datos de complejo cargadas:', canchasMapeadas.length);
      setCanchas(canchasMapeadas);
      setFilteredCanchas(canchasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [CanchasRugby] ERROR cargando canchas:', error);
      setError(`Error: ${error.message}`);
      
      // 🏉 Fallback con datos estáticos de rugby
      const fallbackCanchas = [
        {
          id: 1,
          imageUrl: "/sports/rugby/rugby.png",
          name: "Club Rugby Elite",
          address: "Club Rugby Elite - Av. Alemania 1234, Temuco, Chile",
          rating: 4.8,
          tags: ["Al aire libre", "Disponible", "Postes H Profesionales"],
          description: "Cancha de rugby profesional con postes H reglamentarios",
          price: "35",
          nextAvailable: "Disponible ahora",
          sport: "rugby"
        },
        {
          id: 2,
          imageUrl: "/sports/rugby/rugby.png",
          name: "Centro Deportivo Rugby",
          address: "Centro Deportivo Rugby - Av. Pedro de Valdivia 567, Temuco, Chile",
          rating: 4.6,
          tags: ["Al aire libre", "Disponible", "Rugby 7"],
          description: "Cancha de rugby adaptada para Rugby 7",
          price: "30",
          nextAvailable: "Disponible ahora",
          sport: "rugby"
        },
        {
          id: 3,
          imageUrl: "/sports/rugby/rugby.png",
          name: "Rugby Club Temuco",
          address: "Rugby Club Temuco - Calle Montt 890, Temuco, Chile",
          rating: 4.9,
          tags: ["Al aire libre", "Disponible", "Rugby 15"],
          description: "Cancha de rugby profesional para Rugby 15",
          price: "40",
          nextAvailable: "Disponible ahora",
          sport: "rugby"
        }
      ];
      
      setCanchas(fallbackCanchas);
      setFilteredCanchas(fallbackCanchas);
    } finally {
      setIsLoadingCanchas(false);
    }
  };

  // 🏉 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Club Rugby Elite",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Centro Deportivo Rugby", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Rugby Club Temuco",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Club de Rugby",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏉 CARGAR CANCHAS AL MONTAR EL COMPONENTE
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

  // 🏉 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarCanchas();
  };

  // 🏉 MANEJADOR DE CLICK EN CANCHA
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

        {/* 🏉 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏉 MENSAJE DE CARGA */}
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
                <span style={{color: '#dc2626'}}>📍</span>
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
                <span style={{color: '#dc2626'}}>📅</span>
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
                <span style={{color: '#b91c1c'}}>💰</span>
                <span>Precio (max $hr)</span>
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
                <span style={{color: '#991b1b'}}>🏉</span>
                <span>Tipo de rugby</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de rugby</option>
                <option>Rugby 15</option>
                <option>Rugby 7</option>
                <option>Rugby Touch</option>
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
            <h3>No se encontraron canchas de rugby para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de rugby
            </button>
          </div>
        )}

        {/* 🏉 MENSAJE CUANDO NO HAY CANCHAS EN LA BD */}
        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🏉</div>
              <h3 className={styles.noDataTitle}>No hay canchas de rugby registradas</h3>
              <p className={styles.noDataText}>Aún no se han registrado canchas de rugby en el sistema</p>
              <button className={styles.refreshButton} onClick={handleRefresh}>Actualizar</button>
            </div>
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