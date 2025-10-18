'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { Cancha, EstadoCancha } from '@/types/cancha';
import '../dashboard.css';

export default function CanchasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 4;

  // Cargar canchas desde el backend
  useEffect(() => {
    loadCanchas();
  }, []);

  const loadCanchas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await canchaService.getCanchas();
      setCanchas(data || []);
    } catch (err: any) {
      console.error('Error al cargar canchas:', err);
      setError(err.message || 'Error al cargar las canchas');
      // Fallback a datos mock en caso de error
      setCanchas(getMockCanchas());
    } finally {
      setLoading(false);
    }
  };

  // Datos mock como fallback - con estructura del backend real
  const getMockCanchas = (): Cancha[] => [
    { 
      id: 1, 
      nombre: 'Cancha Central', 
      tipo: 'futbol',
      techada: false,
      activa: true,
      establecimientoId: 1,
      precioPorHora: 25000,
      capacidad: 22,
      descripcion: 'Cancha principal del complejo',
      estado: 'disponible'
    },
    { 
      id: 2, 
      nombre: 'Cancha Norte', 
      tipo: 'basquet',
      techada: true,
      activa: false,
      establecimientoId: 1,
      precioPorHora: 20000,
      capacidad: 10,
      descripcion: 'Cancha de básquetbol techada',
      estado: 'mantenimiento'
    }
  ];

  // Función para navegar a editar cancha
  const editCourt = (courtId: number) => {
    router.push(`/admin/canchas/${courtId}`);
  };

  // Función para navegar a crear cancha
  const createCourt = () => {
    router.push('/admin/canchas/crear');
  };

  // Función para eliminar cancha
  const deleteCourt = async (courtId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cancha?')) {
      return;
    }

    try {
      await canchaService.deleteCancha(courtId);
      await loadCanchas(); // Recargar la lista
    } catch (err: any) {
      alert('Error al eliminar la cancha: ' + (err.message || 'Error desconocido'));
    }
  };

  // Calcular estado basado en campo activa
  const getEstadoFromCancha = (cancha: Cancha): EstadoCancha => {
    if (cancha.estado) return cancha.estado; // Si viene del mock o backend viejo
    return cancha.activa ? 'disponible' : 'inactiva';
  };

  // Filtrar canchas basado en búsqueda
  const filteredCanchas = canchas.filter(cancha => {
    const matchesSearch = cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cancha.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cancha.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCanchas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCanchas = filteredCanchas.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'ocupada':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'inactiva':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
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
      </div>      {/* Contenedor Principal de la Tabla */}
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
                onChange={(e: any) => setSearchTerm(e.target.value)}
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
                <th>Tipo</th>
                <th>Precio/Hora</th>
                <th>Estado</th>
                <th>Capacidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                      <strong>Aviso:</strong> {error}
                      <br />
                      <small>Mostrando datos de ejemplo</small>
                    </div>
                  </td>
                </tr>
              )}
              {paginatedCanchas.map((cancha) => {
                const estado = getEstadoFromCancha(cancha);
                return (
                  <tr key={cancha.id}>
                    <td>
                      <div className="admin-cell-title">{cancha.nombre}</div>
                      {cancha.descripcion && (
                        <div className="admin-cell-subtitle">{cancha.descripcion}</div>
                      )}
                    </td>
                    <td>
                      <div className="admin-cell-text capitalize">{cancha.tipo}</div>
                      {cancha.techada && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Techada</span>
                      )}
                    </td>
                    <td>
                      {cancha.precioPorHora ? (
                        <div className="admin-cell-text font-semibold">{formatPrice(cancha.precioPorHora)}</div>
                      ) : (
                        <div className="admin-cell-text text-gray-400">No configurado</div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge px-2 py-1 text-xs rounded-full ${getStatusBadge(estado)}`}>
                        {estado}
                      </span>
                    </td>
                    <td>
                      {cancha.capacidad ? (
                        <div className="admin-cell-text">{cancha.capacidad} personas</div>
                      ) : (
                        <div className="admin-cell-text text-gray-400">No configurado</div>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions-container">
                        {/* Botón Editar */}
                        <button 
                          className="btn-action btn-editar" 
                          title="Editar"
                          onClick={() => editCourt(cancha.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        {/* Botón Refrescar */}
                        <button 
                          className="btn-action btn-aprobar" 
                          title="Refrescar datos"
                          onClick={loadCanchas}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        
                        {/* Botón Eliminar */}
                        <button 
                          className="btn-action btn-eliminar" 
                          title="Eliminar"
                          onClick={() => deleteCourt(cancha.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedCanchas.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
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
            mostrando {startIndex + 1} de {Math.min(startIndex + itemsPerPage, filteredCanchas.length)} canchas
          </div>
          
          <div className="admin-pagination-controls">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
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