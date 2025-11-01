'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiBackend from '@/config/backend';
import { superAdminService } from '@/services/superAdminService';
import { UsuarioCreateRequest } from '@/types/usuarios';
import '@/app/super_admin/dashboard.css';

export default function CrearAdministradorPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
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

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error al escribir
    if (error) setError('');
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio');
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Ingresa un email válido');
      return false;
    }

    if (!formData.contrasena || formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validar formato de teléfono si está presente
    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      setError('Formato de teléfono inválido');
      return false;
    }

    return true;
  };

  // Guardar nuevo administrador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const payload: UsuarioCreateRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || null,
        rol: 'admin', // Crear como administrador
        contrasena: formData.contrasena,
        verificado: formData.verificado,
        esta_activo: true
      };

      console.log('📤 Creando administrador con payload:', payload);

      // Usar apiBackend que ya tiene la autenticación configurada
      const response = await apiBackend.post('/super_admin/users', payload);

      console.log('✅ Administrador creado:', response.data);
      alert('✅ Administrador creado exitosamente');
      router.push('/super_admin/administradores');
    } catch (error: any) {
      console.error('❌ Error creando administrador:', error);
      setError(error.message || 'Error al crear el administrador');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="admin-dashboard-container">
        <div className="text-center p-8">
          <p>Cargando formulario...</p>
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
          <h1 className="admin-page-title">Crear Nuevo Administrador</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="crear-admin-form"
            className="btn-guardar" 
            disabled={isSaving}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSaving ? 'Creando...' : 'Crear Administrador'}
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
        <form id="crear-admin-form" onSubmit={handleSubmit} className="edit-court-card">
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
                  placeholder="Ej: Juan"
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
                  placeholder="Ej: Pérez"
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
                  placeholder="admin@sporthub.cl"
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

          {/* Credenciales de Acceso */}
          <div className="edit-section">
            <h3 className="edit-section-title">Credenciales de Acceso</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label htmlFor="contrasena" className="edit-form-label">
                  Contraseña: *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className="edit-form-input"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B'
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="edit-form-hint">
                  Mínimo 8 caracteres
                </p>
              </div>

              <div className="edit-form-group">
                <label htmlFor="confirmarContrasena" className="edit-form-label">
                  Confirmar Contraseña: *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleInputChange}
                  className="edit-form-input"
                  placeholder="Repite la contraseña"
                  required
                  minLength={8}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Configuración de Cuenta */}
          <div className="edit-section">
            <h3 className="edit-section-title">Configuración de Cuenta</h3>
            <div className="edit-form-grid">
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
                  Marcar cuenta como verificada
                </label>
              </div>
            </div>
            
            <p className="edit-form-hint">
              Si está marcado, el administrador no necesitará verificar su email
            </p>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#fff7ed', 
              borderLeft: '4px solid #f97316',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#9a3412' }}>
                ℹ️ <strong>Nota:</strong> La cuenta se creará activa por defecto. El administrador podrá acceder inmediatamente después de la creación.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
