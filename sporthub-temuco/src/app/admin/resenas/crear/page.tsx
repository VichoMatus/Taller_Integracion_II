'use client';

import React, { useState, useEffect } from 'react';
import { useAdminToast } from '@/components/admin/AdminToast';
import { useRouter } from 'next/navigation';
import { resenaService } from '@/services/resenaService';
import { complejosService } from '@/services/complejosService';
import { ResenaCreateRequest } from '@/types/resena';
import '../../dashboard.css';

export default function CreateResenaPage() {
  const router = useRouter();
  const { show } = useAdminToast();
  
  // Estados del componente
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoResena, setTipoResena] = useState<'complejo' | 'cancha'>('complejo');
  const [canchasDisponibles, setCanchasDisponibles] = useState<any[]>([]);
  const [resenaExistente, setResenaExistente] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id_complejo: 0, // Se cargará del admin actual
    id_cancha: undefined as number | undefined, // Opcional: ID de cancha específica
    calificacion: 5,
    comentario: ''
  });
  
  // Obtener el ID del complejo del admin actual
  useEffect(() => {
    const cargarCanchas = async () => {
      try {
      const userData = localStorage.getItem('userData');
    if (!userData) {
      show('error', 'No se pudo identificar el complejo. Por favor, inicia sesión nuevamente.');
      return;
    }
        
        const user = JSON.parse(userData);
        console.log('👤 Usuario logueado:', user);
        
        // Primero intentar buscar complejo_id en userData
        let complejoId = user.complejo_id || user.id_complejo || user.id_establecimiento;
        
        if (complejoId) {
          console.log('✅ Complejo ID encontrado en userData:', complejoId);
          setFormData(prev => ({ ...prev, id_complejo: complejoId }));
          return;
        }
        
        // Si no está, llamar a la API
        console.log('🔍 Consultando API para obtener complejo...');
        const userId = user.id_usuario || user.id;
        
        if (!userId) {
          setError('No se pudo identificar el usuario.');
          return;
        }
        
        const complejos = await complejosService.getComplejosByAdmin(userId);
        
        if (complejos && complejos.length > 0) {
          const primerComplejo = complejos[0];
          complejoId = primerComplejo.id_complejo || primerComplejo.id;
          
          console.log('✅ Complejo ID obtenido de la API:', complejoId);
          setFormData(prev => ({ ...prev, id_complejo: complejoId }));
          
          // Actualizar localStorage
          try {
            const updatedUser = { ...user, complejo_id: complejoId };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
          } catch (err) {
            console.warn('⚠️ No se pudo actualizar localStorage:', err);
          }

          // Cargar canchas del complejo para el selector
          try {
            const canchas = await complejosService.getCanchasDeComplejo(complejoId);
            setCanchasDisponibles(canchas || []);
          } catch (canchaErr) {
            console.warn('⚠️ No se pudieron cargar las canchas del complejo:', canchaErr);
          }
        } else {
          setError('No se encontró ningún complejo asociado a tu usuario. Contacta al administrador.');
          const userData = localStorage.getItem('userData');
          if (!userData) {
            setError('No se pudo identificar el complejo. Por favor, inicia sesión nuevamente.');
            return;
          }
        }
      } catch (err: any) {
        console.error('❌ Error cargando canchas del admin para reseñas:', err);
        setError('No se pudo cargar las canchas disponibles');
      }
    };

    cargarCanchas();
  }, [tipoResena, formData.id_complejo]);

  // Verificar si ya existe una reseña cuando se selecciona complejo o cancha
  useEffect(() => {
    const verificarResenaExistente = async () => {
      if (tipoResena === 'complejo' && formData.id_complejo > 0) {
        try {
          const resenas = await resenaService.listarResenas({ 
            id_complejo: formData.id_complejo 
          });
          const yaExiste = resenas && resenas.length > 0;
          setResenaExistente(yaExiste);
          
          if (yaExiste) {
            setError(`⚠️ Ya tienes una reseña para este complejo. Solo puedes crear una reseña por complejo.`);
          } else {
            setError(null);
          }
        } catch (err) {
          console.warn('No se pudo verificar reseñas existentes:', err);
        }
      } else if (tipoResena === 'cancha' && formData.id_cancha && formData.id_cancha > 0) {
        try {
          const resenas = await resenaService.listarResenas({ 
            id_cancha: formData.id_cancha 
          });
          const yaExiste = resenas && resenas.length > 0;
          setResenaExistente(yaExiste);
          
          if (yaExiste) {
            setError(`⚠️ Ya tienes una reseña para esta cancha. Solo puedes crear una reseña por cancha.`);
          } else {
            setError(null);
          }
        } catch (err) {
          console.warn('No se pudo verificar reseñas existentes:', err);
        }
      } else {
        setResenaExistente(false);
        setError(null);
      }
    };
    
    verificarResenaExistente();
  }, [tipoResena, formData.id_complejo, formData.id_cancha]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacion' || name === 'id_complejo' || name === 'id_cancha'
        ? value ? parseInt(value) : undefined
        : value
    }));
  };

  // Función para obtener el emoji de calificación
  const getCalificacionEmoji = (calificacion: number) => {
    const emojis = ['😡', '😞', '😐', '😊', '🤩'];
    return emojis[calificacion - 1] || '❓';
  };

  // Validar formulario
  const isFormValid = () => {
    // No permitir enviar si ya existe una reseña
    if (resenaExistente) {
      return false;
    }
    
    // Si es reseña de cancha, debe tener id_cancha seleccionado
    if (tipoResena === 'cancha' && (!formData.id_cancha || formData.id_cancha === 0)) {
      return false;
    }
    
    // Si es reseña de complejo, debe tener id_complejo
    if (tipoResena === 'complejo' && (!formData.id_complejo || formData.id_complejo === 0)) {
      return false;
    }
    
    return formData.calificacion >= 1 && 
           formData.calificacion <= 5 && 
           formData.comentario && formData.comentario.trim().length >= 10; // Mínimo 10 caracteres
  };

  // Guardar nueva reseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      show('info', 'Por favor completa todos los campos obligatorios correctamente');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos según el tipo de reseña
      const payload: ResenaCreateRequest = {
        calificacion: formData.calificacion,
        comentario: formData.comentario
      };
      
      // IMPORTANTE: Solo enviar id_complejo O id_cancha, nunca ambos
      if (tipoResena === 'cancha') {
        payload.id_cancha = formData.id_cancha;
        console.log('📝 Creando reseña de CANCHA:', payload);
      } else {
        payload.id_complejo = formData.id_complejo;
        console.log('📝 Creando reseña de COMPLEJO:', payload);
      }
      
      console.log('📤 Enviando reseña:', payload);
      await resenaService.crearResena(payload);
      
      show('success', '✅ Reseña creada exitosamente');
      router.push('/admin/resenas');
    } catch (err: any) {
      console.error('❌ Error al crear reseña:', err);
      
      // Extraer mensaje del error de múltiples fuentes
      let errorMsg = 'Error al crear la reseña';
      
      if (err && typeof err === 'object') {
        // Intentar obtener el mensaje de diferentes lugares
        if (typeof err.message === 'string') {
          errorMsg = err.message;
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.response?.data) {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      // Convertir errorMsg a string si es un objeto
      if (typeof errorMsg !== 'string') {
        errorMsg = JSON.stringify(errorMsg);
      }
      
      setError(errorMsg);
      
      // Mostrar mensaje según el tipo de error
      if (errorMsg.includes('duplicate key') || errorMsg.includes('UniqueViolation')) {
        show('error', `❌ Ya existe una reseña tuya para este ${tipoResena === 'cancha' ? 'cancha' : 'complejo'}.\n\n⚠️ Solo puedes crear una reseña por cancha/complejo.`);
      } else if (errorMsg.includes('reserva') || errorMsg.includes('Debe tener una reserva')) {
        show('error', `❌ ${errorMsg}\n\n⚠️ Como administrador, solo puedes crear reseñas si tienes una reserva confirmada del complejo o cancha.\nO solicita al super-admin que te dé permisos especiales.`);
      } else {
        show('error', `❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-layout">
      {/* Header */}
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <button onClick={() => router.push('/admin/resenas')} className="btn-volver">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Crear Nueva Reseña</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="create-resena-form"
            className="btn-guardar" 
            disabled={loading || !isFormValid()}
            title={resenaExistente ? 'Ya existe una reseña. No puedes crear otra.' : !isFormValid() ? 'Completa todos los campos requeridos' : ''}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {loading ? 'Creando...' : resenaExistente ? 'Ya existe una reseña' : 'Crear Reseña'}
          </button>
        </div>
      </div>

      {/* Mensaje de Advertencia/Error */}
      {error && (
        <div className={resenaExistente ? 'success-container' : 'error-container'}>
          <p>
            <strong>{resenaExistente ? '⚠️ Advertencia:' : 'Error:'}</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
          </p>
          {resenaExistente && (
            <button
              type="button"
              onClick={() => router.push('/admin/resenas')}
              className="btn-primary"
              style={{ marginTop: '0.75rem' }}
            >
              Ver mis reseñas existentes
            </button>
          )}
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="create-resena-form" onSubmit={handleSubmit} className="edit-court-card">
          {/* Tipo de Reseña */}
          <div className="edit-section">
            <h2 className="edit-section-title">Tipo de Reseña</h2>
            
            <div className="edit-form-group">
              <label className="edit-form-label">¿Qué deseas reseñar? *</label>
              <div className="tipo-selector-container">
                <button
                  type="button"
                  onClick={() => {
                    setTipoResena('complejo');
                    setFormData(prev => ({ ...prev, id_cancha: undefined }));
                  }}
                  className={`tipo-selector-button ${tipoResena === 'complejo' ? 'active' : ''}`}
                >
                  <span className="tipo-selector-icon">📍</span>
                  <div className="tipo-selector-title">El Complejo</div>
                  <div className="tipo-selector-description">Reseña general del complejo</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTipoResena('cancha')}
                  className={`tipo-selector-button ${tipoResena === 'cancha' ? 'active' : ''}`}
                >
                  <span className="tipo-selector-icon">⚽</span>
                  <div className="tipo-selector-title">Una Cancha</div>
                  <div className="tipo-selector-description">Reseña de cancha específica</div>
                </button>
              </div>
            </div>
          </div>

          {/* Información básica */}
          <div className="edit-section">
            <h2 className="edit-section-title">Destino de la Reseña</h2>
            
            <div className="edit-form-grid">
              {tipoResena === 'complejo' ? (
                <div className="edit-form-group">
                  <label htmlFor="id_complejo" className="edit-form-label">
                    Tu Complejo Deportivo *
                  </label>
                  <input
                    type="text"
                    id="id_complejo"
                    value={formData.id_complejo > 0 ? `📍 Complejo #${formData.id_complejo}` : 'Cargando...'}
                    disabled
                    className="edit-form-input"
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small className="form-help">
                    Reseña general del complejo deportivo
                  </small>
                </div>
              ) : (
                <div className="edit-form-group">
                  <label htmlFor="id_cancha" className="edit-form-label">
                    Selecciona la Cancha *
                  </label>
                  <select
                    id="id_cancha"
                    name="id_cancha"
                    value={formData.id_cancha || ''}
                    onChange={handleInputChange}
                    className="edit-form-select"
                    required
                  >
                    <option value="">-- Selecciona una cancha --</option>
                    {canchasDisponibles.map((cancha) => (
                      <option key={cancha.id_cancha || cancha.id} value={cancha.id_cancha || cancha.id}>
                        ⚽ {cancha.nombre || `Cancha #${cancha.id_cancha || cancha.id}`}
                        {cancha.tipo && ` - ${cancha.tipo}`}
                      </option>
                    ))}
                  </select>
                  <small className="form-help">
                    {canchasDisponibles.length === 0 
                      ? 'Cargando canchas disponibles...' 
                      : `${canchasDisponibles.length} cancha(s) disponible(s)`}
                  </small>
                </div>
              )}
            </div>
            
            <div className={`info-banner ${tipoResena === 'complejo' ? 'info-blue' : 'info-green'}`} style={{ marginTop: '1rem' }}>
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <p className="info-text" style={{ margin: 0 }}>
                  <strong>Nota:</strong> {tipoResena === 'complejo' 
                    ? `Esta reseña será una valoración general del complejo #${formData.id_complejo}.`
                    : 'Esta reseña será una valoración específica de la cancha seleccionada.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Datos de la reseña */}
          <div className="edit-section">
            <h2 className="edit-section-title">Calificación y Opinión</h2>
            
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="calificacion" className="edit-form-label">
                  Calificación *
                  <span className="calificacion-preview" style={{ marginLeft: '0.5rem', fontSize: '1.2em' }}>
                    {getCalificacionEmoji(formData.calificacion)} ({formData.calificacion}/5)
                  </span>
                </label>
                <select
                  id="calificacion"
                  name="calificacion"
                  value={formData.calificacion}
                  onChange={handleInputChange}
                  required
                  className="edit-form-select"
                >
                  <option value={1}>😡 1 - Muy malo</option>
                  <option value={2}>😞 2 - Malo</option>
                  <option value={3}>😐 3 - Regular</option>
                  <option value={4}>😊 4 - Bueno</option>
                  <option value={5}>🤩 5 - Excelente</option>
                </select>
              </div>
            </div>
            
            <div className="edit-form-group">
              <label htmlFor="comentario" className="edit-form-label">
                Comentario *
                <span className="character-count" style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  {formData.comentario ? formData.comentario.length : 0}/2000 caracteres (mínimo 10)
                </span>
              </label>
              <textarea
                id="comentario"
                name="comentario"
                value={formData.comentario || ''}
                onChange={handleInputChange}
                placeholder="Escribe aquí tu opinión sobre el complejo o la cancha..."
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                className="edit-form-input"
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
              <small className="form-help">
                Describe tu experiencia con el complejo, las instalaciones, el estado de las canchas, la atención, etc.
                Mínimo 10 caracteres, máximo 2000.
              </small>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="edit-form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => router.push('/admin/resenas')}
              className="btn-volver"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="btn-guardar"
              title={resenaExistente ? 'Ya existe una reseña. No puedes crear otra.' : !isFormValid() ? 'Completa todos los campos requeridos' : ''}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : resenaExistente ? (
                '❌ Ya existe una reseña'
              ) : (
                'Crear Reseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}