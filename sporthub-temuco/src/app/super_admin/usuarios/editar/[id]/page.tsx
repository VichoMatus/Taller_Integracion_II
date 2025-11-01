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
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'usuario' as 'usuario' | 'admin' | 'super_admin',
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
          rol: usuario.rol || 'usuario',
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
        rol: formData.rol,
        esta_activo: formData.esta_activo,
        verificado: formData.verificado,
        avatar_url: formData.avatar_url || null
      };

      // Actualizar el usuario usando el servicio
      const usuarioActualizado = await superAdminService.actualizarUsuario(usuarioId, payload);

      console.log('✅ Usuario actualizado exitosamente:', usuarioActualizado);
      
      setSuccess('Usuario actualizado exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/super_admin/usuarios');
      }, 2000);

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
            className="btn-guardar" 
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      {success && (
        <div className="success-container">
          <p><strong>Éxito:</strong> {success}</p>
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

          {/* Rol y Estado */}
          <div className="edit-section">
            <h3 className="edit-section-title">Rol y Estado</h3>
            <div className="edit-form-grid">
              {/* Rol */}
              <div className="edit-form-group">
                <label htmlFor="rol" className="edit-form-label">
                  Rol: *
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="edit-form-select"
                  required
                  disabled={isLoading}
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Administrador</option>
                </select>
              </div>

              {/* Estado Activo */}
              <div className="edit-form-group checkbox-group">
                <input
                  type="checkbox"
                  id="esta_activo"
                  name="esta_activo"
                  checked={formData.esta_activo}
                  onChange={handleChange}
                  className="edit-form-checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="esta_activo" className="edit-form-label-inline">
                  Usuario Activo
                </label>
              </div>

              {/* Verificado */}
              <div className="edit-form-group checkbox-group">
                <input
                  type="checkbox"
                  id="verificado"
                  name="verificado"
                  checked={formData.verificado}
                  onChange={handleChange}
                  className="edit-form-checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="verificado" className="edit-form-label-inline">
                  Email Verificado
                </label>
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
