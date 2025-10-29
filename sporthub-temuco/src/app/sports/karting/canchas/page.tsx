'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './canchas.module.css';
import { complejosService } from '../../../../services/complejosService';

// 🏁 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏁 ESTADOS PARA LA API
  const [pistas, setPistas] = useState<any[]>([]);
  const [filteredPistas, setFilteredPistas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPistas, setIsLoadingPistas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏁 FUNCIÓN PARA CARGAR PISTAS MODIFICADA PARA KARTING
  const cargarPistas = async () => {
    try {
      setIsLoadingPistas(true);
      setError('');
      
      console.log('🔄 [PistasKarting] Cargando TODAS las pistas del backend...');
      
      const todasLasPistas = await canchaService.getCanchas();
      console.log('✅ [PistasKarting] Todas las pistas obtenidas:', todasLasPistas);
      
      // 🏁 FILTRAR PISTAS DE KARTING
      const pistasDeKarting = todasLasPistas.filter((pista: any) => {
        return ['karting', 'kart', 'automovilismo'].includes(pista.tipo);
      });
      
      console.log('🏁 [PistasKarting] Pistas de karting encontradas:', pistasDeKarting.length);
      
      // 🏁 OBTENER DATOS DE COMPLEJOS PARA CADA PISTA
      const pistasMapeadas = await Promise.all(
        pistasDeKarting.map(async (pista: any) => {
          let complejoData = null;
          let addressInfo = `Kartódromo ${pista.establecimientoId}`;
          
          // 🏁 INTENTAR OBTENER DATOS DEL COMPLEJO
          if (pista.establecimientoId) {
            try {
              console.log(`🔍 [PistasKarting] Cargando complejo ID ${pista.establecimientoId} para pista ${pista.id}`);
              complejoData = await complejosService.getComplejoById(pista.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [PistasKarting] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [PistasKarting] Error cargando complejo ${pista.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(pista.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏁 MAPEAR PISTA CON DATOS DEL COMPLEJO
          const mappedPista = {
            id: pista.id,
            imageUrl: `/sports/karting/pistas/Pista${pista.id}.png`,
            name: pista.nombre,
            address: addressInfo, // 🏁 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: pista.rating || 4.7,
            tags: [
              pista.techada ? "Pista cubierta" : "Pista exterior",
              pista.activa ? "Disponible" : "No disponible",
              "Karting",
              "Cronómetro"
            ],
            description: `Pista de karting ${pista.nombre} - ID: ${pista.id}`,
            price: pista.precioPorHora?.toString() || "45",
            nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
            sport: "karting"
          };
          
          console.log('🗺️ [PistasKarting] Pista mapeada:', mappedPista);
          return mappedPista;
        })
      );
      
      console.log('🎉 [PistasKarting] Pistas con datos de complejo cargadas:', pistasMapeadas.length);
      setPistas(pistasMapeadas);
      setFilteredPistas(pistasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [PistasKarting] ERROR cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // 🏁 Fallback con datos estáticos de karting
      const pistasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/karting/pistas/Pista1.png",
          name: "🚨 FALLBACK - Kartódromo Norte",
          address: "Kartódromo Norte - Av. Alemania 1234, Temuco",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Cronómetro", "Karting Pro"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "45",
          nextAvailable: "15:00-16:00",
        },
        {
          id: 2,
          imageUrl: "/sports/karting/pistas/Pista2.png",
          name: "🚨 FALLBACK - Kartódromo Centro",
          address: "Kartódromo Centro - Av. Pedro de Valdivia 567, Temuco",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "Pista Rápida", "Karting"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "40",
          nextAvailable: "18:00-19:00",
        },
        {
          id: 3,
          imageUrl: "/sports/karting/pistas/Pista3.png",
          name: "🚨 FALLBACK - Kartódromo Sur",
          address: "Kartódromo Sur - Calle Montt 890, Temuco",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Circuito Técnico", "Pro"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "50",
          nextAvailable: "Mañana 10:00-11:00",
        }
      ];
      
      setPistas(pistasEstaticas);
      setFilteredPistas(pistasEstaticas);
    } finally {
      setIsLoadingPistas(false);
    }
  };

  // 🏁 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO DE KARTING
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Kartódromo Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Kartódromo Centro", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Kartódromo Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Kartódromo",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏁 CARGAR PISTAS AL MONTAR EL COMPONENTE
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

  const handleBackToKarting = () => {
    router.push('/sports/karting');
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

  // 🏁 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarPistas();
  };

  // 🏁 MANEJADOR DE CLICK EN PISTA
  const handlePistaClick = (track: any) => {
    console.log('Navegando a kartódromo:', track);
    router.push(`/sports/karting/canchas/canchaseleccionada?id=${track.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="karting" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏁</div>
            <h1 className={styles.headerTitle}>Karting</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del kartódromo"
              sport="karting" 
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
            onClick={handleBackToKarting}
          >
            <span>←</span>
            <span>Karting</span>
          </button>
        </div>

        {/* 🏁 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏁 MENSAJE DE CARGA */}
        {isLoadingPistas && (
          <div className={styles.loadingMessage}>
            <span>🏁</span>
            <span>Cargando kartódromos...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar kartódromos</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#FF6B00'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Norte, Centro, Sur, Kartódromo..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#FF6B00'}}>📅</span>
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
                <span style={{color: '#E65100'}}>💰</span>
                <span>Precio (max $sesión)</span>
              </label>
              <input
                type="range"
                min="0"
                max="80"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#D84315'}}>🏁</span>
                <span>Tipo de kart</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de kart</option>
                <option>Kart recreativo</option>
                <option>Kart profesional</option>
                <option>Kart eléctrico</option>
                <option>Kart de competición</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar kartódromos</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredPistas.length === 0 && searchTerm && !isLoadingPistas && (
          <div className={styles.noResults}>
            <h3>No se encontraron kartódromos para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPistas(pistas);}}>
              Ver todos los kartódromos
            </button>
          </div>
        )}

        {/* 🏁 MENSAJE CUANDO NO HAY PISTAS EN LA BD */}
        {filteredPistas.length === 0 && !searchTerm && !isLoadingPistas && !error && (
          <div className={styles.noData}>
            <h3>🏁 No hay kartódromos registrados</h3>
            <p>Aún no se han registrado kartódromos en el sistema</p>
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
                  sport="karting"
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