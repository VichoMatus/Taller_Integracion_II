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

// 🚴‍♂️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🚴‍♂️ ESTADOS PARA LA API
  const [pistas, setPistas] = useState<any[]>([]);
  const [filteredPistas, setFilteredPistas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPistas, setIsLoadingPistas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🚴‍♂️ FUNCIÓN PARA CARGAR PISTAS MODIFICADA PARA CICLISMO
  const cargarPistas = async () => {
    try {
      setIsLoadingPistas(true);
      setError('');
      
      console.log('🔄 [PistasCiclismo] Cargando TODAS las pistas del backend...');
      
      const todasLasPistas = await canchaService.getCanchas();
      console.log('✅ [PistasCiclismo] Todas las pistas obtenidas:', todasLasPistas);
      
      // 🚴‍♂️ FILTRAR PISTAS DE CICLISMO
      const pistasDeCiclismo = todasLasPistas.filter((pista: any) => {
        return ['ciclismo', 'velodromo', 'bicicleta', 'cycling'].includes(pista.tipo);
      });
      
      console.log('🚴‍♂️ [PistasCiclismo] Pistas de ciclismo encontradas:', pistasDeCiclismo.length);
      
      // 🚴‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
      const pistasMapeadas = await Promise.all(
        pistasDeCiclismo.map(async (pista: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${pista.establecimientoId}`;
          
          // 🚴‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (pista.establecimientoId) {
            try {
              console.log(`🔍 [PistasCiclismo] Cargando complejo ID ${pista.establecimientoId} para pista ${pista.id}`);
              complejoData = await complejosService.getComplejoById(pista.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [PistasCiclismo] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [PistasCiclismo] Error cargando complejo ${pista.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(pista.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🚴‍♂️ MAPEAR PISTA CON DATOS DEL COMPLEJO
          const mappedPista = {
            id: pista.id,
            imageUrl: `/sports/ciclismo/pistas/Pista${pista.id}.png`,
            name: pista.nombre,
            address: addressInfo, // 🚴‍♂️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: pista.rating || 4.7,
            tags: [
              pista.techada ? "Pista cubierta" : "Pista exterior",
              pista.activa ? "Disponible" : "No disponible",
              "Velódromo",
              "Cronometraje"
            ],
            description: `Pista de ciclismo ${pista.nombre} - ID: ${pista.id}`,
            price: pista.precioPorHora?.toString() || "18",
            nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
            sport: "ciclismo"
          };
          
          console.log('🗺️ [PistasCiclismo] Pista mapeada:', mappedPista);
          return mappedPista;
        })
      );
      
      console.log('🎉 [PistasCiclismo] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
      setPistas(pistasMapeadas);
      setFilteredPistas(pistasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [PistasCiclismo] ERROR cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // 🚴‍♂️ Fallback con datos estáticos de ciclismo
      const pistasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/ciclismo/pistas/Pista1.png",
          name: "🚨 FALLBACK - Velódromo Principal",
          address: "Velódromo Norte - Av. Alemania 1234, Temuco",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Velódromo", "250m"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "20",
          nextAvailable: "06:00-07:00",
        },
        {
          id: 2,
          imageUrl: "/sports/ciclismo/pistas/Pista2.png",
          name: "🚨 FALLBACK - Pista de Entrenamiento",
          address: "Pista de Ciclismo Centro - Av. Pedro de Valdivia 567, Temuco",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Entrenamiento", "400m"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "15",
          nextAvailable: "16:00-17:00",
        },
        {
          id: 3,
          imageUrl: "/sports/ciclismo/pistas/Pista3.png",
          name: "🚨 FALLBACK - Circuito BMX",
          address: "Circuito Ciclístico Sur - Calle Montt 890, Temuco",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "BMX", "Obstáculos"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "12",
          nextAvailable: "Mañana 08:00-09:00",
        }
      ];
      
      setPistas(pistasEstaticas);
      setFilteredPistas(pistasEstaticas);
    } finally {
      setIsLoadingPistas(false);
    }
  };

  // 🚴‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO DE CICLISMO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Velódromo Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Pista de Ciclismo Centro", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Circuito Ciclístico Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Centro de Ciclismo",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🚴‍♂️ CARGAR PISTAS AL MONTAR EL COMPONENTE
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

  const handleBackToCiclismo = () => {
    router.push('/sports/ciclismo');
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

  // 🚴‍♂️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarPistas();
  };

  // 🚴‍♂️ MANEJADOR DE CLICK EN PISTA
  const handlePistaClick = (track: any) => {
    console.log('Navegando a pista:', track);
    router.push(`/sports/ciclismo/canchas/canchaseleccionada?id=${track.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}></div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="ciclismo" 
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
            onClick={handleBackToCiclismo}
          >
            <span>←</span>
            <span>Ciclismo</span>
          </button>
        </div>

        {/* 🚴‍♂️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🚴‍♂️ MENSAJE DE CARGA */}
        {isLoadingPistas && (
          <div className={styles.loadingMessage}>
            <span>🚴‍♂️</span>
            <span>Cargando pistas de ciclismo...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de ciclismo</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#FF6B35'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Velódromo..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#FF6B35'}}>📅</span>
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
                <span style={{color: '#E55100'}}>💰</span>
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
                <span style={{color: '#D84315'}}>🚴‍♂️</span>
                <span>Tipo de pista</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pista</option>
                <option>Velódromo</option>
                <option>Pista de entrenamiento</option>
                <option>Circuito BMX</option>
                <option>Pista de ruta</option>
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
            <h3>No se encontraron pistas de ciclismo para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPistas(pistas);}}>
              Ver todas las pistas de ciclismo
            </button>
          </div>
        )}

        {/* 🚴‍♂️ MENSAJE CUANDO NO HAY PISTAS EN LA BD */}
        {filteredPistas.length === 0 && !searchTerm && !isLoadingPistas && !error && (
          <div className={styles.noData}>
            <h3>🚴‍♂️ No hay pistas de ciclismo registradas</h3>
            <p>Aún no se han registrado pistas de ciclismo en el sistema</p>
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
                  sport="ciclismo"
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
