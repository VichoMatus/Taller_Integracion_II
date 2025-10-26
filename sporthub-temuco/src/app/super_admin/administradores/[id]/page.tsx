'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario, UsuarioUpdateRequest } from '@/types/usuarios';
import '@/app/super_admin/dashboard.css';

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
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Administrador
        </h1>
        
        <div className="admin-controls">
          <button 
            onClick={() => router.push('/super_admin/administradores')}
            className="btn-secondary"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="edit-court-card">
        <form onSubmit={handleSubmit}>
          {/* Mensaje de Error */}
          {error && (
            <div className="error-message mb-4">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            
            <div className="edit-form-grid">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido" className="form-label">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+56912345678"
                />
              </div>
            </div>
          </div>

          {/* Estado y Verificación */}
          <div className="edit-section">
            <h3 className="edit-section-title">Estado de la Cuenta</h3>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="verificado"
                  checked={formData.verificado}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span>Cuenta verificada</span>
              </label>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información del Sistema</h3>
            
            <div className="edit-form-grid">
              <div className="form-group">
                <label className="form-label">ID de Usuario</label>
                <input
                  type="text"
                  value={admin.id_usuario}
                  className="form-input"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol</label>
                <input
                  type="text"
                  value={admin.rol}
                  className="form-input"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Creación</label>
                <input
                  type="text"
                  value={new Date(admin.fecha_creacion).toLocaleDateString('es-ES')}
                  className="form-input"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Última Actualización</label>
                <input
                  type="text"
                  value={new Date(admin.fecha_actualizacion).toLocaleDateString('es-ES')}
                  className="form-input"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>

            <button
              type="button"
              onClick={toggleActivation}
              disabled={isSaving}
              className={admin.esta_activo ? 'btn-danger' : 'btn-success'}
              style={{ flex: 1 }}
            >
              {isSaving ? 'Procesando...' : admin.esta_activo ? '🔴 Desactivar' : '🟢 Activar'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/super_admin/administradores')}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
