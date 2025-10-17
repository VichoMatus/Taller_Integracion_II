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
  
  // 🔥 ESTADOS PARA LA API (usando la misma lógica de /sports/voleibol/page.tsx)
  const [canchas, setCanchas] = useState<any[]>([]);
  const [filteredCanchas, setFilteredCanchas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingCanchas, setIsLoadingCanchas] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔥 FUNCIÓN PARA CARGAR CANCHAS (copiada exactamente de /sports/voleibol/page.tsx)
  const cargarCanchas = async () => {
    try {
      setIsLoadingCanchas(true);
      setError('');
      
      console.log('🔄 [CanchasVoleibol] Cargando canchas individuales del backend...');
      
      // 🔥 IDs de las canchas de voleibol que quieres mostrar
      const voleibolCanchaIds = [1, 2, 3, 4, 5, 6];
      
      const canchasPromises = voleibolCanchaIds.map(async (id) => {
        try {
          console.log(`🔍 [CanchasVoleibol] Cargando cancha ID: ${id}`);
          const cancha = await canchaService.getCanchaById(id);
          console.log(`✅ [CanchasVoleibol] Cancha ${id} obtenida:`, cancha);
          
          // 🔥 FILTRAR SOLO CANCHAS DE VOLEIBOL
          if (cancha.tipo !== 'voleibol') {
            console.log(`⚠️ [CanchasVoleibol] Cancha ${id} no es de voleibol (${cancha.tipo}), saltando...`);
            return null;
          }
          
          // Mapear al formato requerido por CourtCard
          const mappedCancha = {
            id: cancha.id,
            imageUrl: `/sports/voleibol/canchas/Cancha${cancha.id}.png`,
            name: cancha.nombre,
            address: `Complejo ${cancha.establecimientoId}`,
            rating: cancha.rating || 4.6,
            tags: [
              cancha.techada ? "Cancha Cerrada" : "Cancha Exterior",
              cancha.activa ? "Disponible" : "No disponible",
              "Balones incluidos",
              "Red profesional"
            ],
            description: `Cancha de voleibol ${cancha.nombre} - ID: ${cancha.id}`,
            price: cancha.precioPorHora?.toString() || "28",
            nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
            sport: "voleibol"
          };
          
          console.log('🗺️ [CanchasVoleibol] Cancha mapeada:', mappedCancha);
          return mappedCancha;
          
        } catch (error) {
          console.log(`❌ [CanchasVoleibol] Error cargando cancha ${id}:`, error);
          return null;
        }
      });
      
      // Esperar a que todas las promesas se resuelvan
      const canchasResults = await Promise.all(canchasPromises);
      
      // Filtrar las canchas null (que no existen o no son de voleibol)
      const canchasValidas = canchasResults.filter(cancha => cancha !== null);
      
      console.log('🎉 [CanchasVoleibol] Canchas de voleibol cargadas exitosamente:', canchasValidas.length);
      console.log('📋 [CanchasVoleibol] Canchas finales:', canchasValidas);
      
      setCanchas(canchasValidas);
      setFilteredCanchas(canchasValidas);
      
    } catch (error: any) {
      console.error('❌ [CanchasVoleibol] ERROR DETALLADO cargando canchas:');
      console.error('- Message:', error.message);
      console.error('- Full error:', error);
      
      setError(`Error: ${error.message}`);
      
      // 🔥 FALLBACK: USAR DATOS ESTÁTICOS SI FALLA LA API
      console.log('🚨 [CanchasVoleibol] USANDO FALLBACK - Error en el API');
      const canchasEstaticas = [
        {
          id: 1,
          imageUrl: "/sports/voleibol/canchas/Cancha1.png",
          name: "🚨 FALLBACK - Voleibol Centro",
          address: "Norte, Centro, Sur",
          rating: 4.7,
          tags: ["DATOS OFFLINE", "Cancha Indoor", "Iluminación LED", "Vestuarios"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "30",
          nextAvailable: "19:00-20:30",
        },
        {
          id: 2,
          imageUrl: "/sports/voleibol/canchas/Cancha2.png",
          name: "🚨 FALLBACK - Voleibol Norte",
          address: "Sector Norte",
          rating: 4.5,
          tags: ["DATOS OFFLINE", "Cancha Profesional", "Estacionamiento"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "25",
          nextAvailable: "16:00-17:30",
        },
        {
          id: 3,
          imageUrl: "/sports/voleibol/canchas/Cancha3.png",
          name: "🚨 FALLBACK - Voleibol Sur",
          address: "Sector Sur",
          rating: 4.3,
          tags: ["DATOS OFFLINE", "Cancha Exterior", "Iluminación"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "22",
          nextAvailable: "Mañana 10:00-11:30",
        },
        {
          id: 4,
          imageUrl: "/sports/voleibol/canchas/Cancha4.png",
          name: "🚨 FALLBACK - Voleibol Premium",
          address: "Centro Premium",
          rating: 4.8,
          tags: ["DATOS OFFLINE", "Cancha Profesional", "Bar", "VIP"],
          description: "🚨 Estos son datos de fallback - API no disponible",
          price: "40",
          nextAvailable: "Disponible ahora",
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

  const handleBackToVoleibol = () => {
    router.push('/sports/voleibol');
  };

  const availableNow = filteredCanchas.filter(cancha => 
    cancha.nextAvailable === "Disponible ahora" || 
    cancha.nextAvailable.includes("Hoy")
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
  const handleCanchaClick = (cancha: any) => {
    console.log('Navegando a cancha:', cancha);
    router.push(`/sports/voleibol/canchas/canchaseleccionada?id=${cancha.id}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="voleibol" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏐</div>
            <h1 className={styles.headerTitle}>Voleibol</h1>
          </div>
          <div className={styles.headerRight}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Nombre de la cancha de voleibol"
              sport="voleibol" 
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

        {/* Breadcrumb con navegación */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToVoleibol}
          >
            <span>←</span>
            <span>Volver a Voleibol</span>
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
        {isLoadingCanchas && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>🏐</div>
            <p>Cargando canchas de voleibol...</p>
          </div>
        )}

        {/* Filtros específicos para voleibol */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filtrar canchas de voleibol</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#42A5F5'}}>📍</span>
                <span>Ubicación o barrio</span>
              </label>
              <input
                type="text"
                placeholder="Centro, norte, sur..."
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#42A5F5'}}>💰</span>
                <span>Rango de precios</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Todos los precios</option>
                <option value="0-25">$0 - $25</option>
                <option value="25-35">$25 - $35</option>
                <option value="35+">$35+</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>
                <span style={{color: '#42A5F5'}}>🏟️</span>
                <span>Tipo de cancha</span>
              </label>
              <select className={styles.filterSelect}>
                <option value="">Tipo de cancha</option>
                <option value="indoor">Cancha Indoor</option>
                <option value="exterior">Cancha Exterior</option>
                <option value="techada">Cancha Techada</option>
                <option value="profesional">Cancha Profesional</option>
                <option value="premium">Cancha Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🔥 MENSAJE CUANDO NO HAY RESULTADOS DE BÚSQUEDA */}
        {filteredCanchas.length === 0 && searchTerm && !isLoadingCanchas && (
          <div className={styles.noResults}>
            <h3>No se encontraron canchas de voleibol para &quot;{searchTerm}&quot;</h3>
            <p>Intenta con otros términos de búsqueda o ubicaciones específicas de voleibol</p>
            <button onClick={() => {setSearchTerm(''); setFilteredCanchas(canchas);}}>
              Ver todas las canchas de voleibol
            </button>
          </div>
        )}

        {/* 🔥 MENSAJE CUANDO NO HAY CANCHAS */}
        {filteredCanchas.length === 0 && !searchTerm && !isLoadingCanchas && !error && (
          <div className={styles.noResults}>
            <h3>🏐 No hay canchas de voleibol registradas</h3>
            <p>Aún no se han registrado canchas de voleibol en el sistema</p>
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
                  sport="voleibol"
                  onClick={() => handleCanchaClick(cancha)}
                />
              ))}
            </div>
            
            {/* Mensaje de disponibilidad */}
            <div className={styles.availabilityMessage}>
              <div className={styles.availabilityCard}>
                <span className={styles.availabilityText}>
                  Canchas de Voleibol Disponibles ahora: <span className={styles.availabilityNumber}> {availableNow}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}