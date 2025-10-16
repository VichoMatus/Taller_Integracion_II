'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { reservaService } from '@/services/reservaService';
import { canchaService } from '@/services/canchaService';
import { Reserva, UpdateReservaInput, EstadoReserva, MetodoPago } from '@/types/reserva';
import { Cancha } from '@/types/cancha';
import '../../dashboard.css';

export default function EditReservaPage() {
  const router = useRouter();
  const params = useParams();
  const reservaId = params.id as string;

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<UpdateReservaInput>({
    estado: 'pendiente',
    metodoPago: 'efectivo',
    pagado: false,
    notas: '',
    fechaInicio: '',
    fechaFin: ''
  });

  // Cargar datos de la reserva
  const loadReservaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar reserva específica
      const reservaData = await reservaService.getReservaById(parseInt(reservaId));
      setReserva(reservaData);
      
      // Llenar el formulario con los datos existentes
      setFormData({
        estado: reservaData.estado,
        metodoPago: reservaData.metodoPago || 'efectivo',
        pagado: reservaData.pagado,
        notas: reservaData.notas || '',
        fechaInicio: reservaData.fechaInicio.slice(0, 16), // Para datetime-local
        fechaFin: reservaData.fechaFin.slice(0, 16)
      });
      
      // Cargar lista de canchas para el selector
      try {
        const canchasData = await canchaService.getCanchas();
        setCanchas(canchasData);
      } catch (err) {
        console.warn('No se pudieron cargar las canchas:', err);
        setCanchas([]);
      }
      
    } catch (err: any) {
      console.warn('No se pudo cargar la reserva (backend no disponible):', err);
      setError('Modo desarrollo: No se puede conectar al backend para cargar los datos de la reserva');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservaData();
  }, [reservaId]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Convertir fechas de datetime-local a ISO
      const updateData = {
        ...formData,
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString() : undefined,
        fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : undefined
      };
      
      await reservaService.updateReserva(parseInt(reservaId), updateData);
      
      // Mostrar mensaje de éxito y redirigir
      alert('Reserva actualizada exitosamente');
      router.push('/admin/reservas');
    } catch (err: any) {
      console.warn('No se pudo guardar la reserva (backend no disponible):', err);
      setError('Modo desarrollo: No se puede guardar los cambios sin conexión al backend');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    router.push('/admin/reservas');
  };

  // Función para formatear fecha para mostrar
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
          <p>Cargando datos de la reserva...</p>
        </div>
      </div>
    );
  }

  if (error && !reserva) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="btn-secondary">
            Volver a Reservas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-layout">
      {/* Header */}
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <button onClick={handleCancel} className="btn-volver">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Editar Reserva</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="edit-reserva-form"
            className="btn-guardar" 
            disabled={saving}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="edit-reserva-form" onSubmit={handleSave} className="edit-court-card">
          {/* Información de la Reserva */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información de la Reserva</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="estado" className="edit-form-label">Estado:</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="edit-form-select"
                  required
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="completada">Completada</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label htmlFor="metodoPago" className="edit-form-label">Método de Pago:</label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleInputChange}
                  className="edit-form-select"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">
                  <input
                    type="checkbox"
                    name="pagado"
                    checked={formData.pagado}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Reserva pagada
                </label>
              </div>
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="edit-section">
            <h3 className="edit-section-title">Fechas y Horarios</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="fechaInicio" className="edit-form-label">Fecha y Hora de Inicio:</label>
                <input
                  type="datetime-local"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  className="edit-form-input"
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="fechaFin" className="edit-form-label">Fecha y Hora de Fin:</label>
                <input
                  type="datetime-local"
                  id="fechaFin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  className="edit-form-input"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="edit-section">
            <h3 className="edit-section-title">Notas Adicionales</h3>
            <div className="edit-form-group">
              <label htmlFor="notas" className="edit-form-label">Notas:</label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                className="edit-form-textarea"
                rows={4}
                placeholder="Notas adicionales sobre la reserva..."
              />
            </div>
          </div>

          {/* Información del Sistema */}
          {reserva && (
            <div className="edit-section">
              <h3 className="edit-section-title">Información del Sistema</h3>
              <div className="edit-form-grid">
                <div className="edit-info-item">
                  <span className="edit-info-label">ID de Reserva:</span>
                  <span className="edit-info-value">{reserva.id}</span>
                </div>
                
                <div className="edit-info-item">
                  <span className="edit-info-label">Usuario:</span>
                  <span className="edit-info-value">
                    {reserva.usuario ? 
                      `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.trim() || reserva.usuario.email 
                      : `Usuario ${reserva.usuarioId}`
                    }
                  </span>
                </div>
                
                <div className="edit-info-item">
                  <span className="edit-info-label">Cancha:</span>
                  <span className="edit-info-value">
                    {reserva.cancha?.nombre || `Cancha ${reserva.canchaId}`}
                  </span>
                </div>
                
                <div className="edit-info-item">
                  <span className="edit-info-label">Precio Total:</span>
                  <span className="edit-info-value">${reserva.precioTotal.toLocaleString()}</span>
                </div>
                
                <div className="edit-info-item">
                  <span className="edit-info-label">Creada:</span>
                  <span className="edit-info-value">
                    {formatFecha(reserva.fechaCreacion)}
                  </span>
                </div>
                
                {reserva.fechaActualizacion && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Última actualización:</span>
                    <span className="edit-info-value">
                      {formatFecha(reserva.fechaActualizacion)}
                    </span>
                  </div>
                )}
                
                {reserva.codigoConfirmacion && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Código de Confirmación:</span>
                    <span className="edit-info-value">{reserva.codigoConfirmacion}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}