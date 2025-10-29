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

// 🚵‍♂️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🚵‍♂️ ESTADOS PARA LA API
  const [rutas, setRutas] = useState<any[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingRutas, setIsLoadingRutas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🚵‍♂️ FUNCIÓN PARA CARGAR RUTAS MODIFICADA PARA MOUNTAIN BIKE
  const cargarRutas = async () => {
    try {
      setIsLoadingRutas(true);
      setError('');
      
      console.log('🔄 [RutasMTB] Cargando TODAS las rutas del backend...');
      
      const todasLasRutas = await canchaService.getCanchas();
      console.log('✅ [RutasMTB] Todas las rutas obtenidas:', todasLasRutas);
      
      // 🚵‍♂️ FILTRAR RUTAS DE MOUNTAIN BIKE
      const rutasDeMTB = todasLasRutas.filter((ruta: any) => {
        return ['mountain bike', 'mtb', 'ciclismo', 'bicicleta'].includes(ruta.tipo.toLowerCase());
      });
      
      console.log('🚵‍♂️ [RutasMTB] Rutas de mountain bike encontradas:', rutasDeMTB.length);
      
      // 🚵‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA RUTA
      const rutasMapeadas = await Promise.all(
        rutasDeMTB.map(async (ruta: any) => {
          let complejoData = null;
          let addressInfo = `Centro MTB ${ruta.establecimientoId}`;
          
          // 🚵‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (ruta.establecimientoId) {
            try {
              console.log(`🔍 [RutasMTB] Cargando complejo ID ${ruta.establecimientoId} para ruta ${ruta.id}`);
              complejoData = await complejosService.getComplejoById(ruta.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [RutasMTB] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [RutasMTB] Error cargando complejo ${ruta.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(ruta.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🚵‍♂️ MAPEAR RUTA CON DATOS DEL COMPLEJO
          const mappedRuta = {
            id: ruta.id,
            imageUrl: `/sports/mountain-bike/rutas/Ruta${ruta.id}.png`,
            name: ruta.nombre,
            address: addressInfo, // 🚵‍♂️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: ruta.rating || 4.6,
            tags: [
              ruta.techada ? "Sendero Cubierto" : "Sendero Abierto",
              ruta.activa ? "Disponible" : "No disponible",
              "Sendero Natural"
            ],
            description: `Ruta de ${ruta.tipo} ${ruta.nombre} - ID: ${ruta.id}`,
            price: ruta.precioPorHora?.toString() || "25",
            nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
            sport: ruta.tipo
          };
          
          console.log('🗺️ [RutasMTB] Ruta mapeada:', mappedRuta);
          return mappedRuta;
        })
      );
      
      console.log('🎉 [RutasMTB] Rutas con datos de complejo cargadas:', rutasMapeadas.length);
      setRutas(rutasMapeadas);
      setFilteredRutas(rutasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [RutasMTB] ERROR cargando rutas:', error);
      setError(`Error: ${error.message}`);
      
      // 🚵‍♂️ Fallback con datos estáticos de mountain bike
      const fallbackRutas = [
        {
          id: 1,
          imageUrl: "/sports/mountain-bike/mountain-bike.png",
          name: "Sendero Cordillera",
          address: "Centro MTB Cordillera - Cordillera de Nahuelbuta, Temuco, Chile",
          rating: 4.7,
          tags: ["Sendero Abierto", "Disponible", "Dificultad Media"],
          description: "Ruta de mountain bike con vistas panorámicas de la cordillera",
          price: "25",
          nextAvailable: "Disponible ahora",
          sport: "mountain bike"
        },
        {
          id: 2,
          imageUrl: "/sports/mountain-bike/mountain-bike.png",
          name: "Ruta del Bosque",
          address: "Base Mountain Bike Sur - Camino a Cunco Km 15, Temuco, Chile",
          rating: 4.5,
          tags: ["Sendero Natural", "Disponible", "Dificultad Alta"],
          description: "Sendero técnico a través del bosque nativo",
          price: "30",
          nextAvailable: "Disponible ahora",
          sport: "mountain bike"
        },
        {
          id: 3,
          imageUrl: "/sports/mountain-bike/mountain-bike.png",
          name: "Trail Araucanía",
          address: "MTB Park Araucanía - Ruta 5 Sur Km 680, Temuco, Chile",
          rating: 4.8,
          tags: ["Sendero Técnico", "Disponible", "Dificultad Extrema"],
          description: "Trail de alta dificultad para ciclistas expertos",
          price: "35",
          nextAvailable: "Disponible ahora",
          sport: "mountain bike"
        }
      ];
      
      setRutas(fallbackRutas);
      setFilteredRutas(fallbackRutas);
    } finally {
      setIsLoadingRutas(false);
    }
  };

  // 🚵‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Centro MTB Cordillera",
        direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
      },
      2: {
        nombre: "Base Mountain Bike Sur", 
        direccion: "Camino a Cunco Km 15, Temuco, Chile"
      },
      3: {
        nombre: "MTB Park Araucanía",
        direccion: "Ruta 5 Sur Km 680, Temuco, Chile"
      },
      default: {
        nombre: "Centro de Mountain Bike",
        direccion: "Cordillera de Nahuelbuta, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🚵‍♂️ CARGAR RUTAS AL MONTAR EL COMPONENTE
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

  const handleBackToMountainBike = () => {
    router.push('/sports/mountain-bike');
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

  // 🚵‍♂️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarRutas();
  };

  // 🚵‍♂️ MANEJADOR DE CLICK EN RUTA
  const handleRutaClick = (route: any) => {
    console.log('Navegando a ruta:', route);
    router.push(`/sports/mountain-bike/rutas/rutaseleccionada?id=${route.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="mountain-bike" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚵‍♂️</div>
            <h1 className={styles.headerTitle}>Mountain Bike</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta"
              sport="mountain-bike" 
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
            onClick={handleBackToMountainBike}
          >
            <span>←</span>
            <span>Mountain Bike</span>
          </button>
        </div>

        {/* 🚵‍♂️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🚵‍♂️ MENSAJE DE CARGA */}
        {isLoadingRutas && (
          <div className={styles.loadingMessage}>
            <span>🚵‍♂️</span>
            <span>Cargando rutas de mountain bike...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas de mountain bike</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#ea580c'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Cordillera, Valle, Bosque..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#ea580c'}}>📅</span>
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
                <span>Precio (max $/día)</span>
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
                <span style={{color: '#b91c1c'}}>🏔️</span>
                <span>Dificultad</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Nivel de dificultad</option>
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
                <option>Experto</option>
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
            <h3>No se encontraron rutas de mountain bike para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas de mountain bike
            </button>
          </div>
        )}

        {/* 🚵‍♂️ MENSAJE CUANDO NO HAY RUTAS EN LA BD */}
        {filteredRutas.length === 0 && !searchTerm && !isLoadingRutas && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🚵‍♂️</div>
              <h3 className={styles.noDataTitle}>No hay rutas de mountain bike registradas</h3>
              <p className={styles.noDataText}>Aún no se han registrado rutas de mountain bike en el sistema</p>
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
                  sport="mountain-bike"
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