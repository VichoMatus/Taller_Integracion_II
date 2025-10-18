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
  
  // 🔥 ESTADOS PARA LA API (usando la misma lógica de /sports/ciclismo/page.tsx)
  const [rutas, setRutas] = useState<any[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingRutas, setIsLoadingRutas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR RUTAS (copiada exactamente de /sports/ciclismo/page.tsx)
  const cargarRutas = async () => {
    try {
      setIsLoadingRutas(true);
      setError('');
      
      console.log('🔄 [RutasCiclismo] Cargando rutas individuales del backend...');
      
      // 🔥 IDs de las rutas de ciclismo que quieres mostrar
      const ciclismoRutaIds = [1, 2, 3, 4, 5, 6];
      
      const rutasPromises = ciclismoRutaIds.map(async (id) => {
        try {
          console.log(`🔍 [RutasCiclismo] Cargando ruta ID: ${id}`);
          const ruta = await canchaService.getCanchaById(id);
          console.log(`✅ [RutasCiclismo] Ruta ${id} obtenida:`, ruta);
          
          // 🔥 FILTRAR SOLO RUTAS DE CICLISMO
          if (ruta.tipo !== 'ciclismo') {
            console.log(`⚠️ [RutasCiclismo] Ruta ${id} no es de ciclismo (${ruta.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedRuta = {
            id: ruta.id,
            imageUrl: `/sports/ciclismo/rutas/Ruta${ruta.id}.png`,
            name: ruta.nombre,
            address: `Zona ${ruta.establecimientoId}`,
            rating: ruta.rating || 4.6,
            tags: [
              ruta.techada ? "Ruta techada" : "Sendero natural",
              ruta.activa ? "Disponible" : "No disponible",
              "Bicicletas disponibles",
              "Guía incluido"
            ],
            description: `Ruta de ciclismo ${ruta.nombre} - ID: ${ruta.id}`,
            price: ruta.precioPorHora?.toString() || "15",
            nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
            sport: "ciclismo"
          };
          
          console.log('🗺️ [RutasCiclismo] Ruta mapeada:', mappedRuta);
          return mappedRuta;
          
        } catch (error) {
          console.log(`❌ [RutasCiclismo] Error cargando ruta ${id}:`, error);
          return null;
        }
      });
      
      // Esperar a que todas las promesas se resuelvan
      const rutasResults = await Promise.all(rutasPromises);
      
      // Filtrar las rutas null (que no existen o no son de ciclismo)
      const rutasValidas = rutasResults.filter(ruta => ruta !== null);
      
      console.log('🎉 [RutasCiclismo] Rutas de ciclismo cargadas exitosamente:', rutasValidas.length);
      console.log('📋 [RutasCiclismo] Rutas finales:', rutasValidas);
      
      setRutas(rutasValidas);
      setFilteredRutas(rutasValidas);
      
    } catch (error: any) {
      console.error('❌ [RutasCiclismo] ERROR DETALLADO cargando rutas:');
      console.error('- Message:', error.message);
      console.error('- Full error:', error);
      
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK: USAR DATOS ESTÁTICOS SI FALLA LA API
      console.log('🚨 [RutasCiclismo] USANDO FALLBACK - Error en el API');
      const rutasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/ciclismo/rutas/Ruta1.png",
          name: "🚨 FALLBACK - Sendero Bosque",
          address: "Parque Nacional, Zona Norte",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Sendero natural", "Dificultad media", "Paisajes"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "15",
          nextAvailable: "08:00-09:00",
        },
        {
          id: 2,
          imageUrl: "/sports/ciclismo/rutas/Ruta2.png",
          name: "🚨 FALLBACK - Ruta Urbana",
          address: "Centro Ciudad",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Ciclovía urbana", "Fácil acceso"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "8",
          nextAvailable: "16:00-17:00",
        },
        {
          id: 3,
          imageUrl: "/sports/ciclismo/rutas/Ruta3.png",
          name: "🚨 FALLBACK - Sendero Lago",
          address: "Orilla del Lago",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Vista al lago", "Dificultad alta"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "20",
          nextAvailable: "10:30-11:30",
        },
        {
          id: 4,
          imageUrl: "/sports/ciclismo/rutas/Ruta4.png",
          name: "🚨 FALLBACK - Ruta Cordillera",
          address: "Zona Montañosa",
          rating: 4.9,
          tags: ["DATOS OFFLINE", "Alta montaña", "Dificultad extrema"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "35",
          nextAvailable: "06:00-07:00",
        }
      ];
      
      setRutas(rutasEstaticas);
      setFilteredRutas(rutasEstaticas);
    } finally {
      setIsLoadingRutas(false);
    }
  };

  // 🔥 CARGAR RUTAS AL MONTAR EL COMPONENTE
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

  const handleBackToCiclismo = () => {
    router.push('/sports/ciclismo');
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

  // 🔥 FUNCIÓN PARA REFRESCAR DATOS
  const handleRefresh = () => {
    cargarRutas();
  };

  // 🔥 MANEJADOR DE CLICK EN RUTA (como en la página principal)
  const handleRutaClick = (ruta: any) => {
    console.log('Navegando a ruta:', ruta);
    router.push(`/sports/ciclismo/canchas/canchaseleccionada?id=${ruta.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="ciclismo" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚴‍♂️</div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
            {/* 🔥 BOTÓN DE REFRESCAR */}
            <button 
              onClick={handleRefresh}
              className={styles.refreshButton}
              disabled={isLoadingRutas}
              title="Actualizar rutas"
            >
              🔄
            </button>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
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
            <span>Volver a Ciclismo</span>
          </button>
        </div>

        {/* 🔥 MOSTRAR ERROR SI EXISTE */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {/* 🔥 MOSTRAR LOADING */}
        {isLoadingRutas && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>🚴‍♂️</div>
            <p>Cargando rutas de ciclismo...</p>
          </div>
        )}

        {/* Filtros específicos para ciclismo */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar rutas de ciclismo</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#16a34a'}}>📍</span>
                <span>Ubicación o zona</span>
              </label>
              <input
                type="text"
                placeholder="Parque, sendero, urbano..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#16a34a'}}>⚡</span>
                <span>Nivel de dificultad</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Todas las dificultades</option>
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
                <option value="extremo">Extremo</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#16a34a'}}>💰</span>
                <span>Rango de precios</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Todos los precios</option>
                <option value="0-15">$0 - $15</option>
                <option value="15-25">$15 - $25</option>
                <option value="25+">$25+</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🔥 MENSAJE CUANDO NO HAY RESULTADOS DE BÚSQUEDA */}
        {filteredRutas.length === 0 && searchTerm && !isLoadingRutas && (
          <div className={styles.noResults}>
            <h3>No se encontraron rutas para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas
            </button>
          </div>
        )}

        {/* 🔥 MENSAJE CUANDO NO HAY RUTAS */}
        {filteredRutas.length === 0 && !searchTerm && !isLoadingRutas && !error && (
          <div className={styles.noResults}>
            <h3>🚴‍♂️ No hay rutas de ciclismo registradas</h3>
            <p>Aún no se han registrado rutas de ciclismo en el sistema</p>
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
                  sport="ciclismo"
                  onClick={() => handleRutaClick(ruta)}
                />
              ))}
            </div>
            
            {/* Mensaje de disponibilidad */}
            <div className={styles.availabilityMessage}>
              <div className={styles.availabilityCard}>
                <span className={styles.availabilityText}>
                  Rutas de Ciclismo Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}