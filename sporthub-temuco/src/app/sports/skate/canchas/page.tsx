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

// 🛹 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🛹 ESTADOS PARA LA API
  const [pistas, setPistas] = useState<any[]>([]);
  const [filteredPistas, setFilteredPistas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPistas, setIsLoadingPistas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🛹 FUNCIÓN PARA CARGAR PISTAS MODIFICADA PARA SKATE
  const cargarPistas = async () => {
    try {
      setIsLoadingPistas(true);
      setError('');
      
      console.log('🔄 [PistasSkate] Cargando TODAS las pistas del backend...');
      
      const todasLasPistas = await canchaService.getCanchas();
      console.log('✅ [PistasSkate] Todas las pistas obtenidas:', todasLasPistas);
      
      // 🛹 FILTRAR PISTAS DE SKATE
      const pistasDeSkate = todasLasPistas.filter((pista: any) => {
        return ['skate', 'skateboard', 'skatepark'].includes(pista.tipo);
      });
      
      console.log('🛹 [PistasSkate] Pistas de skate encontradas:', pistasDeSkate.length);
      
      // 🛹 OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
      const pistasMapeadas = await Promise.all(
        pistasDeSkate.map(async (pista: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${pista.establecimientoId}`;
          
          // 🛹 INTENTAR OBTENER DATOS DEL COMPLEJO
          if (pista.establecimientoId) {
            try {
              console.log(`🔍 [PistasSkate] Cargando complejo ID ${pista.establecimientoId} para pista ${pista.id}`);
              complejoData = await complejosService.getComplejoById(pista.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [PistasSkate] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [PistasSkate] Error cargando complejo ${pista.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(pista.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🛹 MAPEAR PISTA CON DATOS DEL COMPLEJO
          const mappedPista = {
            id: pista.id,
            imageUrl: `/sports/skate/pistas/Pista${pista.id}.png`,
            name: pista.nombre,
            address: addressInfo, // 🛹 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: pista.rating || 4.6,
            tags: [
              pista.techada ? "Pista cubierta" : "Pista exterior",
              pista.activa ? "Disponible" : "No disponible",
              "Skatepark",
              "Rampas"
            ],
            description: `Pista de skate ${pista.nombre} - ID: ${pista.id}`,
            price: pista.precioPorHora?.toString() || "15",
            nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
            sport: "skate"
          };
          
          console.log('🗺️ [PistasSkate] Pista mapeada:', mappedPista);
          return mappedPista;
        })
      );
      
      console.log('🎉 [PistasSkate] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
      setPistas(pistasMapeadas);
      setFilteredPistas(pistasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [PistasSkate] ERROR cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // 🛹 Fallback con datos estáticos de skate
      const pistasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/skate/pistas/Pista1.png",
          name: "🚨 FALLBACK - Skatepark Norte",
          address: "Skatepark Norte - Av. Alemania 1234, Temuco",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Bowl", "Street"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "15",
          nextAvailable: "10:00-11:00",
        },
        {
          id: 2,
          imageUrl: "/sports/skate/pistas/Pista2.png",
          name: "🚨 FALLBACK - Skatepark Centro",
          address: "Skatepark Centro - Av. Pedro de Valdivia 567, Temuco",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Mini Ramp", "Street"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "12",
          nextAvailable: "14:00-15:00",
        },
        {
          id: 3,
          imageUrl: "/sports/skate/pistas/Pista3.png",
          name: "🚨 FALLBACK - Skatepark Sur",
          address: "Skatepark Sur - Calle Montt 890, Temuco",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Pool", "Vert"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "18",
          nextAvailable: "Mañana 09:00-10:00",
        }
      ];
      
      setPistas(pistasEstaticas);
      setFilteredPistas(pistasEstaticas);
    } finally {
      setIsLoadingPistas(false);
    }
  };

  // 🛹 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO DE SKATE
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Skatepark Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Skatepark Centro", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Skatepark Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Skatepark",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🛹 CARGAR PISTAS AL MONTAR EL COMPONENTE
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

  const handleBackToSkate = () => {
    router.push('/sports/skate');
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

  // 🛹 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarPistas();
  };

  // 🛹 MANEJADOR DE CLICK EN PISTA
  const handlePistaClick = (park: any) => {
    console.log('Navegando a skatepark:', park);
    router.push(`/sports/skate/canchas/canchaseleccionada?id=${park.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}></div>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del skatepark"
              sport="skate" 
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
            onClick={handleBackToSkate}
          >
            <span>←</span>
            <span>Skate</span>
          </button>
        </div>

        {/* 🛹 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🛹 MENSAJE DE CARGA */}
        {isLoadingPistas && (
          <div className={styles.loadingMessage}>
            <span>🛹</span>
            <span>Cargando skateparks...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar skateparks</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#FF6B35'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Skatepark..."
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
                <span style={{color: '#D84315'}}>🛹</span>
                <span>Tipo de pista</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pista</option>
                <option>Bowl</option>
                <option>Street</option>
                <option>Vert</option>
                <option>Mini Ramp</option>
                <option>Pool</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar skateparks</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredPistas.length === 0 && searchTerm && !isLoadingPistas && (
          <div className={styles.noResults}>
            <h3>No se encontraron skateparks para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPistas(pistas);}}>
              Ver todos los skateparks
            </button>
          </div>
        )}

        {/* 🛹 MENSAJE CUANDO NO HAY PISTAS EN LA BD */}
        {filteredPistas.length === 0 && !searchTerm && !isLoadingPistas && !error && (
          <div className={styles.noData}>
            <h3>🛹 No hay skateparks registrados</h3>
            <p>Aún no se han registrado skateparks en el sistema</p>
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
                  sport="skate"
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