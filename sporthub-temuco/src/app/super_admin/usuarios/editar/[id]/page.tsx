'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario, UsuarioUpdateRequest } from '@/types/usuarios';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    esta_activo: true,
    verificado: false,
    avatar_url: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setIsLoadingData(true);
        console.log('🔍 Cargando datos del usuario ID:', usuarioId);
        const usuario = await superAdminService.obtenerUsuario(usuarioId);
        console.log('✅ Usuario cargado:', usuario);
        
        setFormData({
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          email: usuario.email || '',
          telefono: usuario.telefono || '',
          esta_activo: usuario.esta_activo !== undefined ? usuario.esta_activo : true,
          verificado: usuario.verificado || false,
          avatar_url: usuario.avatar_url || ''
        });
        
        if (usuario.avatar_url) {
          setAvatarPreview(usuario.avatar_url);
        }
      } catch (err: any) {
        console.error('❌ Error al cargar usuario:', err);
        setError('Error al cargar los datos del usuario. Por favor, intenta nuevamente.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (usuarioId) {
      cargarUsuario();
    }
  }, [usuarioId]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Manejar carga de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen no debe superar los 2MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          avatar_url: reader.result as string
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
      console.log('📤 Enviando datos para actualizar usuario:', formData);
      
      // Validaciones básicas
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido');
      }

      if (!formData.apellido.trim()) {
        throw new Error('El apellido es requerido');
      }

      if (!formData.email.trim()) {
        throw new Error('El email es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('El formato del email no es válido');
      }

      // Preparar payload
      const payload: UsuarioUpdateRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || null,
        esta_activo: formData.esta_activo,
        verificado: formData.verificado,
        avatar_url: formData.avatar_url || null
      };

      // Actualizar el usuario usando el servicio
      const usuarioActualizado = await superAdminService.actualizarUsuario(usuarioId, payload);

      console.log('✅ Usuario actualizado exitosamente:', usuarioActualizado);
      
      setSuccess('Usuario actualizado exitosamente');
      setShowSuccessModal(true);
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push('/super_admin/usuarios');
      }, 1500);

    } catch (err: any) {
      console.error('❌ Error al actualizar usuario:', err);
      setError(err.message || 'Error al actualizar el usuario. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/super_admin/usuarios');
  };

  if (isLoadingData) {
    return (
      <div className="admin-page-layout">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
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
                Usuario actualizado exitosamente
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Redirigiendo al panel de usuarios...
              </p>
              <button
                onClick={() => router.push('/super_admin/usuarios')}
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
          <button onClick={handleCancel} className="btn-volver">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Editar Usuario</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button 
            type="submit" 
            form="edit-usuario-form"
            className="btn-volver"
            style={{ 
              backgroundColor: '#4f46e5', 
              color: 'white',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <form id="edit-usuario-form" onSubmit={handleSubmit} className="edit-court-card">
          {/* Información Personal */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Personal</h3>
            <div className="edit-form-grid">
              {/* Nombre */}
              <div className="edit-form-group">
                <label htmlFor="nombre" className="edit-form-label">
                  Nombre: *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="edit-form-input"
                  required
                  placeholder="Ej: Juan"
                  disabled={isLoading}
                />
              </div>

              {/* Apellido */}
              <div className="edit-form-group">
                <label htmlFor="apellido" className="edit-form-label">
                  Apellido: *
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="edit-form-input"
                  required
                  placeholder="Ej: Pérez"
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="edit-form-group">
                <label htmlFor="email" className="edit-form-label">
                  Email: *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="edit-form-input"
                  required
                  placeholder="ejemplo@correo.com"
                  disabled={isLoading}
                />
              </div>

              {/* Teléfono */}
              <div className="edit-form-group">
                <label htmlFor="telefono" className="edit-form-label">
                  Teléfono:
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="edit-form-input"
                  placeholder="+56 9 1234 5678"
                  disabled={isLoading}
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
                    onChange={handleChange}
                    className="edit-form-checkbox"
                    disabled={isLoading}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="esta_activo" style={{ 
                    margin: 0, 
                    fontWeight: '500',
                    color: formData.esta_activo ? '#16a34a' : '#dc2626',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}>
                    {formData.esta_activo ? '✓ Usuario Activo' : '✗ Usuario Inactivo'}
                  </label>
                </div>
                <p className="edit-form-hint">
                  {formData.esta_activo 
                    ? 'El usuario puede iniciar sesión en el sistema'
                    : 'El usuario no puede iniciar sesión en el sistema'}
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
                    onChange={handleChange}
                    className="edit-form-checkbox"
                    disabled={isLoading}
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
                    ? 'El usuario ha confirmado su dirección de correo electrónico'
                    : 'El usuario aún no ha verificado su correo electrónico'}
                </p>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="edit-section">
            <h3 className="edit-section-title">Foto de Perfil</h3>
            <div className="edit-form-grid-full">
              {/* Avatar del Usuario */}
              <div className="edit-form-group-full">
                <label htmlFor="avatar" className="edit-form-label">
                  Avatar:
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="edit-form-input"
                  disabled={isLoading}
                />
                <p className="edit-form-hint">
                  Tamaño máximo: 2MB. Formatos: JPG, PNG, GIF
                </p>
                
                {/* Preview del avatar */}
                {avatarPreview && (
                  <div className="image-preview-container">
                    <p className="image-preview-label">Vista previa:</p>
                    <div className="image-preview-wrapper">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar Preview" 
                        className="image-preview"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '50%' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview('');
                          setFormData(prev => ({ ...prev, avatar_url: '' }));
                        }}
                        className="image-delete-btn"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
