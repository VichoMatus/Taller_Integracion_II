'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import { useComplejos } from '../../../../hooks/useComplejosCanchas';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading: isAuthLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');
  const [canchasYaCargadas, setCanchasYaCargadas] = useState(false); // 🔥 FLAG PARA EVITAR MÚLTIPLES CARGAS

  const { 
    complejos, 
    loading: loadingComplejos, 
    error: errorComplejos 
  } = useComplejos();

  // 🔥 EFECTO QUE SOLO SE EJECUTA UNA VEZ CUANDO LOS COMPLEJOS ESTÉN LISTOS
  useEffect(() => {
    console.log('🔄 [UseEffect] Estado:', {
      loadingComplejos,
      cantidadComplejos: complejos.length,
      canchasYaCargadas
    });
    
    if (!loadingComplejos && complejos.length > 0 && !canchasYaCargadas) {
      console.log('✅ [UseEffect] Condiciones cumplidas, cargando canchas...');
      cargarCanchas();
    }
  }, [loadingComplejos, complejos.length, canchasYaCargadas]); // 🔥 DEPENDENCIAS ESPECÍFICAS

  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CanchasFutbol] Iniciando carga de canchas...');
      console.log('📸 [SNAPSHOT] Complejos disponibles:', complejos.length);
      console.log('📸 [SNAPSHOT] IDs:', complejos.map(c => `${c.id_complejo}: ${c.nombre}`));
      
      const response: any = await canchaService.getCanchas();
      
      let todasLasCanchas: any[] = [];
      
      if (Array.isArray(response)) {
        todasLasCanchas = response;
      } else if (response && Array.isArray(response.data)) {
        todasLasCanchas = response.data;
      } else if (response && Array.isArray(response.canchas)) {
        todasLasCanchas = response.canchas;
      } else if (response && Array.isArray(response.items)) {
        todasLasCanchas = response.items;
      } else if (response && Array.isArray(response.results)) {
        todasLasCanchas = response.results;
      } else {
        const allKeys = Object.keys(response || {});
        for (const key of allKeys) {
          if (Array.isArray(response[key])) {
            todasLasCanchas = response[key];
            break;
          }
        }
        
        if (todasLasCanchas.length === 0) {
          throw new Error(`No se encontró array de canchas`);
        }
      }
      
      console.log(`📊 Total canchas extraídas: ${todasLasCanchas.length}`);
      
      const canchasDeFutbol = todasLasCanchas.filter((cancha: any) => {
        return ['futbol', 'futsal', 'futbolito'].includes(cancha.tipo);
      });
      
      console.log(`⚽ Canchas de fútbol encontradas: ${canchasDeFutbol.length}`);
      
      if (canchasDeFutbol.length === 0) {
        throw new Error('No se encontraron canchas de fútbol');
      }
      
      // 🔥 MAPEO CON VERIFICACIÓN DE QUE LOS COMPLEJOS TIENEN IDs
      const canchasMapeadas = canchasDeFutbol.map((cancha: any) => {
        let addressInfo = `Complejo ${cancha.establecimientoId || 'Desconocido'}`;
        let complejoNombre = `Complejo ${cancha.establecimientoId || 'Desconocido'}`;
        let rating = cancha.rating || 4.5;
        
        if (cancha.establecimientoId && complejos.length > 0) {
          console.log(`\n🔍 Buscando complejo ID ${cancha.establecimientoId} para cancha ${cancha.id}`);
          
          // 🔥 BÚSQUEDA CON CONVERSIÓN DE TIPOS Y VERIFICACIÓN
          const complejoData = complejos.find(c => {
            const idComplejo = c.id_complejo;
            const idBuscado = cancha.establecimientoId;
            
            // Convertir ambos a número para comparar
            const match = Number(idComplejo) === Number(idBuscado);
            
            if (match) {
              console.log(`  ✅ MATCH encontrado: ${idComplejo} === ${idBuscado}`);
            }
            
            return match;
          });
          
          if (complejoData) {
            complejoNombre = complejoData.nombre;
            addressInfo = `${complejoData.nombre} - ${complejoData.direccion}`;
            rating = complejoData.rating_promedio || cancha.rating || 4.5;
            
            console.log(`  ✅ Complejo asignado: ${complejoData.nombre}`);
          } else {
            console.error(`  ❌ No se encontró complejo con ID ${cancha.establecimientoId}`);
            console.error(`  📋 IDs disponibles:`, complejos.map(c => c.id_complejo));
            
            // Usar datos estáticos como fallback
            const staticData = getStaticComplejoData(cancha.establecimientoId);
            complejoNombre = staticData.nombre;
            addressInfo = `${staticData.nombre} - ${staticData.direccion}`;
          }
        }
        
        return {
          id: cancha.id,
          imageUrl: `/sports/futbol/canchas/Cancha${cancha.id}.png`,
          name: cancha.nombre || `Cancha ${cancha.id}`,
          address: addressInfo,
          rating: rating,
          tags: [
            cancha.techada ? "Techada" : "Al aire libre",
            cancha.activa ? "Disponible" : "No disponible", 
            cancha.tipo.charAt(0).toUpperCase() + cancha.tipo.slice(1)
          ],
          description: `Cancha de ${cancha.tipo} en ${complejoNombre}`,
          price: cancha.precioPorHora?.toString() || "25",
          nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
          sport: cancha.tipo,
          establecimientoId: cancha.establecimientoId,
          techada: cancha.techada,
          activa: cancha.activa,
          complejoNombre: complejoNombre
        };
      });
      
      console.log('\n🎉 Canchas mapeadas correctamente:', canchasMapeadas.length);
      console.log('📋 Resumen:');
      canchasMapeadas.forEach(c => {
        console.log(`  ${c.name} -> ${c.address}`);
      });
      
      setCanchas(canchasMapeadas);
      setFilteredCanchas(canchasMapeadas);
      setCanchasYaCargadas(true); // 🔥 MARCAR COMO CARGADAS
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(`Error: ${error.message}`);
      
      // Fallback
      const canchasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/futbol/canchas/Cancha1.png",
          name: "🚨 FALLBACK - Fútbol Centro",
          address: "🚨 FALLBACK - Complejo Deportivo Norte - Av. Alemania 1234, Temuco",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación"],
          description: "🚨 Datos de fallback - API no disponible",
          price: "35",
          nextAvailable: "Próximo: 20:00-21:00",
          sport: "futbol",
          establecimientoId: 1,
          techada: false,
          activa: true,
          complejoNombre: "🚨 FALLBACK - Complejo Norte"
        }
      ];
      
      setCanchas(canchasEstaticas);
      setFilteredCanchas(canchasEstaticas);
      setCanchasYaCargadas(true); // 🔥 MARCAR COMO CARGADAS INCLUSO SI HAY ERROR
    } finally {
      setIsLoadingCanchas(false);
    }
  };

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
      4: {
        nombre: "Complejo Deportivo Este",
        direccion: "Av. Balmaceda 456, Temuco, Chile"
      },
      default: {
        nombre: "Complejo Deportivo",
        direccion: "Av. Alemania 1234, Temuco, Chile"
      }
    };
    
    return staticComplejos[establecimientoId as keyof typeof staticComplejos] || staticComplejos.default;
  };

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

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleRefresh = () => {
    setCanchasYaCargadas(false); // 🔥 PERMITIR RECARGA
    cargarCanchas();
  };

  const handleCanchaClick = (court: any) => {
    router.push(`/sports/futbol/canchas/canchaseleccionada?id=${court.id}`);
  };

  const isPageLoading = loadingComplejos || isLoadingCanchas;
  const hasPageError = errorComplejos || error;

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="futbol" />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⚽</div>
            <h1 className={styles.headerTitle}>
              Fútbol
              {loadingComplejos && <span style={{ fontSize: '14px', marginLeft: '10px', color: '#6b7280' }}>⏳ Cargando complejos...</span>}
              {errorComplejos && <span style={{ fontSize: '14px', marginLeft: '10px', color: '#dc2626' }}>⚠️ Complejos offline</span>}
              {!loadingComplejos && !errorComplejos && complejos.length > 0 && (
                <span style={{ fontSize: '14px', marginLeft: '10px', color: '#059669' }}>✅ {complejos.length} complejos cargados</span>
              )}
            </h1>
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

        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToFootball}
          >
            <span>←</span>
            <span>Fútbol</span>
          </button>
        </div>

        {hasPageError && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>
              Error: {errorComplejos || error} - 
              {errorComplejos ? ' Complejos offline' : ' API de canchas offline'} - 
              Mostrando datos de respaldo
            </span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {isPageLoading && (
          <div className={styles.loadingMessage}>
            <span>⚽</span>
            <span>
              {loadingComplejos ? 'Cargando complejos deportivos...' : 'Cargando canchas de fútbol...'}
            </span>
          </div>
        )}

        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>
            Filtrar canchas de fútbol
            {!isPageLoading && (
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '10px' }}>
                ({filteredCanchas.length} {filteredCanchas.length === 1 ? 'cancha' : 'canchas'} disponible{filteredCanchas.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>
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

        {filteredCanchas.length === 0 && searchTerm && !isPageLoading && (
          <div className={styles.noResults}>
            <h3>No se encontraron canchas de fútbol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de fútbol
            </button>
          </div>
        )}

        {filteredCanchas.length === 0 && !searchTerm && !isPageLoading && !hasPageError && (
          <div className={styles.noData}>
            <h3>⚽ No hay canchas de fútbol registradas</h3>
            <p>Aún no se han registrado canchas de fútbol en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {!isPageLoading && filteredCanchas.length > 0 && (
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

        {!isPageLoading && (
          <div className={styles.mapSection}>
            <h2 className={styles.sectionTitle}>
              Ubicación en el mapa de las canchas
              {!loadingComplejos && complejos.length > 0 && (
                <span style={{ fontSize: '14px', marginLeft: '10px', color: '#6b7280' }}>
                  📍 {complejos.length} complejos disponibles
                </span>
              )}
            </h2>
            
            <LocationMap 
              latitude={-38.7359}
              longitude={-72.5904}
              address="Temuco, Chile"
              zoom={13}
              height="400px"
              sport="futbol"
            />
          </div>
        )}
      </div>
    </div>
  );
}