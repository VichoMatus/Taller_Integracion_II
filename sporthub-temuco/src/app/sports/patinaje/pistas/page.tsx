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
  const [pistas, setPistas] = useState<any[]>([]);
  const [filteredPistas, setFilteredPistas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingPistas, setIsLoadingPistas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR PISTAS DE PATINAJE
  const cargarPistas = async () => {
    try {
      setIsLoadingPistas(true);
      setError('');
      
      console.log('🔄 [PistasPatinaje] Cargando pistas individuales del backend...');
      
      // 🔥 IDs de las pistas de patinaje que quieres mostrar
      const patinajePistaIds = [1, 2, 3, 4, 5, 6, 7, 8];
      
      const pistasPromises = patinajePistaIds.map(async (id) => {
        try {
          console.log(`🔍 [PistasPatinaje] Cargando pista ID: ${id}`);
          const pista = await canchaService.getCanchaById(id);
          console.log(`✅ [PistasPatinaje] Pista ${id} obtenida:`, pista);
          
          // 🔥 FILTRAR SOLO PISTAS DE PATINAJE
          if (pista.tipo !== 'patinaje') {
            console.log(`⚠️ [PistasPatinaje] Pista ${id} no es de patinaje (${pista.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedPista = {
            id: pista.id,
            imageUrl: `/sports/patinaje/pistas/Pista${pista.id}.png`,
            name: pista.nombre,
            address: `Complejo ${pista.establecimientoId}`,
            rating: pista.rating || 4.7,
            tags: [
              pista.techada ? "Pista cubierta" : "Pista al aire libre",
              pista.activa ? "Disponible" : "No disponible",
              "Alquiler patines",
              "Iluminación"
            ],
            description: `Pista de patinaje ${pista.nombre} - ID: ${pista.id}`,
            price: pista.precioPorHora?.toString() || "25",
            nextAvailable: pista.activa ? "Disponible ahora" : "No disponible",
            sport: "patinaje"
          };
          
          console.log('🗺️ [PistasPatinaje] Pista mapeada:', mappedPista);
          return mappedPista;
          
        } catch (error) {
          console.log(`❌ [PistasPatinaje] Error cargando pista ${id}:`, error);
          return null;
        }
      });
      
      const pistasResults = await Promise.all(pistasPromises);
      const pistasValidas = pistasResults.filter(pista => pista !== null);
      
      console.log('🎉 [PistasPatinaje] Pistas de patinaje cargadas exitosamente:', pistasValidas.length);
      console.log('📋 [PistasPatinaje] Pistas finales:', pistasValidas);
      
      setPistas(pistasValidas);
      setFilteredPistas(pistasValidas);
      
    } catch (error: any) {
      console.error('❌ [PistasPatinaje] ERROR DETALLADO cargando pistas:', error);
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK
      console.log('🚨 [PistasPatinaje] USANDO FALLBACK - Error en el API');
      const pistasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/patinaje/pistas/Pista1.png",
          name: "🚨 FALLBACK - Pista de Patinaje Centro",
          address: "Norte, Centro, Sur",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Pista Cubierta", "Alquiler Patines"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "25",
          nextAvailable: "20:00-21:00",
        },
        {
          id: 2,
          imageUrl: "/sports/patinaje/pistas/Pista2.png",
          name: "🚨 FALLBACK - Pista Norte",
          address: "Sector Norte",
          rating: 4.6,
          tags: ["DATOS OFFLINE", "Pista Techada", "Cafetería"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "22",
          nextAvailable: "14:30-15:30",
        }
      ];
      
      setPistas(pistasEstaticas);
      setFilteredPistas(pistasEstaticas);
    } finally {
      setIsLoadingPistas(false);
    }
  };

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

  const handleBackToPatinaje = () => {
    router.push('/sports/patinaje');
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

  const handleRefresh = () => {
    cargarPistas();
  };

  const handlePistaClick = (rink: any) => {
    console.log('Navegando a pista:', rink);
    router.push(`/sports/patinaje/pistas/pistaseleccionada?id=${rink.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="patinaje" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>⛸️</div>
            <h1 className={styles.headerTitle}>Patinaje</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la pista"
              sport="patinaje" 
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
            onClick={handleBackToPatinaje}
          >
            <span>←</span>
            <span>Patinaje</span>
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

        {isLoadingPistas && (
          <div className={styles.loadingMessage}>
            <span>⛸️</span>
            <span>Cargando pistas de patinaje...</span>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar pistas de patinaje</h3>
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
                <span>Precio (max por hora)</span>
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
                <span style={{color: '#15803d'}}>⛸️</span>
                <span>Modalidad</span>
              </label>
              <select className={styles.filterSelect}>
                <option>Todas las modalidades</option>
                <option>Patinaje artístico</option>
                <option>Patinaje recreativo</option>
                <option>Hockey sobre hielo</option>
                <option>Patinaje de velocidad</option>
              </select>
            </div>
          </div>
          <div className={styles.filtersActions}>
            <button className={styles.searchButton}>
              <span>🔍</span>
              <span>Buscar pistas</span>
            </button>
          </div>
        </div>

        {/* Mensajes de no resultados */}
        {filteredPistas.length === 0 && searchTerm && !isLoadingPistas && (
          <div className={styles.noResults}>
            <h3>No se encontraron pistas de patinaje para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones</p>
            <button onClick={() => {setSearchTerm(''); setFilteredPistas(pistas);}}>
              Ver todas las pistas de patinaje
            </button>
          </div>
        )}

        {filteredPistas.length === 0 && !searchTerm && !isLoadingPistas && !error && (
          <div className={styles.noData}>
            <h3>⛸️ No hay pistas de patinaje registradas</h3>
            <p>Aún no se han registrado pistas de patinaje en el sistema</p>
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
                  sport="patinaje"
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