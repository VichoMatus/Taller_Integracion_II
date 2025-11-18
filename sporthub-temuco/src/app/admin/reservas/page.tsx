'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reservaService } from '@/services/reservaService';
import Modal from '@/components/Modal';
import { useAdminToast } from '@/components/admin/AdminToast';
import { apiBackend } from '@/config/backend';
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cargar reservas desde el backend usando endpoint admin
  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Obtener ID del usuario actual
      const userData = localStorage.getItem('userData');
      let adminId: number | undefined;
      let complejoId: number | undefined;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          adminId = user?.id_usuario || user?.id;
          console.log('🔍 [loadReservas] Admin ID:', adminId);
          
          // 2. ⚠️ WORKAROUND: Obtener complejo del admin consultando /complejos/admin/:adminId
          // Esto es temporal hasta que el backend agregue complejoId a /auth/me
          if (adminId) {
            try {
              console.log('🔍 [loadReservas] Obteniendo complejo del admin...');
              const complejosResponse = await apiBackend.get(`/complejos/admin/${adminId}`);
              console.log('� [loadReservas] Respuesta de complejos:', complejosResponse.data);
              
              // Manejar diferentes formatos de respuesta
              let complejos = [];
              if (Array.isArray(complejosResponse.data)) {
                complejos = complejosResponse.data;
              } else if (complejosResponse.data?.items && Array.isArray(complejosResponse.data.items)) {
                complejos = complejosResponse.data.items;
              } else if (complejosResponse.data?.data && Array.isArray(complejosResponse.data.data)) {
                complejos = complejosResponse.data.data;
              }
              
              if (complejos.length > 0) {
                // Usar el primer complejo (un admin generalmente tiene un solo complejo)
                complejoId = complejos[0]?.id_complejo || complejos[0]?.id || complejos[0]?.complejoId;
                console.log('✅ [loadReservas] Complejo encontrado:', complejoId);
              } else {
                console.warn('⚠️ [loadReservas] El admin no tiene complejos asociados');
              }
            } catch (err) {
              console.error('❌ [loadReservas] Error al obtener complejo del admin:', err);
            }
          }
        } catch (err) {
          console.warn('⚠️ [loadReservas] No se pudo parsear userData');
        }
      } else {
        console.warn('⚠️ [loadReservas] No hay userData en localStorage');
      }
      
      // 3. Llamar al servicio de reservas con el filtro de complejo
      console.log('🔍 [loadReservas] Llamando a getAdminReservas() con filtros:', { complejoId });
      // Pedimos una page_size mayor para panel admin (min 100) — el backend soporta paginación
      const filtros: any = complejoId ? { complejoId, page_size: 100 } : { page_size: 100 };
      const response: any = await reservaService.getAdminReservas(filtros);
      
      console.log("📥 [loadReservas] Respuesta completa del servidor:", response);
      console.log("📥 [loadReservas] Tipo de response:", typeof response);
      console.log("📥 [loadReservas] Es array?:", Array.isArray(response));
      console.log("📥 [loadReservas] Keys:", response ? Object.keys(response) : 'null/undefined');
      
      // Manejar diferentes formatos de respuesta
      let reservasArray = [];
      
      // Array directo (lo más probable después del interceptor)
      if (Array.isArray(response)) {
        reservasArray = response;
        console.log("✅ Formato detectado: Array directo");
      }
      // Formato con items: { items: [...], total, page, pageSize }
      else if (response?.items && Array.isArray(response.items)) {
        reservasArray = response.items;
        console.log("✅ Formato detectado: Paginación con items");
      } 
      // Formato envelope del BFF con paginación: { ok: true, data: { items: [...], page, pageSize, total } }
      else if (response?.ok && response?.data?.items && Array.isArray(response.data.items)) {
        reservasArray = response.data.items;
        console.log("✅ Formato detectado: Envelope BFF con paginación");
      }
      // Formato envelope del BFF con array directo: { ok: true, data: [...] }
      else if (response?.ok && Array.isArray(response?.data)) {
        reservasArray = response.data;
        console.log("✅ Formato detectado: Envelope BFF con array directo");
      }
      // Formato con data: { data: [...] }
      else if (response?.data && Array.isArray(response.data)) {
        reservasArray = response.data;
        console.log("✅ Formato detectado: Data wrapper");
      }
      else {
        console.warn('⚠️ Formato inesperado de respuesta:', response);
        console.warn('⚠️ Estructura:', Object.keys(response || {}));
        console.warn('⚠️ Contenido completo:', JSON.stringify(response, null, 2));
        reservasArray = [];
      }
      
      console.log("📊 Total de reservas procesadas:", reservasArray.length);
      
      setReservas(reservasArray);
      
      if (reservasArray.length === 0) {
        setError('No hay reservas para mostrar. Las reservas aparecerán aquí.');
      }
    } catch (err: any) {
      console.error('❌ Error al cargar reservas:', err);
      console.error('❌ Error response:', err?.response);
      console.error('❌ Error data:', err?.response?.data);
      
      // Extraer mensaje del error
      let errorMessage = 'Error al cargar reservas del servidor. Verifique su conexión.';
      if (err?.message && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al inicio y cuando cambien los filtros
  useEffect(() => {
    // Recalcular items por página según altura disponible (más o menos filas)
    const calculateItemsPerPage = () => {
      try {
        const height = window.innerHeight || 800;
        // Reservar espacio para headers y controles
        const availableHeight = height - 520;
        const rowHeight = 78; // aproximación de altura por fila
        const calculated = Math.max(4, Math.min(20, Math.floor(availableHeight / rowHeight)));
        setItemsPerPage(calculated);
      } catch (err) {
        setItemsPerPage(10);
      }
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);

    // Cargar reservas cuando cambie la página, búsqueda o estado
    loadReservas();

    return () => window.removeEventListener('resize', calculateItemsPerPage);
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
  // Nota: Eliminar reserva no se usa actualmente en el panel.
  // Se mantiene la función si más adelante se habilita, pero por ahora no se expone en la UI.

  // Función para cancelar reserva como administrador (forzar cancelación)
  const cancelReservationAdmin = async (reservationId: number) => {
    if (window.confirm('¿Deseas cancelar esta reserva como administrador? Esta acción es permanente.')) {
      try {
        await reservaService.cancelarReservaAdmin(reservationId);
        showToast('success', 'Reserva cancelada exitosamente');
        loadReservas(); // Recargar la lista
      } catch (err: any) {
        console.error('Error al cancelar reserva:', err);
        showToast('error', err.message || 'No se pudo cancelar la reserva');
      }
    }
  };

  // Función para confirmar reserva como administrador
  // Modal-driven confirmation flow
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingReservationId, setConfirmingReservationId] = useState<number | null>(null);
  const [optionSelected, setOptionSelected] = useState<'none' | 'paid' | 'notPaid'>('none');
  const [selectedMetodo, setSelectedMetodo] = useState<string>('efectivo');

  const openConfirmModal = (reservationId: number) => {
    setConfirmingReservationId(reservationId);
    setOptionSelected('none');
    setSelectedMetodo('efectivo');
    setShowConfirmModal(true);
  };

  const { show: showToast } = useAdminToast();

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmingReservationId(null);
  };

  useEffect(() => {
    console.log('[ReservasPage] showConfirmModal=', showConfirmModal);
  }, [showConfirmModal]);

  const handleConfirmReservation = async () => {
    if (!confirmingReservationId) return;

    try {
      if (optionSelected === 'paid') {
        await reservaService.confirmarReservaConMetodo(confirmingReservationId, selectedMetodo);
        showToast('success', `Reserva confirmada y marcada como pagada (${selectedMetodo})`);
      } else if (optionSelected === 'notPaid') {
        // Si seleccionó 'Sin pagar' entonces cancelar la reserva, no confirmarla
        await reservaService.cancelarReservaAdmin(confirmingReservationId);
        showToast('info', 'Reserva cancelada: No fue confirmada porque no estaba pagada');
      } else {
        // Opción no seleccionada - no hace nada
        return;
      }
      closeConfirmModal();
      loadReservas();
    } catch (err: any) {
      console.error('Error al confirmar reserva desde modal:', err);
      showToast('error', err?.message || 'Error al confirmar reserva');
    }
  };

  const handleNotPaid = async () => {
    if (!confirmingReservationId) return;

    // Cancelación automática: la reserva se cancela inmediatamente cuando el admin
    // decide que no está pagada (no se muestra diálogo adicional).

    try {
      await reservaService.cancelarReservaAdmin(confirmingReservationId);
      showToast('info', 'Reserva cancelada: no fue confirmada por no estar pagada');
      closeConfirmModal();
      loadReservas();
    } catch (err: any) {
      console.error('Error al cancelar reserva (sin pagar):', err);
      showToast('error', err?.message || 'Error al cancelar reserva');
    }
  };

  // Reintroducir el flujo estándar (sin modal) para depuración y pruebas rápidas
  const confirmReservationAdmin = async (reservationId: number) => {
    console.log('[confirmReservationAdmin] inicio', reservationId);
    const continuar = window.confirm('¿Deseas confirmar esta reserva como administrador?');
    if (!continuar) return;

    const pagoRealizado = window.confirm('¿Ya se ha realizado el pago de esta reserva? (Aceptar = Sí, Cancelar = No)');

    try {
      if (pagoRealizado) {
        let metodo = window.prompt('Indica el método de pago (efectivo, tarjeta, transferencia, online). Dejar vacío = efectivo.');
        metodo = (metodo || 'efectivo').toLowerCase();
        const validos = ['efectivo', 'tarjeta', 'transferencia', 'online', 'webpay'];
        if (!validos.includes(metodo)) metodo = 'efectivo';

        console.log('[confirmReservationAdmin] confirmar con metodo', metodo);
        await reservaService.confirmarReservaConMetodo(reservationId, metodo);
        showToast('success', 'Reserva confirmada y marcada como pagada (' + metodo + ')');
      } else {
        console.log('[confirmReservationAdmin] confirmar sin pago');
        await reservaService.confirmarReserva(reservationId);
        showToast('info', 'Reserva confirmada sin método de pago establecido');
      }

      loadReservas();
    } catch (err: any) {
      console.error('Error al confirmar la reserva (estandar):', err);
      showToast('error', err?.message || 'No se pudo confirmar la reserva (estandar)');
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
  // ⚠️ FIX ZONA HORARIA: Extraer fecha/hora directamente del string ISO sin conversión UTC
  const formatFecha = (fechaISO: string) => {
    // Si viene con Z al final, quitarla para evitar conversión UTC
    const fechaSinZ = fechaISO.replace('Z', '').replace(/\.\d{3}/, ''); // Quitar Z y milisegundos
    
    // Extraer componentes manualmente
    const [datePart, timePart] = fechaSinZ.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = (timePart || '00:00').split(':');
    
    // Formatear manualmente sin conversión
    return `${day}/${month}/${year} ${hour}:${minute}`;
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
    <>
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
              {reservas
                .filter(r => {
                  // Filtros por búsqueda básica y estado
                  const term = searchTerm.trim().toLowerCase();
                  if (term) {
                    const inUsuario = (r.usuario?.nombre || '').toLowerCase().includes(term) || (r.usuario?.apellido || '').toLowerCase().includes(term) || (r.usuario?.email || '').toLowerCase().includes(term);
                    const inCancha = (r.cancha?.nombre || `cancha ${r.canchaId}`).toLowerCase().includes(term);
                    if (!inUsuario && !inCancha) return false;
                  }
                  if (selectedEstado !== '') {
                    return r.estado === (selectedEstado as EstadoReserva);
                  }
                  return true;
                })
                .slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage)
                .map((reserva, index) => (
                <tr key={reserva.id || `reserva-${index}`}>
                  <td data-label="Usuario">
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
                  <td data-label="Cancha">
                    <div className="admin-cell-subtitle">
                      {reserva.cancha?.nombre || `Cancha ${reserva.canchaId}`}
                    </div>
                    {reserva.cancha?.tipo && (
                      <div className="admin-cell-text" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                        {reserva.cancha.tipo}
                      </div>
                    )}
                  </td>
                  <td data-label="Estado">
                    {getStatusBadge(reserva.estado)}
                  </td>
                  <td data-label="Fecha/Hora">
                    <div className="admin-cell-text">{formatFecha(reserva.fechaInicio)}</div>
                    <div className="admin-cell-text" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                      hasta {formatFecha(reserva.fechaFin)}
                    </div>
                  </td>
                  <td data-label="Precio">
                    <div className="admin-cell-text">${reserva.precioTotal.toLocaleString()}</div>
                  </td>
                  <td data-label="Pagado">
                    <span className={`status-badge ${reserva.pagado ? 'status-activo' : 'status-por-revisar'}`}>
                      {reserva.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td data-label="Acciones">
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
                          className="btn-action btn-cancelar" 
                          title="Cancelar Reserva"
                          onClick={() => cancelReservationAdmin(reserva.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {/* Botón Confirmar (solo si está pendiente) */}
                      {reserva.estado === 'pendiente' && (
                        <button
                          className="btn-action btn-confirmar"
                          type="button"
                          title="Confirmar Reserva"
                          onClick={() => openConfirmModal(reserva.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Eliminado: botón Borrar no se utiliza. */}
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
              {(() => {
                // Calcular info de paginación
                const filtered = reservas.filter(r => {
                  const term = searchTerm.trim().toLowerCase();
                  if (term) {
                    const inUsuario = (r.usuario?.nombre || '').toLowerCase().includes(term) || (r.usuario?.apellido || '').toLowerCase().includes(term) || (r.usuario?.email || '').toLowerCase().includes(term);
                    const inCancha = (r.cancha?.nombre || `cancha ${r.canchaId}`).toLowerCase().includes(term);
                    if (!inUsuario && !inCancha) return false;
                  }
                  if (selectedEstado !== '') {
                    return r.estado === (selectedEstado as EstadoReserva);
                  }
                  return true;
                });

                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);

                return `Mostrando ${startIndex + 1} a ${endIndex} de ${filtered.length} reservas`;
              })()}
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
              disabled={reservas.filter(r => {
                const term = searchTerm.trim().toLowerCase();
                if (term) {
                  const inUsuario = (r.usuario?.nombre || '').toLowerCase().includes(term) || (r.usuario?.apellido || '').toLowerCase().includes(term) || (r.usuario?.email || '').toLowerCase().includes(term);
                  const inCancha = (r.cancha?.nombre || `cancha ${r.canchaId}`).toLowerCase().includes(term);
                  if (!inUsuario && !inCancha) return false;
                }
                if (selectedEstado !== '') {
                  return r.estado === (selectedEstado as EstadoReserva);
                }
                return true;
              }).length < itemsPerPage}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      </div>
      {/* Modal para confirmar reserva y método de pago */}
      <Modal open={showConfirmModal} onClose={closeConfirmModal}>
        <div className="modal-container">
          <div className="modal-header">
            <h3 className="modal-title">Confirmar Reserva</h3>
            <button className="modal-close" onClick={closeConfirmModal}>×</button>
          </div>
          <div className="modal-body">
            <p>¿Deseas confirmar la reserva como administrador?</p>
            <div style={{ marginTop: '12px' }} className="method-action-row">
              <button
                type="button"
                onClick={() => setOptionSelected('paid')}
                className={`btn-guardar ${optionSelected === 'paid' ? 'selected' : ''}`}
                style={{ marginRight: 8 }}
              >
                Sí, elegir método de pago
              </button>

              <button
                type="button"
                onClick={() => { setOptionSelected('notPaid'); handleNotPaid(); }}
                className="btn-volver"
              >
                Sin pagar
              </button>
            </div>

            {optionSelected === 'paid' && (
              <div className="method-group">
                <label style={{ fontWeight: 600, marginTop: 8 }}>Selecciona el método de pago</label>
                {['efectivo', 'tarjeta', 'transferencia', 'online', 'webpay'].map((m) => (
                  <div key={m} className={`method-option ${selectedMetodo === m ? 'selected' : ''}`} onClick={() => setSelectedMetodo(m)}>
                    <input type="radio" id={`m-${m}`} name="metodoPago" value={m} checked={selectedMetodo === m} onChange={() => setSelectedMetodo(m)} />
                    <label htmlFor={`m-${m}`} style={{ textTransform: 'capitalize' }}>{m}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
            {optionSelected === 'paid' && (
              <div className="modal-actions">
                <button type="button" onClick={closeConfirmModal} className="btn-volver">Cancelar</button>
                <button type="button" onClick={handleConfirmReservation} className="btn-guardar btn-confirmar">Confirmar</button>
              </div>
            )}
        </div>
      </Modal>
    </>
  );
}