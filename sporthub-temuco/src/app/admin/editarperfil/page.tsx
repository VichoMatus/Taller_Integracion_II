'use client';

import './editarperfil.css';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/AdminsLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface UserProfile {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar_url?: string;
  rol: string;
}

interface UpdateProfileData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export default function EditarPerfilAdministrador() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    imagen: null as File | null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const userData = await authService.me() as UserProfile;

        setUserData(userData);
        setFormData({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          telefono: userData.telefono || '',
          imagen: null
        });
        setImagePreview(null);
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError("El archivo debe ser una imagen");
        return;
      }

      setFormData(prev => ({ ...prev, imagen: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '');

    // Si está vacío, retornar vacío
    if (numbers.length === 0) return '';

    // Si empieza con 56, extraer los dígitos después del 56
    let phoneDigits = numbers;
    if (numbers.startsWith('56')) {
      phoneDigits = numbers.substring(2);
    }

    // Limitar a 9 dígitos
    phoneDigits = phoneDigits.substring(0, 9);

    // Si hay dígitos, formatear como +56 9 XXXX XXXX
    if (phoneDigits.length > 0) {
      // Asegurarse que empiece con 9
      if (!phoneDigits.startsWith('9')) {
        phoneDigits = '9' + phoneDigits.substring(0, 8);
      }

      // Formatear con espacios
      let formatted = '+56 9';
      if (phoneDigits.length > 1) {
        formatted += ' ' + phoneDigits.substring(1, 5);
      }
      if (phoneDigits.length > 5) {
        formatted += ' ' + phoneDigits.substring(5, 9);
      }

      return formatted;
    }

    return '+56 9';
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({
      ...prev,
      telefono: formatted
    }));
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || phone.trim() === '' || phone === '+56 9') return true; // Opcional

    // Debe tener exactamente +56 9 XXXX XXXX (17 caracteres con espacios)
    const phoneRegex = /^\+56 9 \d{4} \d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }

      if (!formData.apellido.trim()) {
        setError('El apellido es requerido');
        return;
      }

      // Validar teléfono si tiene valor
      if (formData.telefono && formData.telefono !== '+56 9' && !validatePhoneNumber(formData.telefono)) {
        setError('El teléfono debe tener el formato +56 9 XXXX XXXX');
        return;
      }

      // Usar FormData para enviar imagen si existe
      const updateData = new FormData();
      updateData.append('nombre', formData.nombre);
      updateData.append('apellido', formData.apellido);
      updateData.append('telefono', formData.telefono === '+56 9' ? '' : formData.telefono);
      if (formData.imagen) {
        updateData.append('avatar', formData.imagen);
      }

      // Verificar si hay cambios
      if (
        !formData.imagen &&
        formData.nombre === userData?.nombre &&
        formData.apellido === userData?.apellido &&
        (formData.telefono === userData?.telefono || (formData.telefono === '+56 9' && !userData?.telefono))
      ) {
        setSuccess('No se detectaron cambios para guardar');
        return;
      }

      await authService.updateProfile(updateData);

      setSuccess('Perfil actualizado correctamente');

      setTimeout(() => {
        router.push('/admin/perfil');
      }, 1500);

    } catch (err: any) {
      console.error('Error guardando cambios:', err);
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Layout userRole="admin" userName="Administrador">
        <div className="edit-profile-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userName = userData ? `${userData.nombre} ${userData.apellido}`.trim() : "Administrador";
  const userEmail = userData?.email || "correo@administrador.com";

  return (
    <Layout userRole="admin" userName={userData?.nombre || "Administrador"}>
      <div className="edit-profile-container">
        <div className="edit-profile-content">
          
          {/* SIDEBAR IZQUIERDO */}
          <aside className="edit-sidebar">
            <div className="edit-sidebar-card">
              <div className="sidebar-gradient-bar"></div>
              
              <div className="avatar-section-edit">
                <div className="avatar-wrapper-edit">
                  {imagePreview || userData?.avatar_url ? (
                    <img 
                      src={imagePreview || userData.avatar_url} 
                      alt="Avatar" 
                      className="avatar-img-edit"
                    />
                  ) : (
                    <div className="avatar-default-edit">
                      <span className="avatar-initial-edit">{getInitial(userName)}</span>
                    </div>
                  )}
                  <div className="avatar-status-edit"></div>
                </div>

                <h2 className="sidebar-user-name">{userName}</h2>
                <span className="sidebar-user-role">Administrador</span>
                
                <label htmlFor="image-upload" className="change-photo-btn-modern" style={{ cursor: "pointer" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Cambiar Foto
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                {imagePreview && (
                  <div className="image-preview-info">
                    <span>Imagen lista para guardar</span>
                  </div>
                )}
              </div>

              <div className="info-card-edit">
                <div className="info-icon-edit">ℹ️</div>
                <div className="info-content-edit">
                  <p className="info-title-edit">Información importante</p>
                  <p className="info-text-edit">
                    El <span className="highlight-email">correo electrónico</span> no se puede modificar ya que es tu identificador único de administrador.
                  </p>
                </div>
              </div>

              <button 
                className="back-btn-modern" 
                onClick={() => router.push('/admin/perfil')}
                disabled={saving}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Volver al Perfil
              </button>
            </div>
          </aside>
          {/* PANEL PRINCIPAL - FORMULARIO */}
          <main className="edit-main-content">
            <div className="edit-header">
              <div>
                <h1 className="edit-title">Editar Perfil</h1>
                <p className="edit-subtitle">Actualiza tu información personal</p>
              </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div className="alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {success}
              </div>
            )}

            <div className="form-sections">
              {/* Sección: Información Personal y Contacto */}
              <div className="form-section-card">
                <div className="section-header">
                  <div className="section-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="section-text-wrapper">
                    <h3 className="section-title">Información del Perfil</h3>
                    <p className="section-description">Datos personales y de contacto</p>
                  </div>
                </div>

                <div className="form-grid-modern">
                  <div className="input-group-modern">
                    <label className="input-label-modern">
                      <div className="label-icon-wrapper">
                        <span className="label-icon">👤</span>
                        <div className="label-text-group">
                          <span className="label-title">Nombre</span>
                          <span className="label-description">Tu nombre completo</span>
                        </div>
                      </div>
                    </label>
                    <Input 
                      placeholder="Ingresa tu nombre" 
                      name="nombre" 
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      disabled={saving}
                      className="input-modern"
                    />
                  </div>
                  
                  <div className="input-group-modern">
                    <label className="input-label-modern">
                      <div className="label-icon-wrapper">
                        <span className="label-icon">👤</span>
                        <div className="label-text-group">
                          <span className="label-title">Apellido</span>
                          <span className="label-description">Tu apellido completo</span>
                        </div>
                      </div>
                    </label>
                    <Input 
                      placeholder="Ingresa tu apellido" 
                      name="apellido" 
                      value={formData.apellido}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      disabled={saving}
                      className="input-modern"
                    />
                  </div>

                  <div className="input-group-modern">
                    <label className="input-label-modern">
                      <div className="label-icon-wrapper">
                        <span className="label-icon">📱</span>
                        <div className="label-text-group">
                          <span className="label-title">Teléfono</span>
                          <span className="label-description">Formato: +56 9 XXXX XXXX</span>
                        </div>
                      </div>
                    </label>
                    <Input 
                      placeholder="+56 9 1234 5678" 
                      name="telefono" 
                      value={formData.telefono || '+56 9'}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      disabled={saving}
                      className="input-modern"                      
                    />
                  </div>
                  
                  <div className="input-group-modern">
                    <label className="input-label-modern">
                      <div className="label-icon-wrapper">
                        <span className="label-icon">✉️</span>
                        <div className="label-text-group">
                          <span className="label-title">Correo Electrónico</span>
                          <span className="label-description">No se puede modificar</span>
                        </div>
                      </div>
                      <span className="label-badge">No editable</span>
                    </label>
                    <Input
                      value={userEmail}
                      disabled
                      className="input-modern input-disabled"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Cambiar Contraseña - Mismo tamaño */}
              <button
                className="change-password-btn-large"
                onClick={() => router.push('/admin/cambiocontra')}
                disabled={saving}
              >
                <div className="password-btn-content">
                  <div className="password-btn-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div className="password-btn-text">
                    <span className="password-btn-title">Cambiar Contraseña</span>
                    <span className="password-btn-desc">Actualiza tu contraseña de acceso al sistema</span>
                  </div>
                  <svg className="password-btn-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* Acciones del formulario */}
            <div className="form-actions-modern">
              <button 
                className="btn-cancel-modern"
                onClick={() => router.push('/admin/perfil')}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                className="btn-save-modern" 
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </main>

        </div>
      </div>
    </Layout>
  );
}