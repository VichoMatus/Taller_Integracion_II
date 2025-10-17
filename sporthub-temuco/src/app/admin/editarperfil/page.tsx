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
  
  // Estados para los campos editables
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const userData = await authService.me() as UserProfile;
        console.log('Datos del usuario para editar:', userData);
        
        setUserData(userData);
        
        // Llenar el formulario con los datos actuales
        setFormData({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          telefono: userData.telefono || ''
        });
        
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar mensajes al empezar a editar
    setError(null);
    setSuccess(null);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validaciones básicas
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }

      if (!formData.apellido.trim()) {
        setError('El apellido es requerido');
        return;
      }

      // Preparar datos para enviar (solo campos modificables)
      const updateData: UpdateProfileData = {};
      
      if (formData.nombre !== userData?.nombre) {
        updateData.nombre = formData.nombre;
      }
      
      if (formData.apellido !== userData?.apellido) {
        updateData.apellido = formData.apellido;
      }
      
      if (formData.telefono !== userData?.telefono) {
        updateData.telefono = formData.telefono;
      }

      // Si no hay cambios, mostrar mensaje
      if (Object.keys(updateData).length === 0) {
        setSuccess('No se detectaron cambios para guardar');
        return;
      }

      console.log('Enviando datos actualizados:', updateData);

      // Llamar al servicio para actualizar
      await authService.updateProfile(updateData);
      
      setSuccess('Perfil actualizado correctamente');
      
      // Opcional: Recargar datos actualizados
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
          <div className="loading-message">Cargando perfil...</div>
        </div>
      </Layout>
    );
  }

  const userName = userData ? `${userData.nombre} ${userData.apellido}`.trim() : "Administrador";
  const userEmail = userData?.email || "correoAdministrador241@gmail.com";

  return (
    <Layout userRole="admin" userName={userData?.nombre || "Administrador"}>
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          {/* Columna izquierda */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-edit-container">
                <div className="avatar-edit">
                  <span className="avatar-initial">{getInitial(userName)}</span>
                </div>
                <div className="online-status"></div>
              </div>

              <h2 className="profile-name">{userName}</h2>
            </div>

            <Button 
              className="change-photo-btn" 
              onClick={() => alert('Funcionalidad de cambiar foto en desarrollo')}
              disabled={saving}
            >
              Cambiar Foto
            </Button>

            <div className="info-notice">
              <p>
                Hola Administrador, te recordamos que tus datos son de suma importancia, es por eso que el{' '}
                <span className="highlight-text">Correo Electrónico</span>{' '}
                no se puede modificar ya que ese es su dato clave que los vuelve administradores.
              </p>
            </div>

            <Button 
              className="back-profile-btn" 
              onClick={() => router.push('/admin/perfil')}
              disabled={saving}
            >
              ← Volver al Perfil
            </Button>
          </div>

          {/* Columna derecha */}
          <div className="profile-edit-form">
            <div className="form-container">
              <h1 className="form-title">Editar Perfil Administrador</h1>
              
              {/* Mensajes de estado */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}
              
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Nombre</label>
                  <Input 
                    placeholder="Nombre" 
                    name="nombre" 
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Apellido</label>
                  <Input 
                    placeholder="Apellido" 
                    name="apellido" 
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Número de Teléfono</label>
                  <Input 
                    placeholder="Número Telefónico" 
                    name="telefono" 
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="input-group full-width">
                  <Button
                    className="change-password-btn"
                    onClick={() => router.push('/admin/cambiocontra')}
                    disabled={saving}
                  >
                    🔒 Cambiar Contraseña
                  </Button>
                </div>

                <div className="input-group full-width">
                  <label className="input-label">Correo Electrónico</label>
                  <Input
                    value={userEmail}
                    disabled
                  />
                  <small className="disabled-note">
                    El correo electrónico no se puede modificar
                  </small>
                </div>
              </div>

              <div className="form-actions">
                <Button 
                  className="save-changes-btn" 
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
                </Button>
                
                <Button 
                  className="cancel-btn"
                  onClick={() => router.push('/admin/perfil')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
