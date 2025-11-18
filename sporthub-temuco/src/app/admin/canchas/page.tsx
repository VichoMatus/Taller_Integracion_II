'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { useAdminToast } from '@/components/admin/AdminToast';
import '../dashboard.css';

interface Court {
  id: string;
  name: string;
  location: string;
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  type: string;
}

export default function CanchasPage() {
  const router = useRouter();
  const { show } = useAdminToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar recargas
  const [showInactive, setShowInactive] = useState(true); // 🔥 NUEVO: Toggle para mostrar/ocultar inactivas
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [pageSize, setPageSize] = useState<number>(100); // Mostrar al menos 100 por defecto

  // 🔥 Cargar canchas reales de la API usando endpoint de ADMIN
  const loadCourts = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [loadCourts] INICIO - Cargando canchas desde getCanchasAdmin()...');
      console.log('🔍 [loadCourts] Token en localStorage:', localStorage.getItem('access_token')?.substring(0, 30) + '...');
      console.log('🔍 [loadCourts] Mostrar inactivas:', showInactive);
      
      // ✅ ACTUALIZADO: Usar endpoint dedicado de admin con filtrado automático por complejo
      const result = await canchaService.getCanchasAdmin({
        incluir_inactivas: showInactive, // 🔥 Controlado por el toggle del usuario
        sort_by: 'nombre',
        order: 'asc'
      , page_size: pageSize
      });
      
      console.log('✅ [loadCourts] Respuesta del servidor:', result);
      console.log('✅ [loadCourts] Tipo de result:', typeof result);
      console.log('✅ [loadCourts] Keys de result:', Object.keys(result));
      
      // El servicio ya devuelve el formato { items: [...], total, page, page_size }
      const canchasFromApi = result.items || [];
      
      console.log('📊 Total de canchas del admin:', canchasFromApi.length);
      
      // Adaptar datos de la API al formato del frontend
      const adaptedCourts: Court[] = canchasFromApi.map((cancha: any) => {
        const id = cancha.id;
        const nombre = cancha.nombre;
        const activa = cancha.activa !== undefined ? cancha.activa : true;
        
        console.log(`   - Cancha ${nombre} (ID: ${id}): activa=${activa}, tipo=${cancha.tipo}`);
        
        return {
          id: id.toString(),
          name: nombre,
          location: `Complejo ${cancha.establecimientoId || 'N/A'}`,
          status: activa ? 'Activo' : 'Inactivo',
          type: cancha.tipo || 'Futbol'
        };
      });
      
      setCourts(adaptedCourts);
      console.log('✅ Canchas del admin cargadas:', adaptedCourts.length);
      
      if (adaptedCourts.length === 0) {
        console.log('ℹ️ No hay canchas para este administrador. Debe crear canchas primero.');
      }
    } catch (error: any) {
      console.error('❌ Error cargando canchas del admin:', error);
      
      // Extraer mensaje de error de múltiples formatos
      let errorMsg = 'Error desconocido';
      if (error?.response?.data) {
        const data = error.response.data;
        // Si data es un objeto con mensaje
        if (typeof data === 'object') {
          errorMsg = data.message || data.error || JSON.stringify(data);
        } else {
          errorMsg = String(data);
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      console.error('   Detalle completo:', {
        errorMsg,
        responseData: error?.response?.data,
        status: error?.response?.status,
        fullError: error
      });
      
      // NO usar datos mock - mostrar error real
      setCourts([]);
      show('error', `Error al cargar canchas: ${errorMsg}. Verifique que esté logueado como administrador.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourts();
  }, [refreshKey, showInactive, pageSize]); // 🔥 Recargar cuando cambie el toggle de inactivas o pageSize
  
  // pageSize control exists to request a larger page size (default 100).

  useEffect(() => {
    const calculateItemsPerPage = () => {
      try {
        const height = window.innerHeight || 800;
        const available = height - 520;
        const rowHeight = 100; // por fila en diseño admin
        const calculated = Math.max(4, Math.min(12, Math.floor(available / rowHeight)));
        setItemsPerPage(calculated);
      } catch (err) {
        setItemsPerPage(4);
      }
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  // Detectar si viene del parámetro refresh en la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refresh') === 'true') {
        console.log('🔄 Recarga forzada detectada desde URL');
        setRefreshKey(prev => prev + 1);
        // Limpiar el parámetro de la URL
        window.history.replaceState({}, '', '/admin/canchas');
      }
    }
  }, []);

  const editCourt = (courtId: string) => {
    router.push(`/admin/canchas/${courtId}`);
  };

  const createCourt = () => {
    router.push('/admin/canchas/crear');
  };

  const deleteCourt = async (courtId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cancha?')) return;
    
    try {
      console.log('🗑️ [AdminCanchas] Eliminando cancha ID:', courtId);
      console.log('🗑️ [AdminCanchas] Estado actual de canchas:', courts.length);
      
      // ✅ ACTUALIZADO: Usar método del servicio que usa el endpoint correcto
      const result = await canchaService.deleteCancha(Number(courtId));
      console.log('✅ [AdminCanchas] Resultado de eliminación:', result);
      
      // 🔥 IMPORTANTE: Actualizar estado local Y recargar desde servidor
      console.log('🔄 [AdminCanchas] Filtrando cancha del estado local...');
      setCourts(prevCourts => {
        const filtered = prevCourts.filter(court => court.id !== courtId);
        console.log(`🔄 [AdminCanchas] Canchas antes: ${prevCourts.length}, después: ${filtered.length}`);
        return filtered;
      });
      
      // 🔄 Recargar canchas desde el servidor para asegurar sincronización
      console.log('🔄 [AdminCanchas] Recargando lista completa desde el servidor...');
      setTimeout(async () => {
        await loadCourts();
        console.log('✅ [AdminCanchas] Lista recargada desde servidor');
      }, 500);
      
      show('success', 'Cancha eliminada exitosamente');
      console.log('✅ [AdminCanchas] Proceso de eliminación completado');
    } catch (error: any) {
      console.error('❌ [AdminCanchas] Error eliminando cancha:', error);
      const errorMsg = error?.message || 'Error desconocido';
      show('error', `Error al eliminar la cancha: ${errorMsg}`);
    }
  };

  // Filtrar canchas basado en búsqueda
  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCourts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourts = filteredCourts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Inactivo':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Por revisar':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard-container">
        <div className="estadisticas-header">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Canchas</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando canchas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Canchas</h1>
        
        <div className="admin-controls">
          <button 
            className="export-button" 
            onClick={() => {
              console.log('🔄 Recarga manual solicitada');
              setRefreshKey(prev => prev + 1);
            }}
            title="Recargar todas las canchas (incluye inactivas)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>

          {/* 🔥 NUEVO: Toggle para mostrar/ocultar canchas inactivas */}
          <button 
            className={`export-button ${showInactive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => {
              console.log('🔄 Cambiando filtro de inactivas de', showInactive, 'a', !showInactive);
              setShowInactive(!showInactive);
            }}
            title={showInactive ? 'Ocultar canchas eliminadas/inactivas' : 'Mostrar canchas eliminadas/inactivas'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showInactive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
            {showInactive ? 'Mostrar todas' : 'Solo activas'}
          </button>

          {/* Quitar botón 'Mostrar más' — errores con page_size altos */}

          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button" onClick={createCourt}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Cancha
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Canchas</h2>
          
          <div className="admin-search-filter">
            {/* Búsqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtro */}
            <button className="btn-filtrar">
              Filtrar
            </button>
          </div>
        </div>
        
        {/* Tabla Principal */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourts.map((court) => (
                <tr key={court.id}>
                  <td data-label="Nombre">
                    <div className="admin-cell-title">{court.name}</div>
                  </td>
                  <td data-label="Ubicación">
                    <div className="admin-cell-text">{court.location}</div>
                  </td>
                  <td data-label="Estado">
                    <span className={`status-badge px-2 py-1 text-xs rounded-full ${getStatusBadge(court.status)}`}>
                      {court.status}
                    </span>
                  </td>
                  <td data-label="Tipo">
                    <div className="admin-cell-text capitalize">{court.type}</div>
                  </td>
                  <td data-label="Acciones">
                    <div className="admin-actions-container">
                      {/* Botón Editar */}
                      <button 
                        className="btn-action btn-editar" 
                        title="Editar"
                        onClick={() => editCourt(court.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Botón Eliminar */}
                      <button 
                        className="btn-action btn-eliminar" 
                        title="Eliminar"
                        onClick={() => deleteCourt(court.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCourts.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron canchas que coincidan con la búsqueda' : 'No hay canchas disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="admin-pagination-container">
          <div className="admin-pagination-info">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCourts.length)} de {filteredCourts.length} canchas
          </div>
          
          <div className="admin-pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-pagination"
            >
              Anterior
            </button>
            
            <div className="admin-pagination-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`btn-pagination ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-pagination"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}