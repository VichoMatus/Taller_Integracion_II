'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import '@/app/admin/dashboard.css';

// Tipos de cancha disponibles (mantenemos en minúscula como el backend)
const TIPOS_CANCHA = [
  'futbol',
  'basquet', 
  'tenis',
  'padel',
  'volley',
  'futbol_sala'
];

export default function NuevaCanchaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    establecimientoId: 1,
    precioPorHora: 0,
    capacidad: 10,
    descripcion: ''
  });

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Enviando datos para crear cancha:', formData);
      
      // Validaciones básicas
      if (!formData.nombre.trim()) {
        throw new Error('El nombre de la cancha es requerido');
      }

      if (formData.precioPorHora < 0) {
        throw new Error('El precio por hora no puede ser negativo');
      }

      if (formData.capacidad < 1) {
        throw new Error('La capacidad debe ser al menos 1');
      }

      // Crear la cancha usando el servicio
      const nuevaCancha = await canchaService.createCancha({
        nombre: formData.nombre.trim(),
        tipo: formData.tipo as any,
        techada: formData.techada,
        establecimientoId: formData.establecimientoId,
        precioPorHora: formData.precioPorHora,
        capacidad: formData.capacidad,
        descripcion: formData.descripcion.trim() || undefined
      });

      console.log('✅ Cancha creada exitosamente:', nuevaCancha);
      
      setSuccess('Cancha creada exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/superadmin/canchas');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error al crear cancha:', err);
      setError(err.message || 'Error al crear la cancha. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/superadmin/canchas');
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Cancha</h1>
        
        <div className="admin-controls">
          <button 
            type="button"
            onClick={handleCancel}
            className="export-button"
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
        </div>
      </div>

      {/* Contenedor del Formulario */}
      <div className="admin-table-container">
        {/* Mensajes de estado */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <strong>Éxito:</strong> {success}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="cancha-form">
          <div className="form-grid">
            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre de la Cancha *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="form-input"
                placeholder="Ej: Cancha Central de Fútbol"
              />
            </div>

            {/* Tipo */}
            <div className="form-group">
              <label htmlFor="tipo" className="form-label">
                Tipo de Deporte *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="form-select"
              >
                {TIPOS_CANCHA.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio por Hora */}
            <div className="form-group">
              <label htmlFor="precioPorHora" className="form-label">
                Precio por Hora (CLP) *
              </label>
              <input
                type="number"
                id="precioPorHora"
                name="precioPorHora"
                value={formData.precioPorHora}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                disabled={isLoading}
                className="form-input"
                placeholder="Ej: 15000"
              />
            </div>

            {/* Capacidad */}
            <div className="form-group">
              <label htmlFor="capacidad" className="form-label">
                Capacidad de Jugadores *
              </label>
              <input
                type="number"
                id="capacidad"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                required
                min="1"
                max="50"
                disabled={isLoading}
                className="form-input"
                placeholder="Ej: 10"
              />
            </div>

            {/* Establecimiento ID */}
            <div className="form-group">
              <label htmlFor="establecimientoId" className="form-label">
                ID del Establecimiento *
              </label>
              <input
                type="number"
                id="establecimientoId"
                name="establecimientoId"
                value={formData.establecimientoId}
                onChange={handleChange}
                required
                min="1"
                disabled={isLoading}
                className="form-input"
                placeholder="Ej: 1"
              />
              <small className="form-help">
                ID numérico del establecimiento donde se ubicará la cancha
              </small>
            </div>

            {/* Techada */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="techada"
                  checked={formData.techada}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Cancha Techada</span>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group full-width">
            <label htmlFor="descripcion" className="form-label">
              Descripción (Opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={isLoading}
              rows={4}
              className="form-textarea"
              placeholder="Describe las características de la cancha..."
            />
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="btn-cancel"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-submit"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                'Crear Cancha'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}