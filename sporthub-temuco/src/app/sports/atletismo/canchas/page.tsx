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

// 🏃‍♂️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏃‍♂️ ESTADOS PARA LA API
  const [pistas, setPistas] = useState<any[]>([]);
  const [filteredPistas, setFilteredPistas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPistas, setIsLoadingPistas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏃‍♂️ FUNCIÓN PARA CARGAR PISTAS MODIFICADA PARA ATLETISMO
  const cargarPistas = async () => {
    try {
      setIsLoadingPistas(true);
      setError('');
      
      console.log('🔄 [PistasAtletismo] Cargando TODAS las pistas del backend...');
      
      const todasLasPistas = await canchaService.getCanchas();
      console.log('✅ [PistasAtletismo] Todas las pistas obtenidas:', todasLasPistas);
      
      // 🏃‍♂️ FILTRAR PISTAS DE ATLETISMO
      const pistasDeAtletismo = todasLasPistas.filter((pista: any) => {
        return ['atletismo', 'pista_atletica', 'track', 'running'].includes(pista.tipo);
      });
      
      console.log('🏃‍♂️ [PistasAtletismo] Pistas de atletismo encontradas:', pistasDeAtletismo.length);
      
      // 🏃‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
      const pistasMapeadas = await Promise.all(
        pistasDeAtletismo.map(async (pista: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${pista.establecimientoId}`;
          
          // 🏃‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (pista.establecimientoId) {
            try {
              console.log(`🔍 [PistasAtletismo] Cargando complejo ID ${pista.establecimientoId} para pista ${pista.id}`);
              complejoData = await complejosService.getComplejoById(pista.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [PistasAtletismo] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [PistasAtletismo] Error cargando complejo ${pista.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(pista.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏃‍♂️ MAPEAR PISTA CON DATOS DEL COMPLEJO
          const mappedPista = {
            id: pista.id,
            imageUrl: `/sports/atletismo/pistas/Pista${pista.id}.png`,
            name: pista.nombre,
            address: addressInfo, // 🏃‍♂️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: pista.rating || 4.6,
            tags: [
              pista.techada ? "Pista cubierta" : "Pista exterior",
              pista.activa ? "Disponible" : "No disponible",
              "Pista oficial",
              "Cronometraje"
            ],
            description: `Pista de atletismo ${pista.nombre} - ID: ${pista.id}`,
            price: pista.precioPorHora?.toString() || "20",
            nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
            sport: "atletismo"
          };
          
          console.log('🗺️ [PistasAtletismo] Pista mapeada:', mappedPista);
          return mappedPista;
        })
      );
      
      console.log('🎉 [PistasAtletismo] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
      setPistas(pistasMapeadas);
      setFilteredPistas(pistasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [PistasAtletismo] ERROR cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // 🏃‍♂️ Fallback con datos estáticos de atletismo
      const pistasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/atletismo/pistas/Pista1.png",
          name: "🚨 FALLBACK - Pista Principal",
          address: "Centro de Atletismo Norte - Estadio Municipal, Av. Alemania 1234, Temuco",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "400m oficial", "8 carriles"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "20",
          nextAvailable: "06:00-07:00",
        },
        {
          id: 2,
          imageUrl: "/sports/atletismo/pistas/Pista2.png",
          name: "🚨 FALLBACK - Pista de Entrenamiento",
          address: "Pista Atlética Centro - Centro Deportivo, Av. Pedro de Valdivia 567, Temuco",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "200m entrenamiento", "6 carriles"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "15",
          nextAvailable: "16:00-17:00",
        },
        {
          id: 3,
          imageUrl: "/sports/atletismo/pistas/Pista3.png",
          name: "🚨 FALLBACK - Pista Polideportivo",
          address: "Complejo Atlético Sur - Polideportivo Municipal, Calle Montt 890, Temuco",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "400m sintética", "Salto largo"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "25",
          nextAvailable: "Mañana 08:00-09:00",
        }
      ];
      
      setPistas(pistasEstaticas);
      setFilteredPistas(pistasEstaticas);
    } finally {
      setIsLoadingPistas(false);
    }
  };

  // 🏃‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO DE ATLETISMO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Centro de Atletismo Norte",
        direccion: "Estadio Municipal, Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Pista Atlética Centro", 
        direccion: "Centro Deportivo, Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Complejo Atlético Sur",
        direccion: "Polideportivo Municipal, Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Centro de Atletismo",
        direccion: "Estadio Municipal, Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏃‍♂️ CARGAR PISTAS AL MONTAR EL COMPONENTE
  useEffect(() => {
    cargarPistas();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredPistas(pistas);
    } else {
      const filtered = pistas.filter(pista =>
        pista.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pista.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPistas(filtered);
    }
  };

  const handleBackToAtletismo = () => {
    router.push('/sports/atletismo');
  };

  const availableNow = filteredPistas.filter(pista => 
    pista.nextAvailable !== "No disponible hoy" && 
    !pista.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  // 🏃‍♂️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarPistas();
  };

  // 🏃‍♂️ MANEJADOR DE CLICK EN PISTA
  const handlePistaClick = (track: any) => {
    console.log('Navegando a pista:', track);
    router.push(`/sports/atletismo/canchas/canchaseleccionada?id=${track.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏃‍♂️</div>
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

        {/* 🏃‍♂️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏃‍♂️ MENSAJE DE CARGA */}
        {isLoadingPistas && (
          <div className={styles.loadingMessage}>
            <span>🏃‍♂️</span>
            <span>Cargando pistas de atletismo...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de atletismo</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#3B82F6'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Estadios..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#3B82F6'}}>📅</span>
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
                <span style={{color: '#1E40AF'}}>💰</span>
                <span>Precio (max $hr)</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#60A5FA'}}>🏃‍♂️</span>
                <span>Tipo de pista</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pista</option>
                <option>Pista oficial (400m)</option>
                <option>Pista de entrenamiento</option>
                <option>Pista cubierta</option>
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

        {/* Mensaje de no resultados */}
        {filteredPistas.length === 0 && searchTerm && !isLoadingPistas && (
          <div className={styles.noResults}>
            <h3>No se encontraron pistas de atletismo para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPistas(pistas);}}>
              Ver todas las pistas de atletismo
            </button>
          </div>
        )}

        {/* 🏃‍♂️ MENSAJE CUANDO NO HAY PISTAS EN LA BD */}
        {filteredPistas.length === 0 && !searchTerm && !isLoadingPistas && !error && (
          <div className={styles.noData}>
            <h3>🏃‍♂️ No hay pistas de atletismo registradas</h3>
            <p>Aún no se han registrado pistas de atletismo en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingPistas && filteredPistas.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredPistas.map((pista, idx) => (
                <CourtCard 
                  key={pista.id || idx} 
                  {...pista} 
                  sport="atletismo"
                  onClick={() => handlePistaClick(pista)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}