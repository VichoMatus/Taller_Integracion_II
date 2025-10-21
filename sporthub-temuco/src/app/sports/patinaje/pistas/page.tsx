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

// ⛸️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // ⛸️ ESTADOS PARA LA API
  const [pistas, setPistas] = useState<any[]>([]);
  const [filteredPistas, setFilteredPistas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPistas, setIsLoadingPistas] = useState(true);
  const [error, setError] = useState<string>('');

  // ⛸️ FUNCIÓN PARA CARGAR PISTAS MODIFICADA PARA PATINAJE
  const cargarPistas = async () => {
    try {
      setIsLoadingPistas(true);
      setError('');
      
      console.log('🔄 [CanchasPatinaje] Cargando TODAS las canchas del backend...');
      
      const todasLasCanchas = await canchaService.getCanchas();
      console.log('✅ [CanchasPatinaje] Todas las canchas obtenidas:', todasLasCanchas);
      
      // ⛸️ FILTRAR PISTAS DE PATINAJE
      const pistasDePatinaje = todasLasCanchas.filter((cancha: any) => {
        return ['patinaje', 'pista de hielo', 'skating', 'hockey sobre hielo'].includes(cancha.tipo.toLowerCase());
      });
      
      console.log('⛸️ [CanchasPatinaje] Pistas de patinaje encontradas:', pistasDePatinaje.length);
      
      // ⛸️ OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
      const pistasMapeadas = await Promise.all(
        pistasDePatinaje.map(async (cancha: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${cancha.establecimientoId}`;
          
          // ⛸️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (cancha.establecimientoId) {
            try {
              console.log(`🔍 [CanchasPatinaje] Cargando complejo ID ${cancha.establecimientoId} para pista ${cancha.id}`);
              complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [CanchasPatinaje] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [CanchasPatinaje] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // ⛸️ MAPEAR PISTA CON DATOS DEL COMPLEJO
          const mappedPista = {
            id: cancha.id,
            imageUrl: `/sports/patinaje/pistas/Pista${cancha.id}.png`,
            name: cancha.nombre,
            address: addressInfo, // ⛸️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: cancha.rating || 4.8,
            tags: [
              cancha.techada ? "Techada" : "Al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Superficie de Hielo"
            ],
            description: `Pista de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "20",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [CanchasPatinaje] Pista mapeada:', mappedPista);
          return mappedPista;
        })
      );
      
      console.log('🎉 [CanchasPatinaje] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
      setPistas(pistasMapeadas);
      setFilteredPistas(pistasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [CanchasPatinaje] ERROR cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // ⛸️ Fallback con datos estáticos de patinaje
      const fallbackPistas = [
        {
          id: 1,
          imageUrl: "/sports/patinaje/patinaje.png",
          name: "Pista de Hielo Norte",
          address: "Pista de Hielo Norte - Av. Alemania 1234, Temuco, Chile",
          rating: 4.9,
          tags: ["Techada", "Disponible", "Superficie de Hielo"],
          description: "Pista de patinaje profesional con superficie de hielo",
          price: "25",
          nextAvailable: "Disponible ahora",
          sport: "patinaje"
        },
        {
          id: 2,
          imageUrl: "/sports/patinaje/patinaje.png",
          name: "Centro de Patinaje Centro",
          address: "Centro de Patinaje Centro - Av. Pedro de Valdivia 567, Temuco, Chile",
          rating: 4.7,
          tags: ["Techada", "Disponible", "Patinaje Artístico"],
          description: "Centro especializado en patinaje artístico",
          price: "20",
          nextAvailable: "Disponible ahora",
          sport: "patinaje"
        },
        {
          id: 3,
          imageUrl: "/sports/patinaje/patinaje.png",
          name: "Patinodromo Sur",
          address: "Patinodromo Sur - Calle Montt 890, Temuco, Chile",
          rating: 4.8,
          tags: ["Al aire libre", "Disponible", "Hockey sobre Hielo"],
          description: "Pista especializada en hockey sobre hielo",
          price: "22",
          nextAvailable: "Disponible ahora",
          sport: "patinaje"
        }
      ];
      
      setPistas(fallbackPistas);
      setFilteredPistas(fallbackPistas);
    } finally {
      setIsLoadingPistas(false);
    }
  };

  // ⛸️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Pista de Hielo Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Centro de Patinaje Centro", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Patinodromo Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Centro de Patinaje",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // ⛸️ CARGAR PISTAS AL MONTAR EL COMPONENTE
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

  const handleBackToPatinaje = () => {
    router.push('/sports/patinaje');
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

  // ⛸️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarPistas();
  };

  // ⛸️ MANEJADOR DE CLICK EN PISTA
  const handlePistaClick = (court: any) => {
    console.log('Navegando a pista:', court);
    router.push(`/sports/patinaje/pistas/pistaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="patinaje" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⛸️</div>
            <h1 className={styles.headerTitle}>Patinaje</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="patinaje" 
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
            onClick={handleBackToPatinaje}
          >
            <span>←</span>
            <span>Patinaje</span>
          </button>
        </div>

        {/* ⛸️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* ⛸️ MENSAJE DE CARGA */}
        {isLoadingPistas && (
          <div className={styles.loadingMessage}>
            <span>⛸️</span>
            <span>Cargando pistas de patinaje...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de patinaje</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#3b82f6'}}>📍</span>
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
                <span style={{color: '#3b82f6'}}>📅</span>
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
                <span style={{color: '#2563eb'}}>💰</span>
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
                <span style={{color: '#1d4ed8'}}>⛸️</span>
                <span>Tipo de patinaje</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de patinaje</option>
                <option>Patinaje artístico</option>
                <option>Hockey sobre hielo</option>
                <option>Patinaje recreativo</option>
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
            <h3>No se encontraron pistas de patinaje para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPistas(pistas);}}>
              Ver todas las pistas de patinaje
            </button>
          </div>
        )}

        {/* ⛸️ MENSAJE CUANDO NO HAY PISTAS EN LA BD */}
        {filteredPistas.length === 0 && !searchTerm && !isLoadingPistas && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>⛸️</div>
              <h3 className={styles.noDataTitle}>No hay pistas de patinaje registradas</h3>
              <p className={styles.noDataText}>Aún no se han registrado pistas de patinaje en el sistema</p>
              <button className={styles.refreshButton} onClick={handleRefresh}>Actualizar</button>
            </div>
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
                  sport="patinaje"
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