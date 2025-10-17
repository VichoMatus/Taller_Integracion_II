'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 ESTADOS PARA LA API
  const [rutas, setRutas] = useState<any[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingRutas, setIsLoadingRutas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR RUTAS DE MOUNTAIN BIKE
  const cargarRutas = async () => {
    try {
      setIsLoadingRutas(true);
      setError('');
      
      console.log('🔄 [RutasMountainBike] Cargando rutas individuales del backend...');
      
      // 🔥 IDs de las rutas de mountain bike que quieres mostrar
      const mountainBikeRutaIds = [1, 2, 3, 4, 5, 6, 7, 8];
      
      const rutasPromises = mountainBikeRutaIds.map(async (id) => {
        try {
          console.log(`🔍 [RutasMountainBike] Cargando ruta ID: ${id}`);
          const ruta = await canchaService.getCanchaById(id);
          console.log(`✅ [RutasMountainBike] Ruta ${id} obtenida:`, ruta);
          
          // 🔥 FILTRAR SOLO RUTAS DE MOUNTAIN BIKE
          if (ruta.tipo !== 'mountain_bike') {
            console.log(`⚠️ [RutasMountainBike] Ruta ${id} no es de mountain bike (${ruta.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedRuta = {
            id: ruta.id,
            imageUrl: `/sports/mountain-bike/rutas/Ruta${ruta.id}.png`,
            name: ruta.nombre,
            address: `Sendero ${ruta.establecimientoId}`,
            rating: ruta.rating || 4.7,
            tags: [
              ruta.techada ? "Sendero techado" : "Sendero al aire libre",
              ruta.activa ? "Disponible" : "No disponible",
              "Bici incluida",
              "Guía opcional"
            ],
            description: `Ruta de mountain bike ${ruta.nombre} - ID: ${ruta.id}`,
            price: ruta.precioPorHora?.toString() || "25",
            nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
            sport: "mountain-bike"
          };
          
          console.log('🗺️ [RutasMountainBike] Ruta mapeada:', mappedRuta);
          return mappedRuta;
          
        } catch (error) {
          console.log(`❌ [RutasMountainBike] Error cargando ruta ${id}:`, error);
          return null;
        }
      });
      
      const rutasResults = await Promise.all(rutasPromises);
      const rutasValidas = rutasResults.filter(ruta => ruta !== null);
      
      console.log('🎉 [RutasMountainBike] Rutas de mountain bike cargadas exitosamente:', rutasValidas.length);
      console.log('📋 [RutasMountainBike] Rutas finales:', rutasValidas);
      
      setRutas(rutasValidas);
      setFilteredRutas(rutasValidas);
      
    } catch (error: any) {
      console.error('❌ [RutasMountainBike] ERROR DETALLADO cargando rutas:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [RutasMountainBike] USANDO FALLBACK - Error en el API');
      const rutasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/mountain-bike/rutas/Ruta1.png",
          name: "🚨 FALLBACK - Sendero Los Volcanes",
          address: "Cordillera de los Andes",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Dificultad Alta", "Vista panorámica"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "28",
          nextAvailable: "Mañana 08:00-12:00",
        },
        {
          id: 2,
          imageUrl: "/sports/mountain-bike/rutas/Ruta2.png",
          name: "🚨 FALLBACK - Trail Bosque Nativo",
          address: "Reserva Natural",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "Dificultad Media", "Bosque"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "22",
          nextAvailable: "Hoy 14:00-17:00",
        },
        {
          id: 3,
          imageUrl: "/sports/mountain-bike/rutas/Ruta3.png",
          name: "🚨 FALLBACK - Circuito Principiantes",
          address: "Parque Municipal",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Dificultad Baja", "Familiar"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "18",
          nextAvailable: "Disponible ahora",
        }
      ];
      
      setRutas(rutasEstaticas);
      setFilteredRutas(rutasEstaticas);
    } finally {
      setIsLoadingRutas(false);
    }
  };

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
    ruta.nextAvailable === "Disponible ahora" || 
    ruta.nextAvailable.includes("Hoy")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleRefresh = () => {
    cargarRutas();
  };

  const handleRutaClick = (ruta: any) => {
    console.log('Navegando a ruta:', ruta);
    router.push(`/sports/mountain-bike/rutas/rutaseleccionada?id=${ruta.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="mountain-bike" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚵</div>
            <h1 className={styles.headerTitle}>Mountain Bike</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
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
            <span>Volver a Mountain Bike</span>
          </button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {isLoadingRutas && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>🚵</div>
            <p>Cargando rutas de mountain bike...</p>
          </div>
        )}

        {/* Filtros para Mountain Bike */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4B5320'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Montaña, bosque, valle..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4B5320'}}>⚡</span>
                <span>Nivel de dificultad</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Todas las dificultades</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="experto">Experto</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4B5320'}}>💰</span>
                <span>Rango de precios</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Todos los precios</option>
                <option value="0-20">$0 - $20</option>
                <option value="20-30">$20 - $30</option>
                <option value="30+">$30+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredRutas.length === 0 && searchTerm && !isLoadingRutas && (
          <div className={styles.noResults}>
            <h3>No se encontraron resultados para "{searchTerm}"</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas
            </button>
          </div>
        )}

        {filteredRutas.length === 0 && !searchTerm && !isLoadingRutas && !error && (
          <div className={styles.noResults}>
            <h3>🚵 No hay rutas de mountain bike registradas</h3>
            <p>Aún no se han registrado rutas de mountain bike en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
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
            
            {/* Mensaje de disponibilidad */}
            <div className={styles.availabilityMessage}>
              <div className={styles.availabilityCard}>
                <span className={styles.availabilityText}>
                  Rutas Disponibles hoy: <span className={styles.availabilityNumber}> {availableNow}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}