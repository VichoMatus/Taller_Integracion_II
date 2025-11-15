'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { reservaService } from '@/services/reservaService';
import { Reserva, UpdateReservaInput, EstadoReserva, MetodoPago } from '@/types/reserva';
import '../../dashboard.css';

export default function EditReservaPage() {
  const router = useRouter();
  const params = useParams();
  const reservaId = params.id as string;

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔥 NUEVO: Estados para modales personalizados
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Estado del formulario - Solo campos editables según FastAPI
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    notas: ''
  });
  
  // 🔥 Funciones helper para mostrar modales personalizados
  const showSuccess = (message: string) => {
    setModalMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      router.push('/admin/reservas'); // Redirigir después de 2 segundos
    }, 2000);
  };

  const showError = (message: string) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  // Cargar datos de la reserva
  const loadReservaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar reserva específica
      const reservaData = await reservaService.getReservaById(parseInt(reservaId));
      setReserva(reservaData);
      
      // Llenar el formulario con los datos existentes
      // ⚠️ FIX ZONA HORARIA: Quitar 'Z' si existe para evitar conversión UTC
      const fechaInicioSinZ = reservaData.fechaInicio.replace('Z', '').replace(/\.\d{3}/, '');
      const fechaFinSinZ = reservaData.fechaFin.replace('Z', '').replace(/\.\d{3}/, '');
      
      setFormData({
        estado: reservaData.estado,
        metodoPago: reservaData.metodoPago || 'efectivo',
        pagado: reservaData.pagado,
        notas: reservaData.notas || '',
        fechaInicio: fechaInicioSinZ.slice(0, 16), // Para datetime-local (YYYY-MM-DDTHH:MM)
        fechaFin: fechaFinSinZ.slice(0, 16)
      });
      
    } catch (err: any) {
      console.error('Error al cargar la reserva:', err);
      setError(err?.message || 'No se pudo cargar la reserva. Verifique que la reserva existe y tiene permisos para acceder.');
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
      
      // ⚠️ FIX ZONA HORARIA: Extraer fecha y hora directamente del string datetime-local
      // NO usar new Date().toISOString() porque convierte a UTC causando desfase
      
      // Extraer partes directamente del string sin conversiones
      let updateData: any = { ...formData };
      
      if (formData.fechaInicio) {
        const [fecha_date, hora_time] = formData.fechaInicio.split('T');
        // Reconstruir en formato ISO pero sin la conversión UTC
        updateData.fechaInicio = `${fecha_date}T${hora_time}:00`;
      }
      
      if (formData.fechaFin) {
        const [fecha_date, hora_time] = formData.fechaFin.split('T');
        updateData.fechaFin = `${fecha_date}T${hora_time}:00`;
      }
      
      await reservaService.updateReserva(parseInt(reservaId), updateData);
      
      // ✅ Éxito: mostrar modal y redirigir automáticamente
      showSuccess('Reserva actualizada exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar la reserva:', err);
      showError(err?.message || 'No se pudo actualizar la reserva. Verifique los datos e intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    router.push('/admin/reservas');
  };

  // Función para formatear fecha para mostrar
  // ⚠️ FIX ZONA HORARIA: Extraer fecha/hora directamente del string ISO sin conversión UTC
  const formatFecha = (fechaISO: string) => {
    // Si viene con Z al final, quitarla para evitar conversión UTC
    const fechaSinZ = fechaISO.replace('Z', '').replace(/\.\d{3}/, '');
    
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
          
          {/* Información de Solo Lectura */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información de la Reserva (Solo Lectura)</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">Estado:</label>
                <div className="edit-form-readonly">
                  <span className={`status-badge status-${reserva?.estado}`}>
                    {reserva?.estado}
                  </span>
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Usuario:</label>
                <div className="edit-form-readonly">
                  {reserva?.usuario ? 
                    `${reserva.usuario.nombre || ''} ${reserva.usuario.apellido || ''}`.trim() || reserva.usuario.email 
                    : `Usuario #${reserva?.usuarioId}`
                  }
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Cancha:</label>
                <div className="edit-form-readonly">
                  {reserva?.cancha?.nombre || `Cancha #${reserva?.canchaId}`}
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Precio Total:</label>
                <div className="edit-form-readonly">
                  ${reserva?.precioTotal?.toLocaleString() || 0}
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Pagado:</label>
                <div className="edit-form-readonly">
                  <span className={`status-badge ${reserva?.pagado ? 'status-activo' : 'status-por-revisar'}`}>
                    {reserva?.pagado ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Método de Pago:</label>
                <div className="edit-form-readonly">
                  {reserva?.metodoPago || 'No especificado'}
                </div>
              </div>
            </div>
          </div>

          {/* Campos Editables: Fechas y Horarios */}
          <div className="edit-section">
            <h3 className="edit-section-title">Reprogramar Reserva</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="fechaInicio" className="edit-form-label">Fecha y Hora de Inicio: *</label>
                <input
                  type="datetime-local"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  required
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="fechaFin" className="edit-form-label">Fecha y Hora de Fin: *</label>
                <input
                  type="datetime-local"
                  id="fechaFin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Campos Editables: Notas */}
          <div className="edit-section">
            <h3 className="edit-section-title">Notas Adicionales</h3>
            <div className="edit-form-group">
              <label htmlFor="notas" className="edit-form-label">Notas o Motivo de Cambio:</label>
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

      {/* 🔥 Modal de éxito */}
      {showSuccessModal && (
        <div className="modal-success">
          <div className="modal-icon-success">✓</div>
          <p>{modalMessage}</p>
        </div>
      )}

      {/* 🔥 Modal de error */}
      {showErrorModal && (
        <div className="modal-error">
          <div className="modal-icon-error">✕</div>
          <p>{modalMessage}</p>
          <button 
            onClick={() => setShowErrorModal(false)}
            className="btn-secondary"
            style={{ marginTop: '15px' }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}