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
  
  // 🔥 ESTADOS PARA LA API (usando la misma lógica de /sports/enduro/page.tsx)
  const [rutas, setRutas] = useState<any[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingRutas, setIsLoadingRutas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR RUTAS (copiada exactamente de /sports/enduro/page.tsx)
  const cargarRutas = async () => {
    try {
      setIsLoadingRutas(true);
      setError('');
      
      console.log('🔄 [RutasEnduro] Cargando rutas individuales del backend...');
      
      // 🔥 IDs de las rutas de enduro que quieres mostrar
      const enduroRutaIds = [1, 2, 3, 4, 5, 6];
      
      const rutasPromises = enduroRutaIds.map(async (id) => {
        try {
          console.log(`🔍 [RutasEnduro] Cargando ruta ID: ${id}`);
          const ruta = await canchaService.getCanchaById(id);
          console.log(`✅ [RutasEnduro] Ruta ${id} obtenida:`, ruta);
          
          // 🔥 FILTRAR SOLO RUTAS DE ENDURO
          if (ruta.tipo !== 'enduro') {
            console.log(`⚠️ [RutasEnduro] Ruta ${id} no es de enduro (${ruta.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedRuta = {
            id: ruta.id,
            imageUrl: `/sports/enduro/rutas/ruta${ruta.id}.png`,
            name: ruta.nombre,
            address: `Zona ${ruta.establecimientoId}`,
            rating: ruta.rating || 4.6,
            tags: [
              ruta.techada ? "Ruta techada" : "Ruta al aire libre",
              ruta.activa ? "Disponible" : "No disponible",
              "Guía incluido",
              "Equipo disponible"
            ],
            description: `Ruta de enduro ${ruta.nombre} - ID: ${ruta.id}`,
            price: ruta.precioPorHora?.toString() || "35",
            nextAvailable: ruta.activa ? "Disponible ahora" : "No disponible",
            sport: "enduro"
          };
          
          console.log('🗺️ [RutasEnduro] Ruta mapeada:', mappedRuta);
          return mappedRuta;
          
        } catch (error) {
          console.log(`❌ [RutasEnduro] Error cargando ruta ${id}:`, error);
          return null;
        }
      });
      
      // Esperar a que todas las promesas se resuelvan
      const rutasResults = await Promise.all(rutasPromises);
      
      // Filtrar las rutas null (que no existen o no son de enduro)
      const rutasValidas = rutasResults.filter(ruta => ruta !== null);
      
      console.log('🎉 [RutasEnduro] Rutas de enduro cargadas exitosamente:', rutasValidas.length);
      console.log('📋 [RutasEnduro] Rutas finales:', rutasValidas);
      
      setRutas(rutasValidas);
      setFilteredRutas(rutasValidas);
      
    } catch (error: any) {
      console.error('❌ [RutasEnduro] ERROR DETALLADO cargando rutas:');
      console.error('- Message:', error.message);
      console.error('- Full error:', error);
      
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK: USAR DATOS ESTÁTICOS SI FALLA LA API
      console.log('🚨 [RutasEnduro] USANDO FALLBACK - Error en el API');
      const rutasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/enduro/rutas/ruta1.png",
          name: "🚨 FALLBACK - Ruta Montaña Extremo",
          address: "Cordillera Central",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Dificultad Alta", "Terreno Rocoso", "Guía Incluido"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "35",
          nextAvailable: "Mañana 08:00-12:00",
        },
        {
          id: 2,
          imageUrl: "/sports/enduro/rutas/ruta2.png",
          name: "🚨 FALLBACK - Sendero Bosque Verde",
          address: "Reserva Natural",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Dificultad Media", "Bosque", "Ríos"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "28",
          nextAvailable: "Hoy 14:00-17:00",
        },
        {
          id: 3,
          imageUrl: "/sports/enduro/rutas/ruta3.png",
          name: "🚨 FALLBACK - Circuito Técnico",
          address: "Parque de Aventura",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "Dificultad Alta", "Técnico", "Saltos"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "32",
          nextAvailable: "Disponible ahora",
        },
        {
          id: 4,
          imageUrl: "/sports/enduro/rutas/ruta4.png",
          name: "🚨 FALLBACK - Trail Iniciación",
          address: "Centro de Enduro",
          rating: 4.3,
          tags: ["DATOS OFFLINE", "Dificultad Baja", "Aprendizaje", "Instructor"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "40",
          nextAvailable: "Mañana 10:00-13:00",
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

  const handleBackToEnduro = () => {
    router.push('/sports/enduro');
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
    router.push(`/sports/enduro/rutas/rutaseleccionada?id=${ruta.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="enduro" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏍️</div>
            <h1 className={styles.headerTitle}>Enduro</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la ruta o ubicación..."
              sport="enduro" 
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
            onClick={handleBackToEnduro}
          >
            <span>←</span>
            <span>Volver a Enduro</span>
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
            <div className={styles.loadingSpinner}>🏍️</div>
            <p>Cargando rutas de enduro...</p>
          </div>
        )}

        {/* Filtros para Enduro */}
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
                placeholder="Montaña, valle, reserva..."
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
                <option value="facil">Fácil</option>
                <option value="intermedio">Intermedio</option>
                <option value="dificil">Difícil</option>
                <option value="extremo">Extremo</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#4B5320'}}>💰</span>
                <span>Rango de precios</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Todos los precios</option>
                <option value="0-30">$0 - $30</option>
                <option value="30-50">$30 - $50</option>
                <option value="50+">$50+</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🔥 MENSAJE CUANDO NO HAY RESULTADOS DE BÚSQUEDA */}
        {filteredRutas.length === 0 && searchTerm && !isLoadingRutas && (
          <div className={styles.noResults}>
            <h3>No se encontraron resultados para "{searchTerm}"</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button onClick={() => {setSearchTerm(''); setFilteredRutas(rutas);}}>
              Ver todas las rutas
            </button>
          </div>
        )}

        {/* 🔥 MENSAJE CUANDO NO HAY RUTAS */}
        {filteredRutas.length === 0 && !searchTerm && !isLoadingRutas && !error && (
          <div className={styles.noResults}>
            <h3>🏍️ No hay rutas de enduro registradas</h3>
            <p>Aún no se han registrado rutas de enduro en el sistema</p>
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
                  sport="enduro"
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