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

// 🏊‍♂️ IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🏊‍♂️ ESTADOS PARA LA API
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🏊‍♂️ FUNCIÓN PARA CARGAR PILETAS MODIFICADA PARA NATACIÓN
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [PiletasNatacion] Cargando TODAS las canchas del backend...');
      
      const todasLasCanchas = await canchaService.getCanchas();
      console.log('✅ [PiletasNatacion] Todas las canchas obtenidas:', todasLasCanchas);
      
      // 🏊‍♂️ FILTRAR PILETAS DE NATACIÓN
      const piletasDeNatacion = todasLasCanchas.filter((cancha: any) => {
        return ['natacion', 'swimming', 'pileta', 'piscina'].includes(cancha.tipo.toLowerCase());
      });
      
      console.log('🏊‍♂️ [PiletasNatacion] Piletas de natación encontradas:', piletasDeNatacion.length);
      
      // 🏊‍♂️ OBTENER DATOS DE COMPLEJOS PARA CADA PILETA
      const canchasMapeadas = await Promise.all(
        piletasDeNatacion.map(async (cancha: any) => {
          let complejoData = null;
          let addressInfo = `Complejo ${cancha.establecimientoId}`;
          
          // 🏊‍♂️ INTENTAR OBTENER DATOS DEL COMPLEJO
          if (cancha.establecimientoId) {
            try {
              console.log(`🔍 [PiletasNatacion] Cargando complejo ID ${cancha.establecimientoId} para pileta ${cancha.id}`);
              complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
              
              if (complejoData) {
                addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
                console.log(`✅ [PiletasNatacion] Complejo cargado: ${addressInfo}`);
              }
              
            } catch (complejoError: any) {
              console.warn(`⚠️ [PiletasNatacion] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
              // Usar datos de fallback
              const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
              addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
            }
          }
          
          // 🏊‍♂️ MAPEAR PILETA CON DATOS DEL COMPLEJO
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/natacion/piletas/Pileta${cancha.id}.png`,
            name: cancha.nombre,
            address: addressInfo, // 🏊‍♂️ USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
            rating: cancha.rating || 4.6,
            tags: [
              cancha.techada ? "Pileta Techada" : "Pileta Exterior",
              cancha.activa ? "Disponible" : "No disponible",
              "Agua Climatizada"
            ],
            description: `Pileta de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "20",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [PiletasNatacion] Pileta mapeada:', mappedCancha);
          return mappedCancha;
        })
      );
      
      console.log('🎉 [PiletasNatacion] Piletas con datos de complejo cargadas:', canchasMapeadas.length);
      setCanchas(canchasMapeadas);
      setFilteredCanchas(canchasMapeadas);
      
    } catch (error: any) {
      console.error('❌ [PiletasNatacion] ERROR cargando piletas:', error);
      setError(`Error: ${error.message}`);
      
      // 🏊‍♂️ Fallback con datos estáticos de natación
      const fallbackPiletas = [
        {
          id: 1,
          imageUrl: "/sports/natacion/natacion.png",
          name: "Centro Acuático Elite",
          address: "Centro Acuático Norte - Av. Alemania 1234, Temuco, Chile",
          rating: 4.7,
          tags: ["Techada", "Disponible", "Agua Climatizada"],
          description: "Pileta olímpica profesional con agua climatizada",
          price: "20",
          nextAvailable: "Disponible ahora",
          sport: "natacion"
        },
        {
          id: 2,
          imageUrl: "/sports/natacion/natacion.png",
          name: "Pileta Olímpica Central",
          address: "Complejo Natación Centro - Av. Pedro de Valdivia 567, Temuco, Chile",
          rating: 4.5,
          tags: ["Exterior", "Disponible", "50 metros"],
          description: "Pileta olímpica de 50 metros con 8 carriles",
          price: "25",
          nextAvailable: "Disponible ahora",
          sport: "natacion"
        },
        {
          id: 3,
          imageUrl: "/sports/natacion/natacion.png",
          name: "Pileta Semi-Olímpica Sur",
          address: "Club Acuático Sur - Calle Montt 890, Temuco, Chile",
          rating: 4.8,
          tags: ["Techada", "Disponible", "25 metros"],
          description: "Pileta semi-olímpica ideal para entrenamiento",
          price: "18",
          nextAvailable: "Disponible ahora",
          sport: "natacion"
        }
      ];
      
      setCanchas(fallbackPiletas);
      setFilteredCanchas(fallbackPiletas);
    } finally {
      setIsLoadingCanchas(false);
    }
  };

  // 🏊‍♂️ FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
  const getStaticComplejoData = (establecimientoId: number) => {
    const staticComplejos = {
      1: {
        nombre: "Centro Acuático Norte",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      },
      2: {
        nombre: "Complejo Natación Centro", 
        direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
      },
      3: {
        nombre: "Club Acuático Sur",
        direccion: "Calle Montt 890, Temuco, Chile"
      },
      default: {
        nombre: "Centro Acuático",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

  // 🏊‍♂️ CARGAR PILETAS AL MONTAR EL COMPONENTE
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

  const handleBackToNatacion = () => {
    router.push('/sports/natacion');
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

  // 🏊‍♂️ FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarCanchas();
  };

  // 🏊‍♂️ MANEJADOR DE CLICK EN PILETA
  const handleCanchaClick = (court: any) => {
    console.log('Navegando a pileta:', court);
    router.push(`/sports/natacion/piletas/piletaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="natacion" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏊‍♂️</div>
            <h1 className={styles.headerTitle}>Natación</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pileta"
              sport="natacion" 
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
            onClick={handleBackToNatacion}
          >
            <span>←</span>
            <span>Natación</span>
          </button>
        </div>

        {/* 🏊‍♂️ MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🏊‍♂️ MENSAJE DE CARGA */}
        {isLoadingCanchas && (
          <div className={styles.loadingMessage}>
            <span>🏊‍♂️</span>
            <span>Cargando piletas de natación...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar piletas de natación</h3>
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
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#1d4ed8'}}>🏊‍♂️</span>
                <span>Tipo de pileta</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de pileta</option>
                <option>Olímpica (50m)</option>
                <option>Semi-olímpica (25m)</option>
                <option>Recreativa</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar piletas</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron piletas de natación para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las piletas de natación
            </button>
          </div>
        )}

        {/* 🏊‍♂️ MENSAJE CUANDO NO HAY PILETAS EN LA BD */}
        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🏊‍♂️</div>
              <h3 className={styles.noDataTitle}>No hay piletas de natación registradas</h3>
              <p className={styles.noDataText}>Aún no se han registrado piletas de natación en el sistema</p>
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
                  sport="natacion"
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