'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

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
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CanchasFutbol] Cargando canchas individuales del backend...');
      
      // 🔥 IDs de las canchas de fútbol que quieres mostrar
      const futbolCanchaIds = [1, 2, 3, 4, 5, 6]; // Ajusta estos IDs según las canchas de fútbol que tengas
      
      const canchasPromises = futbolCanchaIds.map(async (id) => {
        try {
          console.log(`🔍 [CanchasFutbol] Cargando cancha ID: ${id}`);
          const cancha = await canchaService.getCanchaById(id);
          console.log(`✅ [CanchasFutbol] Cancha ${id} obtenida:`, cancha);
          
          // 🔥 CORRECCIÓN: Usar 'tipo' en lugar de 'deporte'
          if (cancha.tipo !== 'futbol') {
            console.log(`⚠️ [CanchasFutbol] Cancha ${id} no es de fútbol (${cancha.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/futbol/canchas/Cancha${cancha.id}.png`,
            name: cancha.nombre,
            address: `Complejo ${cancha.establecimientoId}`,
            rating: cancha.rating || 4.5,
            tags: [
              cancha.techada ? "Techada" : "Al aire libre",
              cancha.activa ? "Disponible" : "No disponible",
              "Estacionamiento",
              "Iluminación"
            ],
            description: `Cancha de fútbol ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "25",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: cancha.tipo
          };
          
          console.log('🗺️ [CanchasFutbol] Cancha mapeada:', mappedCancha);
          return mappedCancha;
          
        } catch (error) {
          console.log(`❌ [CanchasFutbol] Error cargando cancha ${id}:`, error);
          return null; // Retornar null si la cancha no existe
        }
      });
      
      // Esperar a que todas las promesas se resuelvan
      const canchasResults = await Promise.all(canchasPromises);
      
      // Filtrar las canchas null (que no existen o no son de fútbol)
      const canchasValidas = canchasResults.filter(cancha => cancha !== null);
      
      console.log('🎉 [CanchasFutbol] Canchas de fútbol cargadas exitosamente:', canchasValidas.length);
      console.log('📋 [CanchasFutbol] Canchas finales:', canchasValidas);
      
      setCanchas(canchasValidas);
      setFilteredCanchas(canchasValidas);
      
    } catch (error: any) {
      console.error('❌ [CanchasFutbol] ERROR DETALLADO cargando canchas:');
      console.error('- Message:', error.message);
      console.error('- Full error:', error);
      
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK: USAR DATOS ESTÁTICOS SI FALLA LA API
      console.log('🚨 [CanchasFutbol] USANDO FALLBACK - Error en el API');
      const canchasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/futbol/canchas/Cancha1.png",
          name: "🚨 FALLBACK - Fútbol Centro",
          address: "Norte, Centro, Sur",
          rating: 4.3,
          tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación", "Cafetería"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "25",
          nextAvailable: "20:00-21:00",
        },
        {
          id: 2,
          imageUrl: "/sports/futbol/canchas/Cancha2.png",
          name: "🚨 FALLBACK - Fútbol Norte",
          address: "Sector Norte",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Estacionamiento"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "22",
          nextAvailable: "14:30-15:30", 
        },
        {
          id: 3,
          imageUrl: "/sports/futbol/canchas/Cancha3.png",
          name: "🚨 FALLBACK - Fútbol Sur",
          address: "Sector Sur",
          rating: 4.1,
          tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "28",
          nextAvailable: "Mañana 09:00-10:00",
        },
        {
          id: 4,
          imageUrl: "/sports/futbol/canchas/Cancha4.png",
          name: "🚨 FALLBACK - Fútbol Premium",
          address: "Centro Premium", 
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación", "Cafetería"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "35",
          nextAvailable: "No disponible hoy",
        },
        {
          id: 5,
          imageUrl: "/sports/futbol/canchas/Cancha5.png",
          name: "🚨 FALLBACK - Fútbol Elite",
          address: "Zona Elite",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación", "Cafetería"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "40",
          nextAvailable: "18:00-19:00",
        },
        {
          id: 6,
          imageUrl: "/sports/futbol/canchas/Cancha6.png",
          name: "🚨 FALLBACK - Fútbol Oeste",
          address: "Sector Oeste",
          rating: 4.2,
          tags: ["DATOS OFFLINE", "Estacionamiento", "Iluminación"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "24",
          nextAvailable: "16:00-17:00",
        }
      ];
      
      setCanchas(canchasEstaticas);
      setFilteredCanchas(canchasEstaticas);
    } finally {
      setIsLoadingCanchas(false);
    }
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