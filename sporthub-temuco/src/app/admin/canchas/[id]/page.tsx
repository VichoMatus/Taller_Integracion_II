'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { Cancha, UpdateCanchaInput, TipoCancha, EstadoCancha } from '@/types/cancha';
import '../../dashboard.css';

export default function EditCourtPage() {
  const router = useRouter();
  const params = useParams();
  const courtId = params.id as string;

  // Estados para el formulario
  const [cancha, setCancha] = useState<Cancha | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario - AMPLIADO con todos los campos editables
  const [formData, setFormData] = useState<UpdateCanchaInput>({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    activa: true,
    precioPorHora: 0,
    capacidad: 10,
    descripcion: ''
  });

  // Cargar datos de la cancha
  useEffect(() => {
    loadCanchaData();
  }, [courtId]);

  const loadCanchaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await canchaService.getCanchaById(parseInt(courtId));
      setCancha(data);
      
      // Llenar el formulario con los datos existentes - TODOS los campos editables
      setFormData({
        nombre: data.nombre,
        tipo: data.tipo,
        techada: data.techada,
        activa: data.activa,
        precioPorHora: data.precioPorHora || 0,
        capacidad: data.capacidad || 10,
        descripcion: data.descripcion || ''
      });
    } catch (err: any) {
      console.error('Error cargando cancha:', err);
      setError(err.message || 'Error al cargar los datos de la cancha');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardar cambios con VALIDACIONES COMPLETAS
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // ✅ VALIDACIÓN 1: Nombre (mínimo 3 caracteres)
      if (!formData.nombre?.trim()) {
        throw new Error('❌ El nombre de la cancha es requerido');
      }
      
      if (formData.nombre.trim().length < 3) {
        throw new Error('❌ El nombre debe tener al menos 3 caracteres');
      }

      // ⚠️ VALIDACIONES REMOVIDAS para campos no soportados
      // (precioPorHora, capacidad, descripcion no se pueden editar por limitación del backend)
      
      // 🔥 CRÍTICO: Solo enviar campos que el backend soporta en UPDATE
      // Según esquema de API: solo se pueden actualizar { nombre, deporte, cubierta, activo }
      const updatePayload: UpdateCanchaInput = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        techada: formData.techada,
        activa: formData.activa
      };
      
      console.log('💾 Guardando cambios de cancha (solo campos soportados):', updatePayload);
      console.log('⚠️ Campos NO enviados (no soportados por API):', {
        precioPorHora: formData.precioPorHora,
        capacidad: formData.capacidad,
        descripcion: formData.descripcion
      });
      
      // ✅ ACTUALIZADO: Usar método del servicio que usa el endpoint correcto PATCH /api/canchas/:id
      const updatedCancha = await canchaService.updateCancha(parseInt(courtId), updatePayload);
      
      console.log('✅ Cancha actualizada exitosamente:', updatedCancha);
      
      // Mostrar mensaje de éxito y redirigir
      alert('Cancha actualizada exitosamente. La lista se recargará.');
      
      // Redirigir con un parámetro para forzar recarga
      router.push('/admin/canchas?refresh=true');
      router.refresh(); // Forzar recarga de la página
    } catch (err: any) {
      console.error('❌ Error guardando cancha:', err);
      const errorMessage = err.message || 'Error al guardar los cambios';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    router.push('/admin/canchas');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <p>Cargando datos de la cancha...</p>
        </div>
      </div>
    );
  }

  if (error && !cancha) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="btn-secondary">
            Volver a Canchas
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
          <h1 className="admin-page-title">Editar Cancha</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="edit-cancha-form"
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
        <form id="edit-cancha-form" onSubmit={handleSave} className="edit-court-card">
          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="nombre" className="edit-form-label">
                  Nombre: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  placeholder="Mínimo 3 caracteres"
                  minLength={3}
                  required
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Campo obligatorio - Mínimo 3 caracteres
                </small>
              </div>
              
              <div className="edit-form-group">
                <label htmlFor="tipo" className="edit-form-label">
                  Tipo de Cancha: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="edit-form-select"
                  required
                >
                  <option value="futbol">Fútbol</option>
                  <option value="basquet">Básquetbol</option>
                  <option value="tenis">Tenis</option>
                  <option value="padel">Pádel</option>
                  <option value="volley">Voleibol</option>
                  <option value="futbol_sala">Fútbol Sala</option>
                </select>
              </div>

            </div>
          </div>

          {/* Configuración de Precios y Capacidad - NO DISPONIBLE */}
          <div className="edit-section" style={{ opacity: 0.6, position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              backgroundColor: '#fbbf24', 
              color: '#78350f', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ⚠️ No disponible en UPDATE
            </div>
            <h3 className="edit-section-title">Configuración de Precios y Capacidad</h3>
            <p style={{ fontSize: '0.875rem', color: '#f59e0b', marginBottom: '1rem', fontWeight: '600' }}>
              ⚠️ El endpoint de actualización solo permite modificar: nombre, tipo de deporte, cubierta y estado activo
            </p>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="precioPorHora" className="edit-form-label">
                  Precio por Hora (CLP): <span style={{ color: '#9ca3af' }}>(Solo lectura)</span>
                </label>
                <input
                  type="number"
                  id="precioPorHora"
                  name="precioPorHora"
                  value={cancha?.precioPorHora || 'No disponible'}
                  disabled={true}
                  className="edit-form-input"
                  style={{ cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Este campo solo se puede configurar al crear la cancha
                </small>
              </div>

              <div className="edit-form-group">
                <label htmlFor="capacidad" className="edit-form-label">
                  Capacidad de Jugadores: <span style={{ color: '#9ca3af' }}>(Solo lectura)</span>
                </label>
                <input
                  type="text"
                  id="capacidad"
                  name="capacidad"
                  value={cancha?.capacidad || 'No disponible'}
                  disabled={true}
                  className="edit-form-input"
                  style={{ cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Este campo solo se puede configurar al crear la cancha
                </small>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="edit-section">
            <h3 className="edit-section-title">Características</h3>
            <div className="edit-form-grid">
              {/* Cancha Techada/Cubierta como select */}
              <div className="edit-form-group">
                <label htmlFor="techada" className="edit-form-label">Cancha Techada/Cubierta:</label>
                <select
                  id="techada"
                  name="techada"
                  value={formData.techada ? 'si' : 'no'}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      techada: e.target.value === 'si' 
                    }));
                  }}
                  className="edit-form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="no">🌤️ No (al aire libre)</option>
                  <option value="si">🏠 Sí (techada/cubierta)</option>
                </select>
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Indica si la cancha tiene techo o está cubierta
                </small>
              </div>

              {/* Estado de la cancha como select */}
              <div className="edit-form-group">
                <label htmlFor="activa" className="edit-form-label">Estado:</label>
                <select
                  id="activa"
                  name="activa"
                  value={formData.activa ? 'disponible' : 'inactiva'}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      activa: e.target.value === 'disponible' 
                    }));
                  }}
                  className="edit-form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="disponible">🟢 Disponible (activa)</option>
                  <option value="inactiva">🔴 Inactiva (no visible)</option>
                </select>
                <small style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Solo canchas disponibles aparecerán en búsquedas públicas
                </small>
              </div>
            </div>
          </div>

          {/* Descripción - NO DISPONIBLE */}
          <div className="edit-section" style={{ opacity: 0.6, position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              backgroundColor: '#fbbf24', 
              color: '#78350f', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ⚠️ No disponible actualmente
            </div>
            <h3 className="edit-section-title">Descripción</h3>
            <p style={{ fontSize: '0.875rem', color: '#f59e0b', marginBottom: '0.5rem', fontWeight: '600' }}>
              ⚠️ Esta funcionalidad estará disponible cuando el backend implemente el campo de descripciones
            </p>
            <div className="edit-form-group">
              <label htmlFor="descripcion" className="edit-form-label">Descripción (Opcional):</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value="No disponible"
                disabled={true}
                rows={4}
                className="edit-form-input"
                placeholder="⚠️ El backend aún no soporta este campo. Próximamente disponible."
                style={{ minHeight: '100px', resize: 'vertical', cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
              />
              <small style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>
                ⚠️ Campo no disponible - El endpoint actual no acepta descripciones
              </small>
            </div>
          </div>

          {/* Información del Sistema */}
          {cancha && (
            <div className="edit-section">
              <h3 className="edit-section-title">Información del Sistema</h3>
              <div className="edit-form-grid">
                <div className="edit-info-item">
                  <span className="edit-info-label">ID:</span>
                  <span className="edit-info-value">{cancha.id}</span>
                </div>
                {cancha.fechaCreacion && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Creado:</span>
                    <span className="edit-info-value">
                      {new Date(cancha.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {cancha.fechaActualizacion && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Última actualización:</span>
                    <span className="edit-info-value">
                      {new Date(cancha.fechaActualizacion).toLocaleDateString()}
                    </span>
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