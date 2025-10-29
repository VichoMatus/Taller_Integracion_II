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

// 🏈 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏈 ESTADOS PARA LA API
  const [estadios, setEstadios] = useState<any[]>([]);
  const [filteredEstadios, setFilteredEstadios] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingEstadios, setIsLoadingEstadios] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏈 FUNCIÓN PARA CARGAR ESTADIOS MODIFICADA PARA FÚTBOL AMERICANO
  const cargarEstadios = async () => {
    try {
      setIsLoadingEstadios(true);
      setError('');
      
      console.log('🔄 [EstadiosFutbolAmericano] Cargando TODAS las canchas del backend...');
      
      const todasLasCanchas = await canchaService.getCanchas();
      console.log('✅ [EstadiosFutbolAmericano] Todas las canchas obtenidas:', todasLasCanchas);
      
      // 🏈 FILTRAR ESTADIOS DE FÚTBOL AMERICANO
      const estadiosDeFutbolAmericano = todasLasCanchas.filter((cancha: any) => {
        return ['futbol americano', 'american football', 'football americano'].includes(cancha.tipo.toLowerCase());
      });
      
      console.log('🏈 [EstadiosFutbolAmericano] Estadios de fútbol americano encontrados:', estadiosDeFutbolAmericano.length);
      
      // 🏈 OBTENER DATOS DE COMPLEJOS PARA CADA ESTADIO
      const estadiosMapeados = await Promise.all(
        estadiosDeFutbolAmericano.map(async (cancha: any) => {
          let complejoData = null;
          let addressInfo = `Estadio ${cancha.establecimientoId}`;
          
          // 🏈 INTENTAR OBTENER DATOS DEL COMPLEJO
          if (cancha.establecimientoId) {
            try {
              console.log(`🔍 [EstadiosFutbolAmericano] Cargando complejo ID ${cancha.establecimientoId} para estadio ${cancha.id}`);
              complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [EstadiosFutbolAmericano] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [EstadiosFutbolAmericano] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏈 MAPEAR ESTADIO CON DATOS DEL COMPLEJO
          const mappedEstadio = {
            id: cancha.id,
            imageUrl: `/sports/futbol-americano/estadios/Estadio${cancha.id}.png`,
            name: cancha.nombre,
            address: addressInfo, // 🏈 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: cancha.rating || 4.7,
            tags: [
              cancha.techada ? "Estadio Techado" : "Estadio Exterior",
              cancha.activa ? "Disponible" : "No disponible",
              "Postes Oficiales NFL"
            ],
            description: `Estadio de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "60",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [EstadiosFutbolAmericano] Estadio mapeado:', mappedEstadio);
          return mappedEstadio;
        })
      );
      
      console.log('🎉 [EstadiosFutbolAmericano] Estadios con datos de complejo cargados:', estadiosMapeados.length);
      setEstadios(estadiosMapeados);
      setFilteredEstadios(estadiosMapeados);
      
    } catch (error: any) {
      console.error('❌ [EstadiosFutbolAmericano] ERROR cargando estadios:', error);
      setError(`Error: ${error.message}`);
      
      // 🏈 Fallback con datos estáticos de fútbol americano
      const fallbackEstadios = [
        {
          id: 1,
          imageUrl: "/sports/futbol-americano/futbol-americano.png",
          name: "Estadio Nacional Temuco",
          address: "Estadio Nacional Temuco - Av. Alemania 1234, Temuco, Chile",
          rating: 4.8,
          tags: ["Estadio Exterior", "Disponible", "Postes Oficiales NFL"],
          description: "Estadio profesional de fútbol americano con postes reglamentarios",
          price: "60",
          nextAvailable: "Disponible ahora",
          sport: "futbol americano"
        },
        {
          id: 2,
          imageUrl: "/sports/futbol-americano/futbol-americano.png",
          name: "Complejo NFL Chile",
          address: "Complejo Deportivo NFL Chile - Av. Pedro de Valdivia 567, Temuco, Chile",
          rating: 4.9,
          tags: ["Estadio Exterior", "Disponible", "Iluminación Profesional"],
          description: "Complejo deportivo especializado en fútbol americano",
          price: "75",
          nextAvailable: "Disponible ahora",
          sport: "futbol americano"
        },
        {
          id: 3,
          imageUrl: "/sports/futbol-americano/futbol-americano.png",
          name: "Estadio Araucanía Football",
          address: "Estadio Araucanía Football - Calle Montt 890, Temuco, Chile",
          rating: 4.6,
          tags: ["Estadio Exterior", "Disponible", "Campo Reglamentario"],
          description: "Estadio con campo reglamentario NFL y facilidades profesionales",
          price: "55",
          nextAvailable: "Disponible ahora",
          sport: "futbol americano"
        }
      ];
      
      setEstadios(fallbackEstadios);
      setFilteredEstadios(fallbackEstadios);
    } finally {
      setIsLoadingEstadios(false);
    }
  };

  // 🏈 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Estadio Nacional Temuco",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Complejo Deportivo NFL Chile", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Estadio Araucanía Football",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Estadio de Fútbol Americano",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏈 CARGAR ESTADIOS AL MONTAR EL COMPONENTE
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

  const handleBackToFootballAmericano = () => {
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

  // 🏈 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarEstadios();
  };

  // 🏈 MANEJADOR DE CLICK EN ESTADIO
  const handleEstadioClick = (court: any) => {
    console.log('Navegando a estadio:', court);
    router.push(`/sports/futbol-americano/estadios/estadioseleccionado?id=${court.id}`);
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
            onClick={handleBackToFootballAmericano}
          >
            <span>←</span>
            <span>Fútbol Americano</span>
          </button>
        </div>

        {/* 🏈 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏈 MENSAJE DE CARGA */}
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
                <span style={{color: '#b45309'}}>📍</span>
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
                <span style={{color: '#b45309'}}>📅</span>
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
                <span style={{color: '#92400e'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#78350f'}}>🏈</span>
                <span>Tipo de campo</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de campo</option>
                <option>Campo NFL Oficial</option>
                <option>Campo Colegial</option>
                <option>Campo de Práctica</option>
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

        {/* Mensaje de no resultados */}
        {filteredEstadios.length === 0 && searchTerm && !isLoadingEstadios && (
          <div className={styles.noResults}>
            <h3>No se encontraron estadios de fútbol americano para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredEstadios(estadios);}}>
              Ver todos los estadios de fútbol americano
            </button>
          </div>
        )}

        {/* 🏈 MENSAJE CUANDO NO HAY ESTADIOS EN LA BD */}
        {filteredEstadios.length === 0 && !searchTerm && !isLoadingEstadios && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🏈</div>
              <h3 className={styles.noDataTitle}>No hay estadios de fútbol americano registrados</h3>
              <p className={styles.noDataText}>Aún no se han registrado estadios de fútbol americano en el sistema</p>
              <button className={styles.refreshButton} onClick={handleRefresh}>Actualizar</button>
            </div>
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