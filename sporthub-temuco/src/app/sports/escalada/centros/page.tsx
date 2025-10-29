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

// 🧗‍♂️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🧗‍♂️ ESTADOS PARA LA API
  const [centros, setCentros] = useState<any[]>([]);
  const [filteredCentros, setFilteredCentros] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCentros, setIsLoadingCentros] = useState(true);
  const [error, setError] = useState<string>('');

  // 🧗‍♂️ FUNCIÓN PARA CARGAR CENTROS MODIFICADA PARA ESCALADA
  const cargarCentros = async () => {
    try {
      setIsLoadingCentros(true);
      setError('');
      
      console.log('🔄 [CentrosEscalada] Cargando TODAS las instalaciones del backend...');
      
      const todasLasInstalaciones = await canchaService.getCanchas();
      console.log('✅ [CentrosEscalada] Todas las instalaciones obtenidas:', todasLasInstalaciones);
      
      // 🧗‍♂️ FILTRAR INSTALACIONES DE ESCALADA
      const centrosDeEscalada = todasLasInstalaciones.filter((instalacion: any) => {
        return ['escalada', 'climbing', 'rocodromo', 'boulder'].includes(instalacion.tipo.toLowerCase());
      });
      
      console.log('🧗‍♂️ [CentrosEscalada] Centros de escalada encontrados:', centrosDeEscalada.length);
      
      // 🧗‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA CENTRO
      const centrosMapeados = await Promise.all(
        centrosDeEscalada.map(async (centro: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${centro.establecimientoId}`;
          
          // 🧗‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (centro.establecimientoId) {
            try {
              console.log(`🔍 [CentrosEscalada] Cargando complejo ID ${centro.establecimientoId} para centro ${centro.id}`);
              complejoData = await complejosService.getComplejoById(centro.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [CentrosEscalada] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [CentrosEscalada] Error cargando complejo ${centro.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(centro.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🧗‍♂️ MAPEAR CENTRO CON DATOS DEL COMPLEJO
          const mappedCentro = {
            id: centro.id,
            imageUrl: `/sports/escalada/centros/Centro${centro.id}.png`,
            name: centro.nombre,
            address: addressInfo,
            rating: centro.rating || 4.7,
            tags: [
              centro.techada ? "Techado" : "Al aire libre",
              centro.activa ? "Disponible" : "No disponible",
              "Muros de Escalada"
            ],
            description: `Centro de ${centro.tipo} ${centro.nombre} - ID: ${centro.id}`,
            price: centro.precioPorHora?.toString() || "18",
            nextAvailable: centro.activa ? "Disponible ahora" : "No disponible",
            sport: centro.tipo
          };
          
          console.log('🗺️ [CentrosEscalada] Centro mapeado:', mappedCentro);
          return mappedCentro;
        })
      );
      
      console.log('🎉 [CentrosEscalada] Centros con datos de complejo cargados:', centrosMapeados.length);
      setCentros(centrosMapeados);
      setFilteredCentros(centrosMapeados);
      
    } catch (error: any) {
      console.error('❌ [CentrosEscalada] ERROR cargando centros:', error);
      setError(`Error: ${error.message}`);
      
      // 🧗‍♂️ Fallback con datos estáticos de escalada
      const fallbackCentros = [
        {
          id: 1,
          imageUrl: "/sports/escalada/escalada.png",
          name: "Centro de Escalada Norte",
          address: "Centro de Escalada Norte - Av. Alemania 1234, Temuco, Chile",
          rating: 4.8,
          tags: ["Techado", "Disponible", "Muros de Escalada"],
          description: "Centro de escalada con múltiples rutas",
          price: "18",
          nextAvailable: "Disponible ahora",
          sport: "escalada"
        },
        {
          id: 2,
          imageUrl: "/sports/escalada/escalada.png",
          name: "Rocódromo Centro",
          address: "Rocódromo Centro - Av. Pedro de Valdivia 567, Temuco, Chile",
          rating: 4.6,
          tags: ["Techado", "Disponible", "Boulder"],
          description: "Rocódromo especializado en boulder",
          price: "15",
          nextAvailable: "Disponible ahora",
          sport: "escalada"
        },
        {
          id: 3,
          imageUrl: "/sports/escalada/escalada.png",
          name: "Climbing Wall Sur",
          address: "Climbing Wall Sur - Calle Montt 890, Temuco, Chile",
          rating: 4.9,
          tags: ["Al aire libre", "Disponible", "Escalada Natural"],
          description: "Muro de escalada al aire libre",
          price: "22",
          nextAvailable: "Disponible ahora",
          sport: "escalada"
        }
      ];
      
      setCentros(fallbackCentros);
      setFilteredCentros(fallbackCentros);
    } finally {
      setIsLoadingCentros(false);
    }
  };

  // 🧗‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Centro de Escalada Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Rocódromo Centro", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Climbing Wall Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Centro de Escalada",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🧗‍♂️ CARGAR CENTROS AL MONTAR EL COMPONENTE
  useEffect(() => {
    cargarCentros();
  }, []);

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

  // 🧗‍♂️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarCentros();
  };

  // 🧗‍♂️ MANEJADOR DE CLICK EN CENTRO
  const handleCentroClick = (center: any) => {
    console.log('Navegando a centro:', center);
    router.push(`/sports/escalada/centros/centroseleccionado?id=${center.id}`);
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
              placeholder="Nombre del centro"
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

        {/* 🧗‍♂️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🧗‍♂️ MENSAJE DE CARGA */}
        {isLoadingCentros && (
          <div className={styles.loadingMessage}>
            <span>🧗‍♂️</span>
            <span>Cargando centros de escalada...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar centros de escalada</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#7c3aed'}}>📍</span>
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
                <span style={{color: '#7c3aed'}}>📅</span>
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
                <span style={{color: '#6d28d9'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#5b21b6'}}>🧗‍♂️</span>
                <span>Tipo de escalada</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de escalada</option>
                <option>Boulder</option>
                <option>Escalada deportiva</option>
                <option>Escalada tradicional</option>
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
        {filteredCentros.length === 0 && searchTerm && !isLoadingCentros && (
          <div className={styles.noResults}>
            <h3>No se encontraron centros de escalada para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCentros(centros);}}>
              Ver todos los centros de escalada
            </button>
          </div>
        )}

        {/* 🧗‍♂️ MENSAJE CUANDO NO HAY CENTROS EN LA BD */}
        {filteredCentros.length === 0 && !searchTerm && !isLoadingCentros && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🧗‍♂️</div>
              <h3 className={styles.noDataTitle}>No hay centros de escalada registrados</h3>
              <p className={styles.noDataText}>Aún no se han registrado centros de escalada en el sistema</p>
              <button className={styles.refreshButton} onClick={handleRefresh}>Actualizar</button>
            </div>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingCentros && filteredCentros.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredCentros.map((centro, idx) => (
                <CourtCard 
                  key={centro.id || idx} 
                  {...centro} 
                  sport="escalada"
                  onClick={() => handleCentroClick(centro)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}