'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reservaService } from '@/services/reservaService';
import { Reserva, EstadoReserva } from '@/types/reserva';
import '../dashboard.css';

export default function ReservasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<EstadoReserva | ''>('');
  const itemsPerPage = 10;

  // Cargar reservas desde el backend usando endpoint admin
  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reservaService.getAdminReservas();
      
      console.log("Datos recibidos:", data);
      
      // Asegurarse de que data sea siempre un array
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // Si no hay datos, usar reservas mock
          setReservas([
            {
              id: 1,
              usuarioId: 1,
              canchaId: 1,
              complejoId: 1,
              fechaInicio: new Date().toISOString(),
              fechaFin: new Date(Date.now() + 3600000).toISOString(),
              estado: 'confirmada' as EstadoReserva,
              precioTotal: 25000,
              pagado: true,
              fechaCreacion: new Date().toISOString(),
              fechaActualizacion: new Date().toISOString(),
              usuario: { id: 1, email: 'miguel.chamo@email.com', nombre: 'Miguel', apellido: 'Chamo' },
              cancha: { id: 1, nombre: 'Cancha Central', tipo: 'futbol', precioPorHora: 25000 }
            },
            {
              id: 2,
              usuarioId: 2,
              canchaId: 2,
              complejoId: 1,
              fechaInicio: new Date(Date.now() + 86400000).toISOString(),
              fechaFin: new Date(Date.now() + 86400000 + 3600000).toISOString(),
              estado: 'pendiente' as EstadoReserva,
              precioTotal: 20000,
              pagado: false,
              fechaCreacion: new Date().toISOString(),
              fechaActualizacion: new Date().toISOString(),
              usuario: { id: 2, email: 'ana.garcia@email.com', nombre: 'Ana', apellido: 'García' },
              cancha: { id: 2, nombre: 'Cancha Norte', tipo: 'basquet', precioPorHora: 20000 }
            }
          ]);
        } else {
          setReservas(data);
        }
      } else {
        setReservas([]); // Si no es array, establecer array vacío
      }
    } catch (err: any) {
      console.error('Error al cargar reservas:', err);
      setError('Error al cargar reservas del servidor');
      // En caso de error, usar reservas mock
      setReservas([
        {
          id: 1,
          usuarioId: 1,
          canchaId: 1,
          complejoId: 1,
          fechaInicio: new Date().toISOString(),
          fechaFin: new Date(Date.now() + 3600000).toISOString(),
          estado: 'confirmada' as EstadoReserva,
          precioTotal: 25000,
          pagado: true,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          usuario: { id: 1, email: 'miguel.chamo@email.com', nombre: 'Miguel', apellido: 'Chamo' },
          cancha: { id: 1, nombre: 'Cancha Central', tipo: 'futbol', precioPorHora: 25000 }
        },
        {
          id: 2,
          usuarioId: 2,
          canchaId: 2,
          complejoId: 1,
          fechaInicio: new Date(Date.now() + 86400000).toISOString(),
          fechaFin: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          estado: 'pendiente' as EstadoReserva,
          precioTotal: 20000,
          pagado: false,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          usuario: { id: 2, email: 'ana.garcia@email.com', nombre: 'Ana', apellido: 'García' },
          cancha: { id: 2, nombre: 'Cancha Norte', tipo: 'basquet', precioPorHora: 20000 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al inicio y cuando cambien los filtros
  useEffect(() => {
    loadReservas();
  }, [currentPage, searchTerm, selectedEstado]);

  // Función para navegar a editar reserva
  const editReservation = (reservationId: number) => {
    router.push(`/admin/reservas/${reservationId}`);
  };

  // Función para navegar a crear reserva
  const createReservation = () => {
    router.push('/admin/reservas/crear');
  };

  // Función para eliminar reserva (como admin)
  const deleteReservation = async (reservationId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.')) {
      try {
        await reservaService.deleteReservaAdmin(reservationId);
        alert('Reserva eliminada exitosamente');
        loadReservas(); // Recargar la lista
      } catch (err: any) {
        console.error('Error al eliminar reserva:', err);
        alert(err.message || 'No se pudo eliminar la reserva');
      }
    }
  };

  // Función para cancelar reserva como administrador (forzar cancelación)
  const cancelReservationAdmin = async (reservationId: number) => {
    if (window.confirm('¿Deseas cancelar esta reserva como administrador? Esta acción es permanente.')) {
      try {
        await reservaService.cancelarReservaAdmin(reservationId);
        alert('Reserva cancelada exitosamente');
        loadReservas(); // Recargar la lista
      } catch (err: any) {
        console.error('Error al cancelar reserva:', err);
        alert(err.message || 'No se pudo cancelar la reserva');
      }
    }
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (estado: EstadoReserva) => {
    switch (estado) {
      case 'confirmada':
        return <span className="status-badge status-activo">Confirmada</span>;
      case 'pendiente':
        return <span className="status-badge status-por-revisar">Pendiente</span>;
      case 'cancelada':
        return <span className="status-badge status-inactivo">Cancelada</span>;
      case 'completada':
        return <span className="status-badge status-activo">Completada</span>;
      case 'no_show':
        return <span className="status-badge status-inactivo">No Show</span>;
      default:
        return <span className="status-badge">{estado}</span>;
    }
  };

  // Función para formatear fecha
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
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Reservas</h1>
        
        <div className="admin-controls">
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button" onClick={createReservation}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Reserva
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
          <h2 className="admin-table-title">Lista de Reservas</h2>
          
          <div className="admin-search-filter">
            {/* Búsqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar por usuario o cancha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtro por estado */}
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value as EstadoReserva | '')}
              className="btn-filtrar"
              style={{ maxWidth: '150px' }}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
        
        {/* Tabla Principal */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cancha</th>
                <th>Estado</th>
                <th>Fecha/Hora</th>
                <th>Precio</th>
                <th>Pagado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>
                    <div className="admin-cell-title">
                      {reserva.usuario ? 
                        `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.trim() || reserva.usuario.email 
                        : `Usuario ${reserva.usuarioId}`
                      }
                    </div>
                    {reserva.usuario?.email && (
                      <div className="admin-cell-subtitle">{reserva.usuario.email}</div>
                    )}
                  </td>
                  <td>
                    <div className="admin-cell-subtitle">
                      {reserva.cancha?.nombre || `Cancha ${reserva.canchaId}`}
                    </div>
                    {reserva.cancha?.tipo && (
                      <div className="admin-cell-text" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                        {reserva.cancha.tipo}
                      </div>
                    )}
                  </td>
                  <td>
                    {getStatusBadge(reserva.estado)}
                  </td>
                  <td>
                    <div className="admin-cell-text">{formatFecha(reserva.fechaInicio)}</div>
                    <div className="admin-cell-text" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                      hasta {formatFecha(reserva.fechaFin)}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell-text">${reserva.precioTotal.toLocaleString()}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${reserva.pagado ? 'status-activo' : 'status-por-revisar'}`}>
                      {reserva.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-container">
                      {/* Botón Editar */}
                      <button 
                        className="btn-action btn-editar" 
                        title="Editar"
                        onClick={() => editReservation(reserva.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Botón Cancelar (solo si no está cancelada o completada) */}
                      {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                        <button 
                          className="btn-action" 
                          title="Cancelar Reserva"
                          onClick={() => cancelReservationAdmin(reserva.id)}
                          style={{ backgroundColor: 'var(--warning)', color: 'white' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Botón Eliminar */}
                      <button 
                        className="btn-action btn-eliminar" 
                        title="Eliminar"
                        onClick={() => deleteReservation(reserva.id)}
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

        {/* Paginación */}
        <div className="admin-table-footer">
          <div className="admin-pagination-info">
            <span>
              Mostrando {Math.min(reservas.length, itemsPerPage)} de {reservas.length} reservas
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
              Página {currentPage}
            </span>
            
            <button 
              className="btn-pagination" 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={reservas.length < itemsPerPage}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}