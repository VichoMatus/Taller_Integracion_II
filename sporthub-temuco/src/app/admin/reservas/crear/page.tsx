'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reservaService } from '@/services/reservaService';
import { usuariosService } from '@/services/usuariosService';
import { canchaService } from '@/services/canchaService';
import { CreateReservaInput, MetodoPago } from '@/types/reserva';
import { Cancha } from '@/types/cancha';
import '../../dashboard.css';

export default function CreateReservaPage() {
  const router = useRouter();

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [usuarioBusqueda, setUsuarioBusqueda] = useState<string>('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<CreateReservaInput>({
    usuarioId: 0,
    canchaId: 0,
    fechaInicio: '',
    fechaFin: '',
    metodoPago: 'efectivo',
    notas: ''
  });

  // Calcular precio basado en horas y cancha seleccionada
  const [precioCalculado, setPrecioCalculado] = useState<number>(0);

  // Obtener ID del usuario actual del token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub ? parseInt(payload.sub) : 0;
        setCurrentUserId(userId);
        // Auto-asignar el usuario actual a la reserva
        setFormData(prev => ({ ...prev, usuarioId: userId }));
      } catch (err) {
        console.error('Error al decodificar token:', err);
      }
    }
  }, []);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ ACTUALIZADO: Usar endpoint de admin que filtra automáticamente por complejo del admin
      const result = await canchaService.getCanchasAdmin({
        incluir_inactivas: false, // Solo canchas activas para crear reservas
        sort_by: 'nombre',
        order: 'asc'
      });
      
      const canchasData = result.items || [];
      
      if (canchasData && canchasData.length > 0) {
        setCanchas(canchasData);
      } else {
        setError('No hay canchas disponibles. Debe crear canchas primero en "Gestión de Canchas".');
        setCanchas([]);
      }
      
    } catch (err: any) {
      console.error('Error al cargar canchas:', err);
      setError('No se pudieron cargar las canchas. ' + (err?.message || 'Verifique su conexión.'));
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Calcular precio cuando cambian fechas o cancha
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin && formData.canchaId) {
      const cancha = canchas.find(c => c.id === formData.canchaId);
      if (cancha) {
        const inicio = new Date(formData.fechaInicio);
        const fin = new Date(formData.fechaFin);
        const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        
        if (horas > 0) {
          const precio = Math.round(horas * (cancha.precioPorHora || 0));
  setPrecioCalculado(precio);
} else {
  setPrecioCalculado(0);
}
      }
    } else {
      setPrecioCalculado(0);
    }
  }, [formData.fechaInicio, formData.fechaFin, formData.canchaId, canchas]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Convertir valores según el campo
    let processedValue: any = value;
    if (name === 'usuarioId' || name === 'canchaId') {
      processedValue = parseInt(value) || 0;
      console.log(`🔄 [handleInputChange] ${name}:`, { raw: value, processed: processedValue });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  // Buscar usuario por ID (usar endpoint /usuarios/:id) — más fiable que /contacto
  const handleBuscarUsuario = async () => {
    setError(null);
    setUsuarioEncontrado(null);

    if (!usuarioBusqueda) {
      setError('Ingresa un ID de usuario para buscar');
      return;
    }

    try {
      const id = Number(usuarioBusqueda);
      if (!id) {
        setError('El ID debe ser numérico');
        return;
      }

      const usuario = await usuariosService.obtenerPublico(id);
      setUsuarioEncontrado(usuario);
      setFormData(prev => ({ ...prev, usuarioId: id }));
    } catch (err: any) {
      console.error('Error al buscar usuario:', err);
      // Si GET /usuarios/:id devuelve 404, igual asignar el ID manualmente.
      const status = err?.response?.status;
      if (status === 404) {
        const id = Number(usuarioBusqueda);
        setFormData(prev => ({ ...prev, usuarioId: id }));
        setUsuarioEncontrado(null);
        setError('No se encontró información de contacto, se asignará el ID ingresado.');
        return;
      }
      setError(err?.message || 'No se encontró el usuario');
    }
  };

  // Validar formulario
  const validateForm = (): string | null => {
    console.log('🔍 [validateForm] Validando datos:', {
      canchaId: formData.canchaId,
      usuarioId: formData.usuarioId,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin
    });
    
    if (!formData.canchaId || formData.canchaId === 0) {
      console.error('❌ [validateForm] canchaId inválido:', formData.canchaId);
      return 'Debe seleccionar una cancha';
    }
    if (!formData.fechaInicio) return 'Debe especificar la fecha y hora de inicio';
    if (!formData.fechaFin) return 'Debe especificar la fecha y hora de fin';
    
    const inicio = new Date(formData.fechaInicio);
    const fin = new Date(formData.fechaFin);
    
    if (fin <= inicio) return 'La fecha de fin debe ser posterior a la fecha de inicio';
    if (inicio < new Date()) return 'La fecha de inicio no puede ser en el pasado';
    
    const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    if (horas > 12) return 'La reserva no puede ser mayor a 12 horas';
    if (horas < 0.5) return 'La reserva debe ser de al menos 30 minutos';
    
    console.log('✅ [validateForm] Validación exitosa');
    return null;
  };

  // Crear reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Convertir fechas a formato requerido por backend
      // ⚠️ IMPORTANTE: Usar formato local, NO convertir a UTC para evitar diferencias horarias
      const fechaInicioDate = new Date(formData.fechaInicio);
      const fechaFinDate = new Date(formData.fechaFin);
      
      // Extraer fecha y horas en formato local (NO UTC) para evitar desfase de zona horaria
      // toLocaleDateString('en-CA') genera YYYY-MM-DD sin conversión UTC
      // toLocaleTimeString('en-GB') genera HH:MM en formato 24h sin conversión UTC
      const fecha_reserva = fechaInicioDate.toLocaleDateString('en-CA'); // YYYY-MM-DD formato ISO
      const hora_inicio = fechaInicioDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM
      const hora_fin = fechaFinDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM
      
      // Formato que espera el backend: { id_cancha, fecha_reserva, hora_inicio, hora_fin, id_usuario }
      const createData = {
        id_cancha: Number(formData.canchaId),
        fecha_reserva,
        hora_inicio,
        hora_fin,
        id_usuario: Number(formData.usuarioId),
        notas: formData.notas || ''
      };
      
      console.log('📤 [handleSubmit] Datos a enviar (formato backend):', createData);
      
      // CORREGIDO: Usar createReservaAdmin en lugar de createReserva
      // Esto llama al endpoint POST /api/reservas/admin/crear
      await reservaService.createReservaAdmin(createData);
      
      // Mostrar mensaje de éxito y redirigir
      alert('Reserva creada exitosamente como administrador');
      router.push('/admin/reservas');
    } catch (err: any) {
      console.error('Error al crear la reserva:', err);
      const errorMessage = typeof err?.message === 'string' 
        ? err.message 
        : err?.response?.data?.message 
        || JSON.stringify(err?.message || err) 
        || 'No se pudo crear la reserva. Verifique los datos e intente nuevamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    router.push('/admin/reservas');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <p>Cargando datos...</p>
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
          <h1 className="admin-page-title">Nueva Reserva</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="create-reserva-form"
            className="btn-guardar" 
            disabled={saving}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {saving ? 'Creando...' : 'Crear Reserva'}
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
        <form id="create-reserva-form" onSubmit={handleSubmit} className="edit-court-card">
          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="usuarioId" className="edit-form-label">Usuario: *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="usuarioDisplay"
                    value={usuarioEncontrado ? `${usuarioEncontrado.nombre || usuarioEncontrado.email || 'Usuario'} (ID: ${formData.usuarioId})` : `Usuario actual (ID: ${currentUserId})`}
                    className="edit-form-input"
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '.5rem' }}>
                  <input
                    type="text"
                    name="usuarioBusqueda"
                    placeholder="Buscar usuario por ID"
                    value={usuarioBusqueda}
                    onChange={(e) => setUsuarioBusqueda(e.target.value)}
                    className="edit-form-input"
                    style={{ flex: 1 }}
                  />

                  <button type="button" onClick={handleBuscarUsuario} className="btn-guardar" title="Buscar usuario">
                    Buscar
                  </button>

                  <button type="button" onClick={() => { setUsuarioBusqueda(''); setUsuarioEncontrado(null); setFormData(prev => ({ ...prev, usuarioId: currentUserId })); }} className="btn-volver">
                    Usar actual
                  </button>
                </div>

                <input
                  type="hidden"
                  name="usuarioId"
                  value={formData.usuarioId}
                />

                <p className="text-sm text-gray-600 mt-1">
                  ℹ️ Puedes buscar un usuario por su ID. Si no se especifica, la reserva se creará a nombre del usuario actual.
                </p>
              </div>

              <div className="edit-form-group">
                <label htmlFor="canchaId" className="edit-form-label">Cancha: *</label>
                <select
                  id="canchaId"
                  name="canchaId"
                  value={formData.canchaId}
                  onChange={handleInputChange}
                  className="edit-form-select"
                  required
                >
                  <option value={0}>Seleccionar cancha</option>
                  {canchas.map(cancha => (
                    <option key={cancha.id} value={cancha.id}>
                      {cancha.nombre} - ${(cancha.precioPorHora || 0).toLocaleString()}/hora
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="edit-section">
            <h3 className="edit-section-title">Fechas y Horarios</h3>
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

              {/* Mostrar precio calculado */}
              {precioCalculado > 0 && (
                <div className="edit-form-group">
                  <label className="edit-form-label">Precio Calculado:</label>
                  <div className="precio-calculado">
                    <span className="precio-valor">${precioCalculado.toLocaleString()}</span>
                    {formData.fechaInicio && formData.fechaFin && (
                      <span className="precio-detalle">
                        ({((new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) / (1000 * 60 * 60)).toFixed(1)} horas)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de Pago */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información de Pago</h3>
            <div className="edit-form-grid">
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
        </form>
      </div>
    </div>
  );
}