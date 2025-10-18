'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '../../../../hooks/useAuthStatus';
import CourtCard from '../../../../components/charts/CourtCard';
import SearchBar from '../../../../components/SearchBar';
import LocationMap from '../../../../components/LocationMap';
import Sidebar from '../../../../components/layout/Sidebar';
import styles from './page.module.css';

// 🔥 IMPORTAR SERVICIO
import { canchaService } from '../../../../services/canchaService';

export default function Page() {
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 ESTADOS PARA LA API
  const [centros, setCentros] = useState<any[]>([]);
  const [filteredCentros, setFilteredCentros] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCentros, setIsLoadingCentros] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR CENTROS DE ESCALADA
  const cargarCentros = async () => {
    try {
      setIsLoadingCentros(true);
      setError('');
      
      console.log('🔄 [CentrosEscalada] Cargando centros individuales del backend...');
      
      // 🔥 IDs de los centros de escalada que quieres mostrar
      const escaladaCentroIds = [1, 2, 3, 4, 5, 6, 7, 8];
      
      const centrosPromises = escaladaCentroIds.map(async (id) => {
        try {
          console.log(`🔍 [CentrosEscalada] Cargando centro ID: ${id}`);
          const centro = await canchaService.getCanchaById(id);
          console.log(`✅ [CentrosEscalada] Centro ${id} obtenido:`, centro);
          
          // 🔥 FILTRAR SOLO CENTROS DE ESCALADA
          if (centro.tipo !== 'escalada') {
            console.log(`⚠️ [CentrosEscalada] Centro ${id} no es de escalada (${centro.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedCentro = {
            id: centro.id,
            imageUrl: `/sports/escalada/centros/Centro${centro.id}.png`,
            name: centro.nombre,
            address: `Complejo ${centro.establecimientoId}`,
            rating: centro.rating || 4.5,
            tags: [
              centro.techada ? "Centro techado" : "Escalada al aire libre",
              centro.activa ? "Disponible" : "No disponible",
              "Equipo incluido",
              "Instructor disponible"
            ],
            description: `Centro de escalada ${centro.nombre} - ID: ${centro.id}`,
            price: centro.precioPorHora?.toString() || "25",
            nextAvailable: centro.activa ? "Disponible ahora" : "No disponible",
            sport: "escalada"
          };
          
          console.log('🗺️ [CentrosEscalada] Centro mapeado:', mappedCentro);
          return mappedCentro;
          
        } catch (error) {
          console.log(`❌ [CentrosEscalada] Error cargando centro ${id}:`, error);
          return null;
        }
      });
      
      const centrosResults = await Promise.all(centrosPromises);
      const centrosValidos = centrosResults.filter(centro => centro !== null);
      
      console.log('🎉 [CentrosEscalada] Centros de escalada cargados exitosamente:', centrosValidos.length);
      console.log('📋 [CentrosEscalada] Centros finales:', centrosValidos);
      
      setCentros(centrosValidos);
      setFilteredCentros(centrosValidos);
      
    } catch (error: any) {
      console.error('❌ [CentrosEscalada] ERROR DETALLADO cargando centros:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [CentrosEscalada] USANDO FALLBACK - Error en el API');
      const centrosEstaticos = [
        {
          id: 1,
          imageUrl: "/sports/escalada/centros/Centro1.png",
          name: "🚨 FALLBACK - Centro Escalada Temuco",
          address: "Norte, Centro, Sur",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "Equipo incluido", "Instructor"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "25",
          nextAvailable: "20:00-21:00",
        },
        {
          id: 2,
          imageUrl: "/sports/escalada/centros/Centro2.png",
          name: "🚨 FALLBACK - Escalada Outdoor",
          address: "Sector Norte",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Al aire libre", "Diferentes niveles"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "20",
          nextAvailable: "14:30-15:30",
        }
      ];
      
      setCentros(centrosEstaticos);
      setFilteredCentros(centrosEstaticos);
    } finally {
      setIsLoadingCentros(false);
    }
  };

  useEffect(() => {
    cargarCentros();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredCentros(centros);
    } else {
      const filtered = centros.filter(centro =>
        centro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCentros(filtered);
    }
  };

  const handleBackToEscalada = () => {
    router.push('/sports/escalada');
  };

  const availableNow = filteredCentros.filter(centro => 
    centro.nextAvailable !== "No disponible hoy" && 
    !centro.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleRefresh = () => {
    cargarCentros();
  };

  const handleCentroClick = (center: any) => {
    console.log('Navegando a centro:', center);
    router.push(`/sports/escalada/centros/centroseleccionado?id=${center.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="escalada" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🧗</div>
            <h1 className={styles.headerTitle}>Escalada</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del centro"
              sport="escalada" 
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
            onClick={handleBackToEscalada}
          >
            <span>←</span>
            <span>Escalada</span>
          </button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>Error: {error} - Mostrando datos offline</span>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        )}

        {isLoadingCentros && (
          <div className={styles.loadingMessage}>
            <span>🧗</span>
            <span>Cargando centros de escalada...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar centros de escalada</h3>
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
                <span>Precio (max por sesión)</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#15803d'}}>🧗</span>
                <span>Tipo de escalada</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Tipo de escalada</option>
                <option>Escalada deportiva</option>
                <option>Boulder</option>
                <option>Escalada tradicional</option>
                <option>Vía ferrata</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar centros</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredCentros.length === 0 && searchTerm && !isLoadingCentros && (
          <div className={styles.noResults}>
            <h3>No se encontraron centros de escalada para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCentros(centros);}}>
              Ver todos los centros de escalada
            </button>
          </div>
        )}

        {filteredCentros.length === 0 && !searchTerm && !isLoadingCentros && !error && (
          <div className={styles.noData}>
            <h3>🧗 No hay centros de escalada registrados</h3>
            <p>Aún no se han registrado centros de escalada en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingCentros && filteredCentros.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredCentros.map((centro, idx) => (
                <CourtCard 
                  key={centro.id || idx} 
                  {...centro} 
                  sport="escalada"
                  onClick={() => handleCentroClick(centro)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}