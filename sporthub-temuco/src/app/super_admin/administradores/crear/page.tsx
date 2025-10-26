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
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">
          Crear Nuevo Administrador
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

          {/* Información Personal */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Personal</h3>
            
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
                  placeholder="Juan"
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
                  placeholder="Pérez"
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
                  placeholder="admin@sporthub.cl"
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

          {/* Credenciales de Acceso */}
          <div className="edit-section">
            <h3 className="edit-section-title">Credenciales de Acceso</h3>
            
            <div className="edit-form-grid">
              <div className="form-group">
                <label htmlFor="contrasena" className="form-label">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
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
                <small style={{ color: '#64748B', fontSize: '0.875rem' }}>
                  Mínimo 8 caracteres
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmarContrasena" className="form-label">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Repite la contraseña"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>

          {/* Configuración de Cuenta */}
          <div className="edit-section">
            <h3 className="edit-section-title">Configuración de Cuenta</h3>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="verificado"
                  checked={formData.verificado}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span>Marcar cuenta como verificada</span>
              </label>
              <small style={{ display: 'block', color: '#64748B', fontSize: '0.875rem', marginTop: '4px', marginLeft: '28px' }}>
                Si está marcado, el administrador no necesitará verificar su email
              </small>
            </div>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#F0F9FF', 
              borderLeft: '4px solid #0EA5E9',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369A1' }}>
                ℹ️ <strong>Nota:</strong> La cuenta se creará activa por defecto. El administrador podrá acceder inmediatamente después de la creación.
              </p>
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
              {isSaving ? 'Creando...' : '✅ Crear Administrador'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/super_admin/administradores')}
              className="btn-secondary"
              disabled={isSaving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
