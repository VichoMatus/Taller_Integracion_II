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
  const [skateparks, setSkateparks] = useState<any[]>([]);
  const [filteredSkateparks, setFilteredSkateparks] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingSkateparks, setIsLoadingSkateparks] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR SKATEPARKS
  const cargarSkateparks = async () => {
    try {
      setIsLoadingSkateparks(true);
      setError('');
      
      console.log('🔄 [SkateparksPage] Cargando skateparks individuales del backend...');
      
      // 🔥 IDs de los skateparks que quieres mostrar
      const skateparkIds = [1, 2, 3, 4, 5, 6, 7, 8];
      
      const skateparksPromises = skateparkIds.map(async (id) => {
        try {
          console.log(`🔍 [SkateparksPage] Cargando skatepark ID: ${id}`);
          const skatepark = await canchaService.getCanchaById(id);
          console.log(`✅ [SkateparksPage] Skatepark ${id} obtenido:`, skatepark);
          
          // 🔥 FILTRAR SOLO SKATEPARKS
          if (skatepark.tipo !== 'skate') {
            console.log(`⚠️ [SkateparksPage] Skatepark ${id} no es de skate (${skatepark.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedSkatepark = {
            id: skatepark.id,
            imageUrl: `/sports/skate/canchas/Skatepark${skatepark.id}.png`,
            name: skatepark.nombre,
            address: `Complejo ${skatepark.establecimientoId}`,
            rating: skatepark.rating || 4.5,
            tags: [
              skatepark.techada ? "Skatepark cubierto" : "Skatepark al aire libre",
              skatepark.activa ? "Disponible" : "No disponible",
              "Rampas incluidas",
              "Equipo de seguridad"
            ],
            description: `Skatepark ${skatepark.nombre} - ID: ${skatepark.id}`,
            price: skatepark.precioPorHora?.toString() || "20",
            nextAvailable: skatepark.activa ? "Disponible ahora" : "No disponible",
            sport: "skate"
          };
          
          console.log('🗺️ [SkateparksPage] Skatepark mapeado:', mappedSkatepark);
          return mappedSkatepark;
          
        } catch (error) {
          console.log(`❌ [SkateparksPage] Error cargando skatepark ${id}:`, error);
          return null;
        }
      });
      
      const skateparksResults = await Promise.all(skateparksPromises);
      const skateparksValidos = skateparksResults.filter(skatepark => skatepark !== null);
      
      console.log('🎉 [SkateparksPage] Skateparks cargados exitosamente:', skateparksValidos.length);
      console.log('📋 [SkateparksPage] Skateparks finales:', skateparksValidos);
      
      setSkateparks(skateparksValidos);
      setFilteredSkateparks(skateparksValidos);
      
    } catch (error: any) {
      console.error('❌ [SkateparksPage] ERROR DETALLADO cargando skateparks:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [SkateparksPage] USANDO FALLBACK - Error en el API');
      const skateparksEstaticos = [
        {
          id: 1,
          imageUrl: "/sports/skate/canchas/Skatepark1.png",
          name: "🚨 FALLBACK - Skatepark Centro",
          address: "Norte, Centro, Sur",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "Rampas incluidas", "Bowl"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "20",
          nextAvailable: "16:00-18:00",
        },
        {
          id: 2,
          imageUrl: "/sports/skate/canchas/Skatepark2.png",
          name: "🚨 FALLBACK - Skate Plaza Norte",
          address: "Sector Norte",
          rating: 4.4,
          tags: ["DATOS OFFLINE", "Skatepark al aire libre", "Mini ramps"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "15",
          nextAvailable: "14:00-16:00",
        }
      ];
      
      setSkateparks(skateparksEstaticos);
      setFilteredSkateparks(skateparksEstaticos);
    } finally {
      setIsLoadingSkateparks(false);
    }
  };

  useEffect(() => {
    cargarSkateparks();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredSkateparks(skateparks);
    } else {
      const filtered = skateparks.filter(skatepark =>
        skatepark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skatepark.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSkateparks(filtered);
    }
  };

  const handleBackToSkate = () => {
    router.push('/sports/skate');
  };

  const availableNow = filteredSkateparks.filter(skatepark => 
    skatepark.nextAvailable !== "No disponible hoy" && 
    !skatepark.nextAvailable.includes("Mañana")
  ).length;

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleRefresh = () => {
    cargarSkateparks();
  };

  const handleSkateparkClick = (park: any) => {
    console.log('Navegando a skatepark:', park);
    router.push(`/sports/skate/canchas/canchaseleccionada?id=${park.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🛹</div>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre del skatepark"
              sport="skate" 
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
            onClick={handleBackToSkate}
          >
            <span>←</span>
            <span>Skate</span>
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

        {isLoadingSkateparks && (
          <div className={styles.loadingMessage}>
            <span>🛹</span>
            <span>Cargando skateparks...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar skateparks</h3>
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
                max="50"
                className={styles.priceSlider}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#15803d'}}>🛹</span>
                <span>Tipo de skatepark</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Todos los tipos</option>
                <option>Street plaza</option>
                <option>Bowl/Pool</option>
                <option>Vert ramp</option>
                <option>Mini ramp</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar skateparks</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredSkateparks.length === 0 && searchTerm && !isLoadingSkateparks && (
          <div className={styles.noResults}>
            <h3>No se encontraron skateparks para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredSkateparks(skateparks);}}>
              Ver todos los skateparks
            </button>
          </div>
        )}

        {filteredSkateparks.length === 0 && !searchTerm && !isLoadingSkateparks && !error && (
          <div className={styles.noData}>
            <h3>🛹 No hay skateparks registrados</h3>
            <p>Aún no se han registrado skateparks en el sistema</p>
            <button onClick={handleRefresh}>Actualizar</button>
          </div>
        )}

        {/* Contenedor de tarjetas */}
        {!isLoadingSkateparks && filteredSkateparks.length > 0 && (
          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {filteredSkateparks.map((skatepark, idx) => (
                <CourtCard 
                  key={skatepark.id || idx} 
                  {...skatepark} 
                  sport="skate"
                  onClick={() => handleSkateparkClick(skatepark)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}