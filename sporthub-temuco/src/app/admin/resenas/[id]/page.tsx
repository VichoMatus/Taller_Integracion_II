'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { resenaService } from '@/services/resenaService';
import { Resena, ResenaUpdateRequest } from '@/types/resena';
import '../../dashboard.css';

export default function EditResenaPage() {
  const params = useParams();
  const router = useRouter();
  const resenaId = params.id as string;
  
  // Estados del componente
  const [resena, setResena] = useState<Resena | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    calificacion: 5,
    comentario: ''
  });

  // Cargar datos de la reseña
  useEffect(() => {
    const loadResena = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await resenaService.obtenerResena(resenaId);
        setResena(data);
        setFormData({
          calificacion: data.calificacion,
          comentario: data.comentario || ''
        });
      } catch (err: any) {
        console.error('❌ Error al cargar reseña:', err);
        setError(err.message || 'Error al cargar la reseña');
        setResena(null);
      } finally {
        setLoading(false);
      }
    };

    loadResena();
  }, [resenaId]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacion' ? parseInt(value) : value
    }));
  };

  // Función para obtener el emoji de calificación
  const getCalificacionEmoji = (calificacion: number) => {
    const emojis = ['😡', '😞', '😐', '😊', '🤩'];
    return emojis[calificacion - 1] || '❓';
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.comentario.trim()) {
      alert('El comentario es obligatorio');
      return;
    }

    try {
      setSaving(true);
      await resenaService.actualizarResena(parseInt(resenaId), formData);
      alert('Reseña actualizada exitosamente');
      router.push('/admin/resenas');
    } catch (err: any) {
      console.warn('No se pudo actualizar (backend no disponible):', err);
      alert('No se puede actualizar en modo desarrollo (backend no disponible)');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <p>Cargando reseña...</p>
        </div>
      </div>
    );
  }

  if (!resena) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <p>Reseña no encontrada</p>
          <button 
            className="btn-volver"
            onClick={() => router.push('/admin/resenas')}
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Editar Reseña #{resena.id}</h1>
        
        <div className="admin-controls">
          <button 
            className="btn-volver"
            onClick={() => router.push('/admin/resenas')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la lista
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

      {/* Formulario */}
      <div className="admin-form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          {/* Información de la reseña */}
          <div className="form-section">
            <h3 className="form-section-title">Información de la Reseña</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>ID de Reseña</label>
                <input type="text" value={`#${resena.id}`} disabled className="form-input-disabled" />
              </div>
              
              <div className="form-group">
                <label>Usuario</label>
                <input type="text" value={`Usuario #${resena.usuarioId}`} disabled className="form-input-disabled" />
              </div>
              
              <div className="form-group">
                <label>Cancha / Complejo</label>
                <input 
                  type="text" 
                  value={resena.canchaId ? `Cancha #${resena.canchaId}` : 
                         resena.complejoId ? `Complejo #${resena.complejoId}` : 'N/A'} 
                  disabled 
                  className="form-input-disabled" 
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Creación</label>
                <input 
                  type="text" 
                  value={new Date(resena.fechaCreacion).toLocaleDateString('es-CL')} 
                  disabled 
                  className="form-input-disabled" 
                />
              </div>
            </div>
          </div>

          {/* Datos editables */}
          <div className="form-section">
            <h3 className="form-section-title">Datos de la Reseña</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="calificacion">
                  Calificación *
                  <span className="calificacion-preview">
                    {getCalificacionEmoji(formData.calificacion)} ({formData.calificacion}/5)
                  </span>
                </label>
                <select
                  id="calificacion"
                  name="calificacion"
                  value={formData.calificacion}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value={1}>😡 1 - Muy malo</option>
                  <option value={2}>😞 2 - Malo</option>
                  <option value={3}>😐 3 - Regular</option>
                  <option value={4}>😊 4 - Bueno</option>
                  <option value={5}>🤩 5 - Excelente</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comentario">
                Comentario *
                <span className="character-count">
                  {formData.comentario.length}/500 caracteres
                </span>
              </label>
              <textarea
                id="comentario"
                name="comentario"
                value={formData.comentario}
                onChange={handleInputChange}
                placeholder="Escribe aquí tu opinión sobre la cancha..."
                required
                maxLength={500}
                rows={4}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.push('/admin/resenas')}
              className="btn-cancelar"
              disabled={saving}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving || !formData.comentario.trim()}
              className="btn-guardar"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Actualizar Reseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}