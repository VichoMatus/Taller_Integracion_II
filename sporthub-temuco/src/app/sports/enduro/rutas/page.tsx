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

// 🏍️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏍️ ESTADOS PARA LA API
  const [rutas, setRutas] = useState<any[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingRutas, setIsLoadingRutas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏍️ FUNCIÓN PARA CARGAR RUTAS MODIFICADA PARA ENDURO
  const cargarRutas = async () => {
    try {
      setIsLoadingRutas(true);
      setError('');
      
      console.log('🔄 [RutasEnduro] Cargando TODAS las rutas del backend...');
      
      const todasLasRutas = await canchaService.getCanchas();
      console.log('✅ [RutasEnduro] Todas las rutas obtenidas:', todasLasRutas);
      
      // 🏍️ FILTRAR RUTAS DE ENDURO
      const rutasDeEnduro = todasLasRutas.filter((ruta: any) => {
        return ['enduro', 'motocross', 'cross country'].includes(ruta.tipo.toLowerCase());
      });
      
      console.log('🏍️ [RutasEnduro] Rutas de enduro encontradas:', rutasDeEnduro.length);
      
      // 🏍️ OBTENER DATOS DE COMPLEJOS PARA CADA RUTA
      const rutasMapeadas = await Promise.all(
        rutasDeEnduro.map(async (ruta: any) => {
          let complejoData = null;
          let addressInfo = `Base ${ruta.establecimientoId}`;
          
          // 🏍️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (ruta.establecimientoId) {
            try {
              console.log(`🔍 [RutasEnduro] Cargando complejo ID ${ruta.establecimientoId} para ruta ${ruta.id}`);
              complejoData = await complejosService.getComplejoById(ruta.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [RutasEnduro] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [RutasEnduro] Error cargando complejo ${ruta.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(ruta.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏍️ MAPEAR RUTA CON DATOS DEL COMPLEJO
          const mappedRuta = {
            id: ruta.id,
            imageUrl: `/sports/enduro/rutas/Ruta${ruta.id}.png`,
            name: ruta.nombre,
            address: addressInfo, // 🏍️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: ruta.rating || 4.8,
            tags: [
              ruta.techada ? "Techada" : "Al aire libre",
              ruta.activa ? "Disponible" : "No disponible",
              "Terreno Extremo"
            ],
            description: `Ruta de ${ruta.tipo} ${ruta.nombre} - ID: ${ruta.id}`,
            price: ruta.precioPorHora?.toString() || "45",
            nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
            sport: ruta.tipo
          };
          
          console.log('🗺️ [RutasEnduro] Ruta mapeada:', mappedRuta);
          return mappedRuta;
        })
      );
      
      console.log('🎉 [RutasEnduro] Rutas con datos de complejo cargadas:', rutasMapeadas.length);
      setRutas(rutasMapeadas);
      setFilteredRutas(rutasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [RutasEnduro] ERROR cargando rutas:', error);
      setError(`Error: ${error.message}`);
      
      // 🏍️ Fallback con datos estáticos de enduro
      const fallbackRutas = [
        {
          id: 1,
          imageUrl: "/sports/enduro/enduro.png",
          name: "Ruta Nahuelbuta",
          address: "Base Enduro Norte - Cordillera de Nahuelbuta, Temuco",
          rating: 4.9,
          tags: ["Al aire libre", "Disponible", "Terreno Extremo"],
          description: "Ruta de enduro en la Cordillera de Nahuelbuta",
          price: "45",
          nextAvailable: "Disponible ahora",
          sport: "enduro"
        },
        {
          id: 2,
          imageUrl: "/sports/enduro/enduro.png",
          name: "Ruta Cordillera",
          address: "Centro Enduro Cordillera - Ruta 5 Sur Km 675, Temuco",
          rating: 4.7,
          tags: ["Al aire libre", "Disponible", "Cross Country"],
          description: "Ruta de cross country en la cordillera",
          price: "50",
          nextAvailable: "Disponible ahora",
          sport: "enduro"
        },
        {
          id: 3,
          imageUrl: "/sports/enduro/enduro.png",
          name: "Ruta Araucanía",
          address: "Base Enduro Araucanía - Camino a Cunco, Temuco",
          rating: 4.8,
          tags: ["Al aire libre", "Disponible", "Motocross"],
          description: "Ruta de motocross en la región de la Araucanía",
          price: "40",
          nextAvailable: "Disponible ahora",
          sport: "enduro"
        }
      ];
      
      setRutas(fallbackRutas);
      setFilteredRutas(fallbackRutas);
    } finally {
      setIsLoadingRutas(false);
    }
  };

  // 🏍️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Base Enduro Norte",
        direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
      },
      2: {
        nombre: "Centro Enduro Cordillera", 
        direccion: "Ruta 5 Sur Km 675, Temuco, Chile"
      },
      3: {
        nombre: "Base Enduro Araucanía",
        direccion: "Camino a Cunco, Temuco, Chile"
      },
      default: {
        nombre: "Base de Enduro",
        direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏍️ CARGAR RUTAS AL MONTAR EL COMPONENTE
  useEffect(() => {
    cargarRutas();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredRutas(rutas);
    } else {
      const filtered = rutas.filter(ruta =>
        ruta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRutas(filtered);
    }
  };

  const handleBackToEnduro = () => {
    router.push('/sports/enduro');
  };

  const availableNow = filteredRutas.filter(ruta => 
    ruta.nextAvailable !== "No disponible hoy" && 
    !ruta.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  // 🏍️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarRutas();
  };

  // 🏍️ MANEJADOR DE CLICK EN RUTA
  const handleRutaClick = (route: any) => {
    console.log('Navegando a ruta:', route);
    router.push(`/sports/enduro/rutas/rutaseleccionada?id=${route.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="enduro" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏍️</div>
            <h1 className={styles.headerTitle}>Enduro</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta"
              sport="enduro" 
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
            onClick={handleBackToEnduro}
          >
            <span>←</span>
            <span>Enduro</span>
          </button>
        </div>

        {/* 🏍️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏍️ MENSAJE DE CARGA */}
        {isLoadingRutas && (
          <div className={styles.loadingMessage}>
            <span>🏍️</span>
            <span>Cargando rutas de enduro...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas de enduro</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#dc2626'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Nahuelbuta, Cordillera, Araucanía..."
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
                <span>Precio (max $/día)</span>
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
                <span style={{color: '#991b1b'}}>🏍️</span>
                <span>Tipo de ruta</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de enduro</option>
                <option>Enduro</option>
                <option>Motocross</option>
                <option>Cross Country</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar rutas</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredRutas.length === 0 && searchTerm && !isLoadingRutas && (
          <div className={styles.noResults}>
            <h3>No se encontraron rutas de enduro para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas de enduro
            </button>
          </div>
        )}

        {/* 🏍️ MENSAJE CUANDO NO HAY RUTAS EN LA BD */}
        {filteredRutas.length === 0 && !searchTerm && !isLoadingRutas && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🏍️</div>
              <h3 className={styles.noDataTitle}>No hay rutas de enduro registradas</h3>
              <p className={styles.noDataText}>Aún no se han registrado rutas de enduro en el sistema</p>
              <button className={styles.refreshButton} onClick={handleRefresh}>Actualizar</button>
            </div>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingRutas && filteredRutas.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredRutas.map((ruta, idx) => (
                <CourtCard 
                  key={ruta.id || idx} 
                  {...ruta} 
                  sport="enduro"
                  onClick={() => handleRutaClick(ruta)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}