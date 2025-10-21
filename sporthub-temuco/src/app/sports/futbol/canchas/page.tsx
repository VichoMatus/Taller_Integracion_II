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

// 🔥 IMPORTAR SERVICIO (igual que en la página principal)
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 ESTADOS PARA LA API (usando la misma lógica de /sports/futbol/page.tsx)
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR CANCHAS (copiada exactamente de /sports/futbol/page.tsx)
// 🔥 FUNCIÓN PARA CARGAR CANCHAS MODIFICADA
const cargarCanchas = async () => {
  try {
    setIsLoadingCanchas(true);
    setError('');
    
    console.log('🔄 [CanchasFutbol] Cargando TODAS las canchas del backend...');
    
    const todasLasCanchas = await canchaService.getCanchas();
    console.log('✅ [CanchasFutbol] Todas las canchas obtenidas:', todasLasCanchas);
    
    // 🔥 FILTRAR CANCHAS DE FÚTBOL, FUTSAL Y FUTBOLITO
    const canchasDeFutbol = todasLasCanchas.filter((cancha: any) => {
      return ['futbol', 'futsal', 'futbolito'].includes(cancha.tipo);
    });
    
    console.log('⚽ [CanchasFutbol] Canchas de fútbol/futsal/futbolito encontradas:', canchasDeFutbol.length);
    
    // 🔥 OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
    const canchasMapeadas = await Promise.all(
      canchasDeFutbol.map(async (cancha: any) => {
        let complejoData = null;
        let addressInfo = `Complejo ${cancha.establecimientoId}`;
        
        // 🔥 INTENTAR OBTENER DATOS DEL COMPLEJO
        if (cancha.establecimientoId) {
          try {
            console.log(`🔍 [CanchasFutbol] Cargando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
            complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
            
            if (complejoData) {
              addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
              console.log(`✅ [CanchasFutbol] Complejo cargado: ${addressInfo}`);
            }
            
          } catch (complejoError: any) {
            console.warn(`⚠️ [CanchasFutbol] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
            // Usar datos de fallback
            const staticComplejo = getStaticComplejoData(cancha.establecimientoId);
            addressInfo = `${staticComplejo.nombre} - ${staticComplejo.direccion}`;
          }
        }
        
        // 🔥 MAPEAR CANCHA CON DATOS DEL COMPLEJO
        const mappedCancha = {
          id: cancha.id,
          imageUrl: `/sports/futbol/canchas/Cancha${cancha.id}.png`,
          name: cancha.nombre,
          address: addressInfo, // 🔥 USAR NOMBRE Y DIRECCIÓN REAL DEL COMPLEJO
          rating: cancha.rating || 4.5,
          tags: [
            cancha.techada ? "Techada" : "Al aire libre",
            cancha.activa ? "Disponible" : "No disponible",
            cancha.tipo.charAt(0).toUpperCase() + cancha.tipo.slice(1)
          ],
          description: `Cancha de ${cancha.tipo} ${cancha.nombre} - ID: ${cancha.id}`,
          price: cancha.precioPorHora?.toString() || "25",
          nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
          sport: cancha.tipo
        };
        
        console.log('🗺️ [CanchasFutbol] Cancha mapeada:', mappedCancha);
        return mappedCancha;
      })
    );
    
    console.log('🎉 [CanchasFutbol] Canchas con datos de complejo cargadas:', canchasMapeadas.length);
    setCanchas(canchasMapeadas);
    setFilteredCanchas(canchasMapeadas);
    
  } catch (error: any) {
    console.error('❌ [CanchasFutbol] ERROR cargando canchas:', error);
    setError(`Error: ${error.message}`);
    
    // Fallback con datos estáticos...
  } finally {
    setIsLoadingCanchas(false);
  }
};

// 🔥 FUNCIÓN PARA DATOS ESTÁTICOS DE COMPLEJO
const getStaticComplejoData = (establecimientoId: number) => {
  const staticComplejos = {
    1: {
      nombre: "Complejo Deportivo Norte",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    },
    2: {
      nombre: "Complejo Deportivo Centro", 
      direccion: "Av. Pedro de Valdivia 567, Temuco, Chile"
    },
    3: {
      nombre: "Complejo Deportivo Sur",
      direccion: "Calle Montt 890, Temuco, Chile"
    },
    default: {
      nombre: "Complejo Deportivo",
      direccion: "Av. Alemania 1234, Temuco, Chile"
    }
  };
  
  return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
};

  // 🔥 CARGAR CANCHAS AL MONTAR EL COMPONENTE
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

  const handleBackToFootball = () => {
    router.push('/sports/futbol');
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

  // 🔥 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarCanchas();
  };

  // 🔥 MANEJADOR DE CLICK EN CANCHA (como en la página principal)
  const handleCanchaClick = (court: any) => {
    console.log('Navegando a cancha:', court);
    router.push(`/sports/futbol/canchas/canchaseleccionada?id=${court.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="futbol" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>Fútbol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha"
              sport="futbol" 
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
            onClick={handleBackToFootball}
          >
            <span>←</span>
            <span>Fútbol</span>
          </button>
        </div>

        {/* 🔥 MENSAJE DE ERROR CON INDICADOR DE FALLBACK */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🔥 MENSAJE DE CARGA */}
        {isLoadingCanchas && (
          <div className={styles.loadingMessage}>
            <span>⚽</span>
            <span>Cargando canchas de fútbol...</span>
          </div>
        )}

        

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de fútbol</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#22c55e'}}>📍</span>
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
                <span style={{color: '#22c55e'}}>📅</span>
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
                <span style={{color: '#16a34a'}}>💰</span>
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
                <span style={{color: '#15803d'}}>🌱</span>
                <span>Tipo de césped</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de césped</option>
                <option>Césped natural</option>
                <option>Césped sintético</option>
                <option>Césped híbrido</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar canchas</span>
            </button>
          </div>
        </div>

        {/* Mensaje de no resultados */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron canchas de fútbol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de fútbol
            </button>
          </div>
        )}

        {/* 🔥 MENSAJE CUANDO NO HAY CANCHAS EN LA BD */}
        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noData}>
            <h3>⚽ No hay canchas de fútbol registradas</h3>
            <p>Aún no se han registrado canchas de fútbol en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
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
                  sport="futbol"
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