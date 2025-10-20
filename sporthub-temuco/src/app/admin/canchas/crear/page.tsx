'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { complejosService } from '@/services/complejosService';
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

interface Complejo {
  id: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
}

export default function NuevaCanchaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComplejos, setIsLoadingComplejos] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    establecimientoId: 0,
    precioPorHora: 0,
    capacidad: 10,
    descripcion: ''
  });

  // Cargar complejos del administrador al montar el componente
  useEffect(() => {
    loadUserComplejos();
  }, []);

  const loadUserComplejos = async () => {
    try {
      setIsLoadingComplejos(true);
      
      // Obtener datos del usuario desde localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        setError('No se encontró información del usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      const userData = JSON.parse(userDataString);
      const adminId = userData.id_usuario || userData.id;
      
      if (!adminId) {
        setError('No se pudo obtener el ID del usuario.');
        return;
      }

      setUserId(adminId);
      console.log('👤 [CrearCancha] Cargando complejos del admin ID:', adminId);

      // Cargar complejos del administrador
      const complejosData = await complejosService.getComplejosByAdmin(adminId);
      
      console.log('📋 [CrearCancha] Complejos cargados:', complejosData);
      
      // Adaptar formato si es necesario
      let complejosArray = [];
      if (Array.isArray(complejosData)) {
        complejosArray = complejosData;
      } else if (complejosData?.items) {
        complejosArray = complejosData.items;
      } else if (complejosData?.data) {
        complejosArray = Array.isArray(complejosData.data) ? complejosData.data : complejosData.data.items || [];
      }

      // Mapear a formato esperado
      const complejosFormateados = complejosArray.map((c: any) => ({
        id: c.id || c.id_complejo,
        nombre: c.nombre,
        direccion: c.direccion,
        comuna: c.comuna
      }));

      setComplejos(complejosFormateados);

      // Si solo hay un complejo, seleccionarlo automáticamente
      if (complejosFormateados.length === 1) {
        setFormData(prev => ({
          ...prev,
          establecimientoId: complejosFormateados[0].id
        }));
        console.log('✅ [CrearCancha] Auto-seleccionado complejo único:', complejosFormateados[0].nombre);
      } 
      // No mostrar error si no hay complejos, permitir ingreso manual de ID

    } catch (err: any) {
      console.error('❌ [CrearCancha] Error cargando complejos:', err);
      console.warn('⚠️ [CrearCancha] Endpoint no disponible. Permitiendo ingreso manual de ID.');
      // No mostrar error visual, solo permitir ingreso manual
      setComplejos([]); // Array vacío activará el input manual
    } finally {
      setIsLoadingComplejos(false);
    }
  };

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

      if (!formData.establecimientoId || formData.establecimientoId === 0 || formData.establecimientoId < 1) {
        throw new Error('Debes seleccionar un complejo deportivo o ingresar un ID válido');
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
        router.push('/admin/canchas');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error al crear cancha:', err);
      setError(err.message || 'Error al crear la cancha. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/canchas');
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
            disabled={isLoading}
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
                <label htmlFor="tipo" className="edit-form-label">Tipo de Cancha: *</label>
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
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-form-group">
                <label htmlFor="establecimientoId" className="edit-form-label">Complejo Deportivo: *</label>
                {isLoadingComplejos ? (
                  <div className="edit-form-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Cargando complejos...</span>
                  </div>
                ) : complejos.length === 0 ? (
                  <div>
                    <input
                      type="number"
                      id="establecimientoId"
                      name="establecimientoId"
                      value={formData.establecimientoId || ''}
                      onChange={handleChange}
                      className="edit-form-input"
                      min="1"
                      placeholder="Ingresa el ID del complejo"
                      required
                      disabled={isLoading}
                    />
                    <small style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                      ⚠️ Modo temporal: Ingresa manualmente el ID del complejo (esperando endpoint de la API)
                    </small>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <select
                          id="establecimientoId"
                          name="establecimientoId"
                          value={formData.establecimientoId}
                          onChange={handleChange}
                          className="edit-form-select"
                          required
                          disabled={isLoading || complejos.length === 0}
                        >
                          <option value={0} disabled>Selecciona un complejo</option>
                          {complejos.map(complejo => (
                            <option key={complejo.id} value={complejo.id}>
                              {complejo.nombre} {complejo.comuna ? `- ${complejo.comuna}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: '120px' }}>
                        <input
                          type="number"
                          name="establecimientoId"
                          value={formData.establecimientoId || ''}
                          onChange={handleChange}
                          className="edit-form-input"
                          min="1"
                          placeholder="ID"
                          title="ID del complejo"
                          disabled={isLoading}
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                    <small style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>
                      Solo se muestran tus complejos asociados (o ingresa ID manualmente)
                    </small>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Configuración de Precios y Capacidad */}
          <div className="edit-section">
            <h3 className="edit-section-title">Configuración de Precios y Capacidad</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="precioPorHora" className="edit-form-label">Precio por Hora (CLP): *</label>
                <input
                  type="number"
                  id="precioPorHora"
                  name="precioPorHora"
                  value={formData.precioPorHora}
                  onChange={handleChange}
                  className="edit-form-input"
                  min="0"
                  step="1000"
                  placeholder="Ej: 15000"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="capacidad" className="edit-form-label">Capacidad de Jugadores: *</label>
                <input
                  type="number"
                  id="capacidad"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="edit-form-input"
                  min="1"
                  max="50"
                  placeholder="Ej: 10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="edit-section">
            <h3 className="edit-section-title">Características</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">
                  <input
                    type="checkbox"
                    name="techada"
                    checked={formData.techada}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Cancha techada/cubierta
                </label>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="edit-section">
            <h3 className="edit-section-title">Descripción</h3>
            <div className="edit-form-group">
              <label htmlFor="descripcion" className="edit-form-label">Descripción (Opcional):</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
                className="edit-form-input"
                placeholder="Describe las características de la cancha..."
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}