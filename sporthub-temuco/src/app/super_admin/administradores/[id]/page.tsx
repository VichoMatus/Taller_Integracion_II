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
  const [admin, setAdmin] = useState<Usuario | null>(null);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
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
          email: data.email || '',
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

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const payload: UsuarioUpdateRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || null,
        esta_activo: formData.esta_activo,
        verificado: formData.verificado
      };

      await superAdminService.actualizarUsuario(adminId, payload);
      alert('✅ Administrador actualizado exitosamente');
      router.push('/super_admin/administradores');
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
    const confirmMessage = admin.esta_activo
      ? '¿Estás seguro de que deseas desactivar este administrador?'
      : '¿Estás seguro de que deseas activar este administrador?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      await superAdminService.actualizarUsuario(adminId, {
        esta_activo: !admin.esta_activo
      });

      alert(`✅ Administrador ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
      
      // Actualizar el estado local
      setAdmin(prev => prev ? { ...prev, esta_activo: !prev.esta_activo } : null);
      setFormData(prev => ({ ...prev, esta_activo: !prev.esta_activo }));
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
            className="btn-guardar" 
            disabled={isSaving}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
                  Email: *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  required
                  disabled={isSaving}
                />
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

          {/* Estado y Verificación */}
          <div className="edit-section">
            <h3 className="edit-section-title">Estado de la Cuenta</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group checkbox-group">
                <input
                  type="checkbox"
                  id="esta_activo"
                  name="esta_activo"
                  checked={formData.esta_activo}
                  onChange={handleInputChange}
                  className="edit-form-checkbox"
                  disabled={isSaving}
                />
                <label htmlFor="esta_activo" className="edit-form-label-inline">
                  Cuenta Activa
                </label>
              </div>

              <div className="edit-form-group checkbox-group">
                <input
                  type="checkbox"
                  id="verificado"
                  name="verificado"
                  checked={formData.verificado}
                  onChange={handleInputChange}
                  className="edit-form-checkbox"
                  disabled={isSaving}
                />
                <label htmlFor="verificado" className="edit-form-label-inline">
                  Email Verificado
                </label>
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
                    border: 'none'
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
