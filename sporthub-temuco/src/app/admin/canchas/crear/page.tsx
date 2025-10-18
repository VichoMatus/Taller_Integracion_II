'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import { CreateCanchaInput } from '@/types/cancha';
import '../../dashboard.css';

export default function CreateCanchaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario - SOLO campos que acepta FastAPI CREATE
  const [formData, setFormData] = useState<CreateCanchaInput>({
    nombre: '',
    tipo: 'futbol',
    techada: false,
    establecimientoId: 1, // Por ahora hardcodeado, después se puede obtener del usuario logueado
    // Campos UI internos (no se envían al backend):
    precioPorHora: 0,
    descripcion: '',
    capacidad: 1,
    imagenUrl: ''
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? checked : 
               value
    }));
  };

  // Crear nueva cancha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validaciones básicas - SOLO para campos requeridos por FastAPI
      if (!formData.nombre.trim()) {
        setError('El nombre de la cancha es requerido');
        return;
      }
      
      if (!formData.establecimientoId) {
        setError('El ID del establecimiento es requerido');
        return;
      }
      
      await canchaService.createCancha(formData);
      
      // Mostrar mensaje de éxito y redirigir
      alert('Cancha creada exitosamente');
      router.push('/admin/canchas');
    } catch (err: any) {
      console.error('Error creando cancha:', err);
      setError(err.message || 'Error al crear la cancha');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar y volver
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
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {loading ? 'Creando...' : 'Crear Cancha'}
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
                  onChange={handleInputChange}
                  className="edit-form-input"
                  placeholder="Ej: Cancha Principal"
                  required
                />
              </div>
              
              <div className="edit-form-group">
                <label htmlFor="tipo" className="edit-form-label">Tipo de Cancha: *</label>
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
                <label htmlFor="establecimientoId" className="edit-form-label">ID Complejo: *</label>
                <input
                  type="number"
                  id="establecimientoId"
                  name="establecimientoId"
                  value={formData.establecimientoId}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  min="1"
                  placeholder="Ej: 1"
                  required
                />
                <small style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>
                  ID del complejo deportivo al que pertenece esta cancha
                </small>
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
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Cancha techada/cubierta
                </label>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información</h3>
            <div className="edit-info-item">
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                <strong>Campos obligatorios:</strong> Nombre e ID del complejo.<br />
                <strong>Nota:</strong> Precio, capacidad, descripción e imagen se configuran desde el backend 
                o en módulos específicos. Esta creación básica permite registrar la cancha en el sistema.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}