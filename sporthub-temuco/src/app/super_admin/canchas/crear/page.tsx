'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { complejosService } from '@/services/complejosService';

// Tipos de cancha disponibles (exactamente como los espera el backend)
const TIPOS_CANCHA = [
  { value: 'futbol', label: 'Fútbol' },
  { value: 'basquet', label: 'Básquet' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'padel', label: 'Pádel' },
  { value: 'volley', label: 'Vóleibol' }
];

interface Complejo {
  id_complejo: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
  activo: boolean;
}

export default function CrearCanchaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComplejos, setIsLoadingComplejos] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complejos, setComplejos] = useState<Complejo[]>([]);
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
    id_deporte: 0,
    imagenUrl: ''
  });

  // Cargar complejos disponibles al montar el componente
  useEffect(() => {
    const cargarComplejos = async () => {
      try {
        setIsLoadingComplejos(true);
        console.log('🔍 Cargando complejos disponibles...');
        const data = await complejosService.getComplejos();
        console.log('✅ Complejos cargados:', data);
        
        // Adaptar estructura según respuesta del backend
        let complejosArray: Complejo[] = [];
        if (Array.isArray(data)) {
          complejosArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          complejosArray = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          complejosArray = data.items;
        }
        
        setComplejos(complejosArray.filter(c => c.activo));
        
        // Si hay complejos, establecer el primero por defecto
        if (complejosArray.length > 0) {
          setFormData(prev => ({
            ...prev,
            id_complejo: complejosArray[0].id_complejo
          }));
        }
      } catch (err: any) {
        console.error('❌ Error al cargar complejos:', err);
        setError('Error al cargar los complejos. Recarga la página.');
      } finally {
        setIsLoadingComplejos(false);
      }
    };

    cargarComplejos();
  }, []);

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
          imagenUrl: reader.result as string // Por ahora guardamos base64, idealmente subiríamos a un servidor
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

      if (formData.id_complejo === 0) {
        throw new Error('Debe seleccionar un complejo deportivo');
      }

      // Crear la cancha usando el servicio
      const nuevaCancha = await canchaService.createCancha({
        nombre: formData.nombre.trim(),
        tipo: formData.tipo as any,
        techada: formData.techada,
        establecimientoId: Number(formData.id_complejo), // Asegurar que sea número
        precioPorHora: formData.precioPorHora,
        capacidad: formData.capacidad,
        descripcion: formData.descripcion.trim() || undefined,
        imagenUrl: formData.imagenUrl || undefined
      });

      console.log('✅ Cancha creada exitosamente:', nuevaCancha);
      
      setSuccess('Cancha creada exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/super_admin/canchas');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error al crear cancha:', err);
      
      // Mostrar información detallada del error
      let errorMessage = err.message || 'Error al crear la cancha. Por favor, intenta nuevamente.';
      
      // Si el error contiene información sobre el tipo de deporte
      if (errorMessage.includes('deporte') || errorMessage.includes('tipo')) {
        errorMessage += `\n\nTipo seleccionado: ${formData.tipo}\nTipos válidos: futbol, basquet, tenis, padel, volley`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/super_admin/canchas');
  };

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
          <h1 className="admin-page-title">Crear Nueva Cancha</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="create-cancha-form"
            className="btn-guardar" 
            disabled={isLoading || isLoadingComplejos}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {isLoading ? 'Creando...' : 'Crear Cancha'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="success-container">
          <p><strong>Éxito:</strong> {success}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="create-cancha-form" onSubmit={handleSubmit} className="edit-court-card">
          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="nombre" className="edit-form-label">Nombre: *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="Ej: Cancha Central de Fútbol"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="tipo" className="edit-form-label">Tipo de Deporte: *</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="edit-form-select"
                  required
                  disabled={isLoading}
                >
                  {TIPOS_CANCHA.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-form-group">
                <label htmlFor="id_complejo" className="edit-form-label">Complejo Deportivo: *</label>
                <select
                  id="id_complejo"
                  name="id_complejo"
                  value={formData.id_complejo}
                  onChange={handleChange}
                  className="edit-form-select"
                  required
                  disabled={isLoading || isLoadingComplejos}
                >
                  <option value={0} disabled>
                    {isLoadingComplejos ? 'Cargando complejos...' : 'Seleccione un complejo'}
                  </option>
                  {complejos.map(complejo => (
                    <option key={complejo.id_complejo} value={complejo.id_complejo}>
                      {complejo.nombre} {complejo.comuna && `- ${complejo.comuna}`}
                    </option>
                  ))}
                </select>
                <small className="edit-form-help">
                  Selecciona el complejo deportivo donde se ubicará la cancha
                </small>
              </div>

              <div className="edit-form-group">
                <label className="edit-checkbox-label">
                  <input
                    type="checkbox"
                    name="techada"
                    checked={formData.techada}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="edit-checkbox-input"
                  />
                  <span>Cancha Techada</span>
                </label>
              </div>
            </div>
          </div>

          {/* Capacidad y Precios */}
          <div className="edit-section">
            <h3 className="edit-section-title">Capacidad y Precios</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="capacidad" className="edit-form-label">Capacidad de Jugadores: *</label>
                <input
                  type="number"
                  id="capacidad"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="Ej: 10"
                  required
                  min="1"
                  max="50"
                  disabled={isLoading}
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="precioPorHora" className="edit-form-label">Precio por Hora (CLP): *</label>
                <input
                  type="number"
                  id="precioPorHora"
                  name="precioPorHora"
                  value={formData.precioPorHora}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="Ej: 15000"
                  required
                  min="0"
                  step="1000"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="edit-section">
            <h3 className="edit-section-title">Descripción Adicional</h3>
            <div className="edit-form-group">
              <label htmlFor="descripcion" className="edit-form-label">Descripción (Opcional):</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="edit-form-textarea"
                placeholder="Describe las características de la cancha..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Imagen de la Cancha */}
          <div className="edit-section">
            <h3 className="edit-section-title">Imagen de la Cancha</h3>
            <div className="edit-form-group">
              <label htmlFor="imagen" className="edit-form-label">Foto de la Cancha (Opcional):</label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                accept="image/*"
                onChange={handleImageChange}
                className="edit-form-input"
                disabled={isLoading}
              />
              <small className="edit-form-help">
                Formatos aceptados: JPG, PNG, GIF (máx. 5MB)
              </small>
              
              {/* Preview de la imagen */}
              {imagenPreview && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={imagenPreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '300px', 
                      maxHeight: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagenPreview('');
                      setFormData(prev => ({ ...prev, imagenUrl: '' }));
                    }}
                    className="btn-volver"
                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}