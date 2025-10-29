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

  // Estados del formulario - SOLO campos que acepta FastAPI UPDATE
  const [formData, setFormData] = useState<UpdateCanchaInput>({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    activa: true
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
      
      // Llenar el formulario con los datos existentes - SOLO campos editables
      setFormData({
        nombre: data.nombre,
        tipo: data.tipo,
        techada: data.techada,
        activa: data.activa
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

  // Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('💾 Guardando cambios de cancha:', formData);
      await canchaService.updateCancha(parseInt(courtId), formData);
      console.log('✅ Cancha actualizada exitosamente');
      
      // Mostrar mensaje de éxito y redirigir
      alert('Cancha actualizada exitosamente. La lista se recargará.');
      
      // Redirigir con un parámetro para forzar recarga
      router.push('/admin/canchas?refresh=true');
      router.refresh(); // Forzar recarga de la página
    } catch (err: any) {
      console.error('❌ Error guardando cancha:', err);
      setError(err.message || 'Error al guardar los cambios');
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
                <label htmlFor="nombre" className="edit-form-label">Nombre:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  required
                />
              </div>
              
              <div className="edit-form-group">
                <label htmlFor="tipo" className="edit-form-label">Tipo de Cancha:</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="edit-form-select"
                  required
                >
                  <option value="futbol">Fútbol</option>
                  <option value="basquet">Básquet</option>
                  <option value="tenis">Tenis</option>
                  <option value="padel">Padel</option>
                  <option value="volley">Volley</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">
                  <input
                    type="checkbox"
                    name="techada"
                    checked={formData.techada}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Cancha techada/cubierta
                </label>
              </div>
            </div>
          </div>

          {/* Estado Activo/Inactivo */}
          <div className="edit-section">
            <h3 className="edit-section-title">Estado</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={formData.activa}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Cancha activa (disponible para reservas)
                </label>
                <small style={{ color: 'var(--text-gray)', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                  Si está desactivada, no aparecerá disponible para nuevas reservas
                </small>
              </div>
            </div>
          </div>

          {/* Información de solo lectura */}
          {cancha && (
            <div className="edit-section">
              <h3 className="edit-section-title">Información de Solo Lectura</h3>
              <div className="edit-form-grid">
                {cancha.precioPorHora && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Precio por hora:</span>
                    <span className="edit-info-value">
                      {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cancha.precioPorHora)}
                    </span>
                  </div>
                )}
                {cancha.capacidad && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Capacidad:</span>
                    <span className="edit-info-value">{cancha.capacidad} personas</span>
                  </div>
                )}
                {cancha.descripcion && (
                  <div className="edit-info-item">
                    <span className="edit-info-label">Descripción:</span>
                    <span className="edit-info-value">{cancha.descripcion}</span>
                  </div>
                )}
                <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Estos campos son de solo lectura y se configuran desde otros módulos del sistema.
                </p>
              </div>
            </div>
          )}

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