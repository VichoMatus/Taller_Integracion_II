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
  id: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
}

export default function CrearCanchaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComplejos, setIsLoadingComplejos] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [imagenPreview, setImagenPreview] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [canchaCreada, setCanchaCreada] = useState<any>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    id_complejo: '' as any, // Iniciar como string vacío, se convertirá a número al seleccionar
    precioPorHora: 0,
    capacidad: 10,
    descripcion: '',
    imagenUrl: '',
    iluminacion: false,
    largo: 0,
    ancho: 0
  });

  // Cargar complejos disponibles al montar el componente
  useEffect(() => {
    const cargarComplejos = async () => {
      try {
        setIsLoadingComplejos(true);
        console.log('🔍 [SuperAdmin] Cargando complejos disponibles...');
        const data = await complejosService.getComplejos();
        console.log('✅ [SuperAdmin] Complejos cargados (raw):', data);
        console.log('📊 [SuperAdmin] Tipo de data:', typeof data, 'Es array?:', Array.isArray(data));
        
        // Adaptar estructura según respuesta del backend
        let complejosArray: any[] = [];
        if (Array.isArray(data)) {
          complejosArray = data;
          console.log('📋 [SuperAdmin] Usando array directo');
        } else if (data.data && Array.isArray(data.data)) {
          complejosArray = data.data;
          console.log('📋 [SuperAdmin] Extrayendo de .data');
        } else if (data.items && Array.isArray(data.items)) {
          complejosArray = data.items;
          console.log('📋 [SuperAdmin] Extrayendo de .items');
        }
        
        console.log('📋 [SuperAdmin] Complejos array length:', complejosArray.length);
        if (complejosArray.length > 0) {
          console.log('📋 [SuperAdmin] Primer complejo (raw):', complejosArray[0]);
        }
        
        // Mapear a formato esperado con id normalizado
        const complejosFormateados = complejosArray
          .filter((c: any) => {
            const esValido = c && c.activo !== false && (c.id || c.id_complejo);
            if (!esValido) console.log('⚠️ [SuperAdmin] Complejo filtrado:', c);
            return esValido;
          })
          .map((c: any) => {
            const complejo = {
              id: c.id || c.id_complejo || 0,
              nombre: c.nombre || 'Sin nombre',
              direccion: c.direccion || '',
              comuna: c.comuna || ''
            };
            console.log('✅ [SuperAdmin] Complejo mapeado:', complejo);
            return complejo;
          });
        
        console.log('📋 [SuperAdmin] Total complejos formateados:', complejosFormateados.length);
        setComplejos(complejosFormateados);
        
        // Si hay complejos, establecer el primero por defecto
        if (complejosFormateados.length > 0 && complejosFormateados[0].id > 0) {
          const primerComplejo = complejosFormateados[0];
          console.log('🎯 [SuperAdmin] Estableciendo complejo por defecto:', primerComplejo);
          setFormData(prev => ({
            ...prev,
            id_complejo: primerComplejo.id
          }));
          console.log('✅ [SuperAdmin] FormData actualizado con id_complejo:', primerComplejo.id);
        } else {
          console.warn('⚠️ [SuperAdmin] No hay complejos disponibles para seleccionar');
        }
      } catch (err: any) {
        console.error('❌ [SuperAdmin] Error al cargar complejos:', err);
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
    
    // Lista de campos que deben ser números
    const camposNumericos = ['id_complejo', 'precioPorHora', 'capacidad', 'largo', 'ancho'];
    
    let valorProcesado: any = value;
    
    if (type === 'checkbox') {
      valorProcesado = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' || camposNumericos.includes(name)) {
      // Convertir a número solo si el valor no está vacío
      const numValue = value === '' ? 0 : Number(value);
      valorProcesado = isNaN(numValue) ? 0 : numValue;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorProcesado
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

      if (!formData.id_complejo || formData.id_complejo === 0 || formData.id_complejo === '') {
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
        imagenUrl: formData.imagenUrl || undefined,
        iluminacion: formData.iluminacion,
        largo: formData.largo > 0 ? formData.largo : undefined,
        ancho: formData.ancho > 0 ? formData.ancho : undefined
      });

      console.log('✅ Cancha creada exitosamente:', nuevaCancha);
      
      // Mostrar modal de éxito
      setCanchaCreada(nuevaCancha);
      setShowSuccessModal(true);
      
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
                  <option value="" disabled>
                    {isLoadingComplejos ? 'Cargando complejos...' : 'Seleccione un complejo'}
                  </option>
                  {complejos.map((complejo, index) => (
                    <option key={`complejo-${complejo.id}-${index}`} value={complejo.id}>
                      {complejo.nombre} {complejo.comuna && `- ${complejo.comuna}`} (ID: {complejo.id})
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

              <div className="edit-form-group">
                <label className="edit-checkbox-label">
                  <input
                    type="checkbox"
                    name="iluminacion"
                    checked={formData.iluminacion}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="edit-checkbox-input"
                  />
                  <span>Tiene Iluminación</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dimensiones */}
          <div className="edit-section">
            <h3 className="edit-section-title">Dimensiones de la Cancha</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="largo" className="edit-form-label">Largo (metros):</label>
                <input
                  type="number"
                  id="largo"
                  name="largo"
                  value={formData.largo || ''}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="Ej: 40"
                  min="0"
                  step="0.5"
                  disabled={isLoading}
                />
                <small className="edit-form-help">Largo de la cancha en metros (opcional)</small>
              </div>

              <div className="edit-form-group">
                <label htmlFor="ancho" className="edit-form-label">Ancho (metros):</label>
                <input
                  type="number"
                  id="ancho"
                  name="ancho"
                  value={formData.ancho || ''}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="Ej: 20"
                  min="0"
                  step="0.5"
                  disabled={isLoading}
                />
                <small className="edit-form-help">Ancho de la cancha en metros (opcional)</small>
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
              <label className="edit-form-label">Foto de la Cancha (Opcional):</label>
              
              {!imagenPreview ? (
                <div>
                  <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="imagen" 
                    className="btn-guardar"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Seleccionar Imagen
                  </label>
                  <small className="edit-form-help" style={{ display: 'block', marginTop: '0.5rem' }}>
                    Formatos aceptados: JPG, PNG, GIF (máx. 5MB)
                  </small>
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '3px solid #10b981'
                  }}>
                    <img 
                      src={imagenPreview} 
                      alt="Vista previa de la cancha" 
                      style={{ 
                        maxWidth: '400px', 
                        maxHeight: '300px', 
                        objectFit: 'cover',
                        display: 'block'
                      }} 
                    />
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="file"
                      id="imagen-change"
                      name="imagen"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="imagen-change" 
                      className="btn-volver"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Cambiar imagen
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenPreview('');
                        setFormData(prev => ({ ...prev, imagenUrl: '' }));
                        const input = document.getElementById('imagen') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="btn-volver"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        backgroundColor: '#ef4444',
                        borderColor: '#ef4444'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && canchaCreada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#d1fae5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                ¡Cancha Creada Exitosamente!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                La cancha <strong>{canchaCreada.nombre}</strong> ha sido creada correctamente.
              </p>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'left',
                marginTop: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  <strong>Tipo:</strong> {canchaCreada.tipo?.charAt(0).toUpperCase() + canchaCreada.tipo?.slice(1) || 'N/A'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  <strong>Complejo:</strong> {complejos.find(c => c.id === formData.id_complejo)?.nombre || 'N/A'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                  <strong>Estado:</strong> <span style={{ color: '#10b981' }}>● Activa</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
              Redirigiendo al panel de canchas...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}