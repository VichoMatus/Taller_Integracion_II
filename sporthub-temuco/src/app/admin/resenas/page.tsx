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
  const itemsPerPage = 10;

  // Cargar resenas
  const loadResenas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ResenaListQuery = {
        page: currentPage,
        size: itemsPerPage,
        ...(selectedCalificacion && { 
          calificacion_min: selectedCalificacion, 
          calificacion_max: selectedCalificacion 
        })
      };
      
      const data = await resenaService.listarResenas(filters);
      setResenas(data);
    } catch (err: any) {
      console.warn('Backend no disponible, usando datos mock:', err);
      setError('Conectando con datos de desarrollo (backend no disponible)');
      // Usar datos mock en caso de error para development
      setResenas([
        {
          id_resena: 1,
          id_usuario: 1,
          id_cancha: 1,
          id_reserva: 1,
          calificacion: 5,
          comentario: 'Excelente cancha, muy bien mantenida y con buen cesped.',
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        },
        {
          id_resena: 2,
          id_usuario: 2,
          id_cancha: 1,
          id_reserva: 2,
          calificacion: 4,
          comentario: 'Muy buena experiencia, solo faltaba un poco mas de iluminacion.',
          fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
          fecha_actualizacion: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResenas();
  }, [currentPage, selectedCalificacion]);

  // Filtrar resenas por termino de busqueda
  const filteredResenas = resenas.filter(resena =>
    resena.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resena.id_usuario.toString().includes(searchTerm) ||
    resena.id_cancha.toString().includes(searchTerm)
  );

  // Funcion para navegar a editar resena
  const editResena = (resenaId: number | string) => {
    router.push(`/admin/resenas/${resenaId}`);
  };

  // Funcion para navegar a crear resena
  const createResena = () => {
    router.push('/admin/resenas/crear');
  };

  // Funcion para eliminar resena
  const deleteResena = async (resenaId: number | string) => {
    if (window.confirm('¿Estas seguro de que deseas eliminar esta resena?')) {
      try {
        await resenaService.eliminarResena(resenaId);
        alert('Resena eliminada exitosamente');
        loadResenas(); // Recargar la lista
      } catch (err: any) {
        console.warn('No se pudo eliminar (backend no disponible):', err);
        alert('No se puede eliminar en modo desarrollo (backend no disponible)');
      }
    }
  };

  // Funcion para obtener el emoji de calificacion
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

      {/* Mensaje Informativo */}
      {error && (
        <div className="info-container">
          <div className="info-icon">ℹ️</div>
          <p>{error}</p>
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
              {filteredResenas.map((resena) => (
                <tr key={resena.id_resena}>
                  <td>#{resena.id_resena}</td>
                  <td>Usuario {resena.id_usuario}</td>
                  <td>Cancha {resena.id_cancha}</td>
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
                  <td>{formatFecha(resena.fecha_creacion)}</td>
                  <td>
                    <div className="admin-actions-container">
                      {/* Boton Editar */}
                      <button 
                        className="btn-action btn-editar" 
                        title="Editar"
                        onClick={() => editResena(resena.id_resena)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Boton Eliminar */}
                      <button 
                        className="btn-action btn-eliminar" 
                        title="Eliminar"
                        onClick={() => deleteResena(resena.id_resena)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
