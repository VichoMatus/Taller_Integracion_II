'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario, UsuarioUpdateRequest } from '@/types/usuarios';

export default function EditarAdministradorPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [admin, setAdmin] = useState<Usuario | null>(null);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    esta_activo: true,
    verificado: false
  });

  // Marcar como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar autenticación
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const userRole = localStorage.getItem('user_role');
      
      if (!token || userRole !== 'super_admin') {
        router.push('/login');
        return;
      }
    };

    checkAuth();
  }, [router, mounted]);

  // Cargar datos del administrador
  useEffect(() => {
    if (!mounted || !adminId) return;

    const cargarAdmin = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const data = await superAdminService.obtenerUsuario(adminId);
        setAdmin(data);
        
        // Llenar el formulario con los datos existentes
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          esta_activo: data.esta_activo,
          verificado: data.verificado
        });
      } catch (error: any) {
        console.error('❌ Error cargando administrador:', error);
        setError(error.message || 'Error al cargar los datos del administrador');
      } finally {
        setIsLoading(false);
      }
    };

    cargarAdmin();
  }, [adminId, mounted]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminId) return;

    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('El nombre y apellido son obligatorios');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const payload: UsuarioUpdateRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim() || null,
        esta_activo: formData.esta_activo,
        verificado: formData.verificado
      };

      await superAdminService.actualizarUsuario(adminId, payload);
      
      setSuccess('✅ Administrador actualizado exitosamente');
      setShowSuccessModal(true);
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push('/super_admin/administradores');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Error actualizando administrador:', error);
      setError(error.message || 'Error al actualizar el administrador');
    } finally {
      setIsSaving(false);
    }
  };

  // Activar/Desactivar administrador
  const toggleActivation = async () => {
    if (!adminId || !admin) return;

    const action = admin.esta_activo ? 'desactivar' : 'activar';

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      await superAdminService.actualizarUsuario(adminId, {
        esta_activo: !admin.esta_activo
      });

      setSuccess(`✅ Administrador ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
      setShowSuccessModal(true);
      
      // Actualizar el estado local
      setAdmin(prev => prev ? { ...prev, esta_activo: !prev.esta_activo } : null);
      setFormData(prev => ({ ...prev, esta_activo: !prev.esta_activo }));
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push('/super_admin/administradores');
      }, 1500);
      
    } catch (error: any) {
      console.error(`❌ Error al ${action} administrador:`, error);
      setError(error.message || `Error al ${action} el administrador`);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="admin-dashboard-container">
        <div className="text-center p-8">
          <p>Cargando datos del administrador...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!admin) {
    return (
      <div className="admin-dashboard-container">
        <div className="text-center p-8">
          <p className="text-red-600">No se pudo cargar el administrador</p>
          <button 
            onClick={() => router.push('/super_admin/administradores')}
            className="btn-secondary mt-4"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-layout">
      {/* Modal de Éxito */}
      {showSuccessModal && (
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
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                {success.replace('✅ ', '')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Redirigiendo al panel de administradores...
              </p>
              <button
                onClick={() => router.push('/super_admin/administradores')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <button 
            onClick={() => router.push('/super_admin/administradores')}
            className="btn-volver"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Editar Administrador</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="editar-admin-form"
            className="btn-volver"
            style={{ 
              backgroundColor: '#4f46e5', 
              color: 'white',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            disabled={isSaving}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="editar-admin-form" onSubmit={handleSubmit} className="edit-court-card">

          {/* Información Personal */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Personal</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="nombre" className="edit-form-label">
                  Nombre: *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="apellido" className="edit-form-label">
                  Apellido: *
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="edit-form-group">
                <label htmlFor="email" className="edit-form-label">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={admin?.email || ''}
                  className="edit-form-input"
                  disabled
                  readOnly
                />
                <p className="edit-form-hint">
                  El email no puede ser modificado
                </p>
              </div>

              <div className="edit-form-group">
                <label htmlFor="telefono" className="edit-form-label">
                  Teléfono:
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  placeholder="+56 9 1234 5678"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Estado de la Cuenta */}
          <div className="edit-section">
            <h3 className="edit-section-title">Estado de la Cuenta</h3>
            <div className="edit-form-grid">
              {/* Estado Activo */}
              <div className="edit-form-group">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: formData.esta_activo ? '#dcfce7' : '#fee2e2',
                  borderRadius: '8px',
                  border: `2px solid ${formData.esta_activo ? '#16a34a' : '#dc2626'}`
                }}>
                  <input
                    type="checkbox"
                    id="esta_activo"
                    name="esta_activo"
                    checked={formData.esta_activo}
                    onChange={handleInputChange}
                    className="edit-form-checkbox"
                    disabled={isSaving}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="esta_activo" style={{ 
                    margin: 0, 
                    fontWeight: '500',
                    color: formData.esta_activo ? '#16a34a' : '#dc2626',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}>
                    {formData.esta_activo ? '✓ Cuenta Activa' : '✗ Cuenta Inactiva'}
                  </label>
                </div>
                <p className="edit-form-hint">
                  {formData.esta_activo 
                    ? 'El administrador puede iniciar sesión en el sistema'
                    : 'El administrador no puede iniciar sesión en el sistema'}
                </p>
              </div>

              {/* Verificado */}
              <div className="edit-form-group">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: formData.verificado ? '#dbeafe' : '#fef3c7',
                  borderRadius: '8px',
                  border: `2px solid ${formData.verificado ? '#3b82f6' : '#f59e0b'}`
                }}>
                  <input
                    type="checkbox"
                    id="verificado"
                    name="verificado"
                    checked={formData.verificado}
                    onChange={handleInputChange}
                    className="edit-form-checkbox"
                    disabled={isSaving}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="verificado" style={{ 
                    margin: 0, 
                    fontWeight: '500',
                    color: formData.verificado ? '#3b82f6' : '#f59e0b',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}>
                    {formData.verificado ? '✓ Email Verificado' : '✗ Email Sin Verificar'}
                  </label>
                </div>
                <p className="edit-form-hint">
                  {formData.verificado 
                    ? 'El administrador ha confirmado su dirección de correo electrónico'
                    : 'El administrador aún no ha verificado su correo electrónico'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información del Sistema</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">ID de Usuario:</label>
                <input
                  type="text"
                  value={admin.id_usuario}
                  className="edit-form-input"
                  disabled
                  readOnly
                />
                <p className="edit-form-hint">
                  El ID no puede ser modificado
                </p>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Rol:</label>
                <input
                  type="text"
                  value={admin.rol}
                  className="edit-form-input"
                  disabled
                  readOnly
                />
                <p className="edit-form-hint">
                  Para cambiar el rol, usa la opción "Cambiar Rango"
                </p>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Fecha de Creación:</label>
                <input
                  type="text"
                  value={new Date(admin.fecha_creacion).toLocaleDateString('es-ES')}
                  className="edit-form-input"
                  disabled
                  readOnly
                />
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Última Actualización:</label>
                <input
                  type="text"
                  value={new Date(admin.fecha_actualizacion).toLocaleDateString('es-ES')}
                  className="edit-form-input"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Acciones Peligrosas */}
          <div className="edit-section">
            <h3 className="edit-section-title" style={{ color: '#dc2626' }}>Acciones Peligrosas</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <button
                  type="button"
                  onClick={toggleActivation}
                  disabled={isSaving}
                  className="btn-secondary"
                  style={{ 
                    backgroundColor: admin.esta_activo ? '#dc2626' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    width: '100%',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.75rem 1rem'
                  }}
                >
                  {admin.esta_activo ? '🚫 Desactivar Administrador' : '✅ Activar Administrador'}
                </button>
                <p className="edit-form-hint">
                  {admin.esta_activo 
                    ? 'Desactivar impedirá que el administrador pueda iniciar sesión'
                    : 'Activar permitirá que el administrador pueda iniciar sesión'}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
