'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { canchaService } from '@/services/canchaService';

// Tipos de cancha disponibles (exactamente como los espera el backend)
const TIPOS_CANCHA = [
  { value: 'futbol', label: 'Fútbol' },
  { value: 'basquet', label: 'Básquet' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'padel', label: 'Pádel' },
  { value: 'volley', label: 'Vóleibol' }
];

export default function EditarCanchaPage() {
  const router = useRouter();
  const params = useParams();
  const canchaId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagenPreview, setImagenPreview] = useState<string>('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    id_complejo: 0,
    precioPorHora: 0,
    capacidad: 10,
    descripcion: '',
    activa: true,
    imagenUrl: ''
  });

  // Cargar datos de la cancha
  useEffect(() => {
    const cargarCancha = async () => {
      try {
        setIsLoadingData(true);
        console.log('🔍 Cargando datos de la cancha ID:', canchaId);
        const cancha = await canchaService.getCanchaById(Number(canchaId));
        console.log('✅ Cancha cargada:', cancha);
        
        setFormData({
          nombre: cancha.nombre || '',
          tipo: cancha.tipo || 'futbol',
          techada: cancha.techada || false,
          id_complejo: cancha.establecimientoId || 0,
          precioPorHora: cancha.precioPorHora || 0,
          capacidad: cancha.capacidad || 10,
          descripcion: cancha.descripcion || '',
          activa: cancha.activa !== undefined ? cancha.activa : true,
          imagenUrl: cancha.imagenUrl || ''
        });
        
        if (cancha.imagenUrl) {
          setImagenPreview(cancha.imagenUrl);
        }
      } catch (err: any) {
        console.error('❌ Error al cargar cancha:', err);
        setError('Error al cargar los datos de la cancha. Por favor, intenta nuevamente.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (canchaId) {
      cargarCancha();
    }
  }, [canchaId]);



  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  // Manejar carga de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          imagenUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Enviando datos para actualizar cancha:', formData);
      
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

      // Actualizar la cancha usando el servicio
      const canchaActualizada = await canchaService.updateCancha(Number(canchaId), {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo as any,
        techada: formData.techada,
        precioPorHora: formData.precioPorHora,
        capacidad: formData.capacidad,
        descripcion: formData.descripcion.trim() || undefined,
        activa: formData.activa,
        imagenUrl: formData.imagenUrl || undefined
      });

      console.log('✅ Cancha actualizada exitosamente:', canchaActualizada);
      
      setSuccess('Cancha actualizada exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/super_admin/canchas');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error al actualizar cancha:', err);
      setError(err.message || 'Error al actualizar la cancha. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/super_admin/canchas');
  };

  if (isLoadingData) {
    return (
      <div className="admin-page-layout">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
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
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      {success && (
        <div className="success-container">
          <p><strong>Éxito:</strong> {success}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="edit-cancha-form" onSubmit={handleSubmit} className="edit-court-card">
          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            <div className="edit-form-grid">
              {/* Nombre de la Cancha */}
              <div className="edit-form-group">
                <label htmlFor="nombre" className="edit-form-label">
                  Nombre: *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="edit-form-input"
                  required
                  placeholder="Ej: Cancha Central"
                  disabled={isLoading}
                />
              </div>

              {/* Tipo de Cancha */}
              <div className="edit-form-group">
                <label htmlFor="tipo" className="edit-form-label">
                  Tipo de Deporte: *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="edit-form-select"
                  required
                  disabled={isLoading}
                >
                  {TIPOS_CANCHA.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Complejo Deportivo */}
              <div className="edit-form-group">
                <label htmlFor="id_complejo" className="edit-form-label">
                  Complejo:
                </label>
                <input
                  type="text"
                  id="id_complejo"
                  value={`Complejo ${formData.id_complejo}`}
                  className="edit-form-input"
                  disabled={true}
                  readOnly
                />
                <p className="edit-form-hint">
                  El complejo no puede ser modificado después de crear la cancha
                </p>
              </div>

              {/* Cancha Techada */}
              <div className="edit-form-group checkbox-group">
                <input
                  type="checkbox"
                  id="techada"
                  name="techada"
                  checked={formData.techada}
                  onChange={handleChange}
                  className="edit-form-checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="techada" className="edit-form-label-inline">
                  Cancha Techada
                </label>
              </div>
            </div>
          </div>

          {/* Detalles y Precios */}
          <div className="edit-section">
            <h3 className="edit-section-title">Detalles y Precios</h3>
            <div className="edit-form-grid">
              {/* Precio por Hora */}
              <div className="edit-form-group">
                <label htmlFor="precioPorHora" className="edit-form-label">
                  Precio por Hora ($):
                </label>
                <input
                  type="number"
                  id="precioPorHora"
                  name="precioPorHora"
                  value={formData.precioPorHora}
                  onChange={handleChange}
                  className="edit-form-input"
                  min="0"
                  step="100"
                  placeholder="15000"
                  disabled={isLoading}
                />
              </div>

              {/* Capacidad */}
              <div className="edit-form-group">
                <label htmlFor="capacidad" className="edit-form-label">
                  Capacidad (personas):
                </label>
                <input
                  type="number"
                  id="capacidad"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="edit-form-input"
                  min="1"
                  placeholder="10"
                  disabled={isLoading}
                />
              </div>

              {/* Estado Activa */}
              <div className="edit-form-group checkbox-group">
                <input
                  type="checkbox"
                  id="activa"
                  name="activa"
                  checked={formData.activa}
                  onChange={handleChange}
                  className="edit-form-checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="activa" className="edit-form-label-inline">
                  Cancha Activa
                </label>
              </div>
            </div>
          </div>

          {/* Imagen y Descripción */}
          <div className="edit-section">
            <h3 className="edit-section-title">Imagen y Descripción</h3>
            <div className="edit-form-grid-full">
              {/* Imagen de la Cancha */}
              <div className="edit-form-group-full">
                <label htmlFor="imagen" className="edit-form-label">
                  Imagen de la Cancha:
                </label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="edit-form-input"
                  disabled={isLoading}
                />
                <p className="edit-form-hint">
                  Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF
                </p>
                
                {/* Preview de la imagen */}
                {imagenPreview && (
                  <div className="image-preview-container">
                    <p className="image-preview-label">Vista previa:</p>
                    <div className="image-preview-wrapper">
                      <img 
                        src={imagenPreview} 
                        alt="Preview" 
                        className="image-preview"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagenPreview('');
                          setFormData(prev => ({ ...prev, imagenUrl: '' }));
                        }}
                        className="image-delete-btn"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="edit-form-group-full">
                <label htmlFor="descripcion" className="edit-form-label">
                  Descripción:
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="edit-form-textarea"
                  rows={4}
                  placeholder="Descripción adicional de la cancha (opcional)"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
