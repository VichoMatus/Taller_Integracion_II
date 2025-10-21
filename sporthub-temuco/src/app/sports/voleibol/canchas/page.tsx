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

// 🏐 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏐 ESTADOS PARA LA API
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏐 FUNCIÓN PARA CARGAR CANCHAS MODIFICADA PARA VOLEIBOL
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CanchasVoleibol] Cargando TODAS las canchas del backend...');
      
      const todasLasCanchas = await canchaService.getCanchas();
      console.log('✅ [CanchasVoleibol] Todas las canchas obtenidas:', todasLasCanchas);
      
      // 🏐 FILTRAR CANCHAS DE VOLEIBOL
      const canchasDeVoleibol = todasLasCanchas.filter((cancha: any) => {
        return ['voleibol', 'volleyball', 'voley'].includes(cancha.tipo.toLowerCase());
      });
      
      console.log('🏐 [CanchasVoleibol] Canchas de voleibol encontradas:', canchasDeVoleibol.length);
      
      // 🏐 OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
      const canchasMapeadas = await Promise.all(
        canchasDeVoleibol.map(async (cancha: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${cancha.establecimientoId}`;
          
          // 🏐 INTENTAR OBTENER DATOS DEL COMPLEJO
          if (cancha.establecimientoId) {
            try {
              console.log(`🔍 [CanchasVoleibol] Cargando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
              complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [CanchasVoleibol] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [CanchasVoleibol] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏐 MAPEAR CANCHA CON DATOS DEL COMPLEJO
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/voleibol/canchas/Cancha${cancha.id}.png`,
            name: cancha.nombre,
            address: addressInfo, // 🏐 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: cancha.rating || 4.6,
            tags: [
              cancha.techada ? "Techada" : "Al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Red Profesional"
            ],
            description: `Cancha de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "20",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [CanchasVoleibol] Cancha mapeada:', mappedCancha);
          return mappedCancha;
        })
      );
      
      console.log('🎉 [CanchasVoleibol] Canchas con datos de complejo cargadas:', canchasMapeadas.length);
      setCanchas(canchasMapeadas);
      setFilteredCanchas(canchasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [CanchasVoleibol] ERROR cargando canchas:', error);
      setError(`Error: ${error.message}`);
      
      // 🏐 Fallback con datos estáticos de voleibol
      const fallbackCanchas = [
        {
          id: 1,
          imageUrl: "/sports/voleibol/voleibol.png",
          name: "Club Voleibol Elite",
          address: "Club Voleibol Elite - Av. Alemania 1234, Temuco, Chile",
          rating: 4.7,
          tags: ["Techada", "Disponible", "Red Profesional"],
          description: "Cancha de voleibol profesional con red reglamentaria",
          price: "20",
          nextAvailable: "Disponible ahora",
          sport: "voleibol"
        },
        {
          id: 2,
          imageUrl: "/sports/voleibol/voleibol.png",
          name: "Centro Deportivo Voleibol",
          address: "Centro Deportivo Voleibol - Av. Pedro de Valdivia 567, Temuco, Chile",
          rating: 4.5,
          tags: ["Al aire libre", "Disponible", "Arena Profesional"],
          description: "Cancha de voleibol con superficie de arena",
          price: "18",
          nextAvailable: "Disponible ahora",
          sport: "voleibol"
        },
        {
          id: 3,
          imageUrl: "/sports/voleibol/voleibol.png",
          name: "Voleibol Club Temuco",
          address: "Voleibol Club Temuco - Calle Montt 890, Temuco, Chile",
          rating: 4.8,
          tags: ["Techada", "Disponible", "Piso Flotante"],
          description: "Cancha de voleibol con piso de madera flotante",
          price: "25",
          nextAvailable: "Disponible ahora",
          sport: "voleibol"
        }
      ];
      
      setCanchas(fallbackCanchas);
      setFilteredCanchas(fallbackCanchas);
    } finally {
      setIsLoadingCanchas(false);
    }
  };

  // 🏐 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Club Voleibol Elite",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Centro Deportivo Voleibol", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Voleibol Club Temuco",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Club de Voleibol",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏐 CARGAR CANCHAS AL MONTAR EL COMPONENTE
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

  const handleBackToVoleibol = () => {
    router.push('/sports/voleibol');
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

  // 🏐 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarCanchas();
  };

  // 🏐 MANEJADOR DE CLICK EN CANCHA
  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha:', court);
    router.push(`/sports/voleibol/canchas/canchaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="voleibol" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏐</div>
            <h1 className={styles.headerTitle}>Voleibol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha"
              sport="voleibol" 
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
            onClick={handleBackToVoleibol}
          >
            <span>←</span>
            <span>Voleibol</span>
          </button>
        </div>

        {/* 🏐 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏐 MENSAJE DE CARGA */}
        {isLoadingCanchas && (
          <div className={styles.loadingMessage}>
            <span>🏐</span>
            <span>Cargando canchas de voleibol...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de voleibol</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#ef4444'}}>📍</span>
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
                <span style={{color: '#ef4444'}}>📅</span>
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
                <span style={{color: '#dc2626'}}>💰</span>
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
                <span style={{color: '#b91c1c'}}>🏐</span>
                <span>Tipo de superficie</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de superficie</option>
                <option>Piso flotante</option>
                <option>Arena</option>
                <option>Caucho</option>
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
            <h3>No se encontraron canchas de voleibol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de voleibol
            </button>
          </div>
        )}

        {/* 🏐 MENSAJE CUANDO NO HAY CANCHAS EN LA BD */}
        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🏐</div>
              <h3 className={styles.noDataTitle}>No hay canchas de voleibol registradas</h3>
              <p className={styles.noDataText}>Aún no se han registrado canchas de voleibol en el sistema</p>
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
                  sport="voleibol"
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