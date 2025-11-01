'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resenaService } from '@/services/resenaService';
import { Resena, ResenaListQuery } from '@/types/resena';
import '../dashboard.css';

export default function ResenasPage() {
  const router = useRouter();
  
  // Estados del componente
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCalificacion, setSelectedCalificacion] = useState<number | ''>('');
  const [orderBy, setOrderBy] = useState<"recientes" | "mejor" | "peor">("recientes");
  const [totalResenas, setTotalResenas] = useState(0);
  const itemsPerPage = 10;

  // Cargar reseñas desde el backend
  const loadResenas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [loadResenas] Cargando reseñas...');
      
      const filters: ResenaListQuery = {
        page: currentPage,
        page_size: itemsPerPage,
        order: orderBy
      };
      
      const data = await resenaService.listarResenas(filters);
      console.log('✅ [loadResenas] Reseñas obtenidas:', data?.length || 0);
      
      setResenas(data || []);
      setTotalResenas(data?.length || 0);
    } catch (err: any) {
      console.error('❌ [loadResenas] Error al cargar reseñas:', err);
      
      // Extraer mensaje del error de forma segura
      let errorMsg = 'Error al cargar reseñas';
      
      // Intentar diferentes estructuras de error
      if (typeof err === 'string') {
        errorMsg = err;
      } else if (err?.message && typeof err.message === 'string') {
        errorMsg = err.message;
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err?.details) {
        errorMsg = err.details;
      } else if (typeof err === 'object') {
        // Si es un objeto, convertirlo a JSON string como último recurso
        try {
          errorMsg = JSON.stringify(err);
        } catch {
          errorMsg = 'Error desconocido al cargar reseñas';
        }
      }
      
      setError(errorMsg);
      setResenas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResenas();
  }, [currentPage, orderBy]);

  // Filtrar reseñas por término de búsqueda y calificación
  const filteredResenas = resenas.filter(resena => {
    const matchesSearch = !searchTerm || 
      resena.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resena.usuarioId.toString().includes(searchTerm) ||
      (resena.canchaId && resena.canchaId.toString().includes(searchTerm)) ||
      (resena.complejoId && resena.complejoId.toString().includes(searchTerm));
    
    const matchesCalificacion = !selectedCalificacion || 
      resena.calificacion === selectedCalificacion;
    
    return matchesSearch && matchesCalificacion;
  });

  // Función para navegar a editar reseña
  const editResena = (resenaId: number) => {
    router.push(`/admin/resenas/${resenaId}`);
  };

  // Función para navegar a crear reseña
  const createResena = () => {
    router.push('/admin/resenas/crear');
  };

  // Función para eliminar reseña
  const deleteResena = async (resenaId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      return;
    }
    
    try {
      await resenaService.eliminarResena(resenaId);
      alert('Reseña eliminada exitosamente');
      loadResenas();
    } catch (err: any) {
      console.error('❌ Error al eliminar reseña:', err);
      alert(err.message || 'Error al eliminar la reseña');
    }
  };

  // Función para obtener emoji según calificación
  const getCalificacionEmoji = (calificacion: number) => {
    const emojis = ['😡', '😞', '😐', '😊', '🤩'];
    return emojis[calificacion - 1] || '❓';
  };

  // Funcion para formatear fecha
  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <p>Cargando resenas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestion de Resenas</h1>
        
        <div className="admin-controls">
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button" onClick={createResena}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Resena
          </button>
        </div>
      </div>

      {/* Mensaje de Advertencia - Backend No Disponible */}
      {resenas.length === 0 && !loading && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#92400e' }}>
                Backend de Reseñas No Disponible
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#78350f' }}>
                El backend de FastAPI tiene un error SQL que impide cargar las reseñas.
              </p>
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#92400e' }}>
                  Ver detalles técnicos
                </summary>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Error:</strong> <code>missing FROM-clause entry for table "agg"</code>
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Archivo:</strong> <code>BACKEND_BUG_RESENAS_SQL.md</code>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Workaround:</strong> El BFF devuelve array vacío temporalmente.
                    Las funcionalidades de crear/editar reseñas funcionan correctamente.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Error Genérico */}
      {error && (
        <div className="error-container" style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>❌</span>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#c00' }}>
                Error al cargar reseñas
              </h3>
              <p style={{ margin: 0, color: '#600' }}>
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Resenas</h2>
          
          <div className="admin-search-filter">
            {/* Busqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar por comentario, usuario o cancha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtro por Calificacion */}
            <div className="admin-filter-container">
              <select
                value={selectedCalificacion}
                onChange={(e) => setSelectedCalificacion(e.target.value ? parseInt(e.target.value) : '')}
                className="admin-filter-select"
              >
                <option value="">Todas las calificaciones</option>
                <option value={5}>⭐⭐⭐⭐⭐ (5 estrellas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 estrellas)</option>
                <option value={3}>⭐⭐⭐ (3 estrellas)</option>
                <option value={2}>⭐⭐ (2 estrellas)</option>
                <option value={1}>⭐ (1 estrella)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Cancha</th>
                <th>Calificacion</th>
                <th>Comentario</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredResenas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchTerm || selectedCalificacion 
                      ? 'No se encontraron reseñas con los filtros aplicados' 
                      : 'No hay reseñas disponibles'}
                  </td>
                </tr>
              ) : (
                filteredResenas.map((resena) => (
                  <tr key={resena.id}>
                    <td>#{resena.id}</td>
                    <td>Usuario #{resena.usuarioId}</td>
                    <td>
                      {resena.canchaId ? `Cancha #${resena.canchaId}` : 
                       resena.complejoId ? `Complejo #${resena.complejoId}` : 
                       'N/A'}
                    </td>
                    <td>
                      <div className="calificacion-cell">
                        <span className="calificacion-emoji">
                          {getCalificacionEmoji(resena.calificacion)}
                        </span>
                        <span className="calificacion-numero">
                          {resena.calificacion}/5
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="comentario-cell">
                        {resena.comentario ? (
                          resena.comentario.length > 50 
                            ? `${resena.comentario.substring(0, 50)}...`
                            : resena.comentario
                        ) : 'Sin comentario'}
                      </div>
                    </td>
                    <td>{formatFecha(resena.fechaCreacion)}</td>
                    <td>
                      <div className="admin-actions-container">
                        {/* Botón Editar */}
                        <button 
                          className="btn-action btn-editar" 
                          title="Editar"
                          onClick={() => editResena(resena.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        {/* Botón Eliminar */}
                        <button 
                          className="btn-action btn-eliminar" 
                          title="Eliminar"
                          onClick={() => deleteResena(resena.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        <div className="admin-table-footer">
          <div className="admin-pagination-info">
            <span>
              Mostrando {Math.min(filteredResenas.length, itemsPerPage)} de {filteredResenas.length} resenas
            </span>
          </div>
          
          <div className="admin-pagination">
            <button 
              className="btn-pagination" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            
            <span className="pagination-current">
              Pagina {currentPage}
            </span>
            
            <button 
              className="btn-pagination" 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredResenas.length < itemsPerPage}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
