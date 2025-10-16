'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resenaService } from '@/services/resenaService';
import { ResenaCreateRequest } from '@/types/resena';
import '../../dashboard.css';

export default function CreateResenaPage() {
  const router = useRouter();
  
  // Estados del componente
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    id_usuario: 1, // En producción se obtendrá del usuario autenticado
    id_cancha: 1,
    id_reserva: undefined as number | undefined,
    calificacion: 5,
    comentario: ''
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacion' || name === 'id_usuario' || name === 'id_cancha' || name === 'id_reserva'
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
    return formData.id_usuario > 0 && 
           formData.id_cancha > 0 && 
           formData.calificacion >= 1 && 
           formData.calificacion <= 5 && 
           formData.comentario && formData.comentario.trim().length > 0;
  };

  // Guardar nueva reseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await resenaService.crearResena(formData as ResenaCreateRequest);
      alert('Reseña creada exitosamente');
      router.push('/admin/resenas');
    } catch (err: any) {
      console.warn('No se pudo crear (backend no disponible):', err);
      setError('No se puede crear en modo desarrollo (backend no disponible)');
      alert('No se puede crear en modo desarrollo (backend no disponible)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Reseña</h1>
        
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
          {/* Información básica */}
          <div className="form-section">
            <h3 className="form-section-title">Información Básica</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="id_usuario">ID de Usuario *</label>
                <input
                  type="number"
                  id="id_usuario"
                  name="id_usuario"
                  value={formData.id_usuario}
                  onChange={handleInputChange}
                  min={1}
                  required
                  className="form-input"
                  placeholder="Ingresa el ID del usuario"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="id_cancha">ID de Cancha *</label>
                <input
                  type="number"
                  id="id_cancha"
                  name="id_cancha"
                  value={formData.id_cancha}
                  onChange={handleInputChange}
                  min={1}
                  required
                  className="form-input"
                  placeholder="Ingresa el ID de la cancha"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="id_reserva">ID de Reserva (Opcional)</label>
                <input
                  type="number"
                  id="id_reserva"
                  name="id_reserva"
                  value={formData.id_reserva || ''}
                  onChange={handleInputChange}
                  min={1}
                  className="form-input"
                  placeholder="Ingresa el ID de la reserva (opcional)"
                />
                <small className="form-help">
                  Si está asociada a una reserva específica
                </small>
              </div>
            </div>
          </div>

          {/* Datos de la reseña */}
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
                  {formData.comentario ? formData.comentario.length : 0}/500 caracteres
                </span>
              </label>
              <textarea
                id="comentario"
                name="comentario"
                value={formData.comentario || ''}
                onChange={handleInputChange}
                placeholder="Escribe aquí la opinión sobre la cancha..."
                required
                maxLength={500}
                rows={4}
                className="form-textarea"
              />
              <small className="form-help">
                Describe la experiencia con la cancha, instalaciones, estado del césped, etc.
              </small>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.push('/admin/resenas')}
              className="btn-cancelar"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="btn-guardar"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
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