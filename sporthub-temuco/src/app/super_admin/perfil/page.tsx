'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import './perfilsuperadmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import authService from '@/services/authService';

// Interfaz para el usuario
interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  imagen?: string;
  rol: string;
  fecha_creacion?: string;
}

export default function PerfilSuperAdministrador() {
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Estados para edición
  const [editedData, setEditedData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    imagen: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.me() as User;
        setUser(data);
        setEditedData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          imagen: null
        });
      } catch (e) {
        console.error("Error al cargar usuario:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("El archivo debe ser una imagen");
        return;
      }

      setEditedData({ ...editedData, imagen: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: string, value: string) => {
    setEditedData({ ...editedData, [field]: value });
  };

  // Guardar cambios
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones básicas
      if (!editedData.nombre.trim()) {
        setError("El nombre es obligatorio");
        setIsSaving(false);
        return;
      }

      if (!editedData.apellido.trim()) {
        setError("El apellido es obligatorio");
        setIsSaving(false);
        return;
      }

      // Validar formato de teléfono si se proporciona
      if (editedData.telefono && !validatePhone(editedData.telefono)) {
        setError("El formato del teléfono no es válido. Ejemplo: +56912345678");
        setIsSaving(false);
        return;
      }

      // Preparar payload para actualización
      const updatePayload: Partial<User> = {
        nombre: editedData.nombre.trim(),
        apellido: editedData.apellido.trim(),
      };

      // Solo incluir teléfono si tiene valor
      if (editedData.telefono && editedData.telefono.trim()) {
        updatePayload.telefono = editedData.telefono.trim();
      }

      // TODO: Manejar subida de imagen
      // Si hay una imagen nueva, necesitaremos un endpoint separado para subir archivos
      // Por ahora, solo actualizamos los datos de texto
      if (editedData.imagen) {
        console.log("Imagen seleccionada:", editedData.imagen.name);
        // Aquí iría la lógica para subir la imagen
        // Necesitaremos un servicio adicional como uploadService
      }

      console.log("Actualizando perfil con:", updatePayload);

      // Llamar al servicio para actualizar el perfil
      const updatedUser = await authService.updateProfile(updatePayload) as User;

      // Actualizar el estado local con los datos actualizados
      setUser(updatedUser);
      setEditedData({
        nombre: updatedUser.nombre || '',
        apellido: updatedUser.apellido || '',
        telefono: updatedUser.telefono || '',
        imagen: null
      });

      // Actualizar localStorage si existe userData
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        userData.nombre = updatedUser.nombre;
        userData.apellido = updatedUser.apellido;
        if (updatedUser.telefono) {
          userData.telefono = updatedUser.telefono;
        }
        localStorage.setItem('userData', JSON.stringify(userData));
      }

      setIsEditing(false);
      setSuccess("Perfil actualizado correctamente");
      setImagePreview(null);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      
      // Manejar diferentes tipos de errores
      if (err.response?.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Datos inválidos. Verifica la información.");
      } else if (err.response?.status === 500) {
        setError("Error del servidor. Intenta nuevamente más tarde.");
      } else {
        setError(err.message || "Error al actualizar el perfil. Intenta nuevamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Validar formato de teléfono
  const validatePhone = (phone: string): boolean => {
    // Formato internacional: +código_país seguido de números
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditedData({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      telefono: user?.telefono || '',
      imagen: null
    });
    setImagePreview(null);
    setIsEditing(false);
    setError(null);
  };

  if (loading) return (
    <AdminLayout userRole="super_admin" userName="Super Admin" notificationCount={3}>
      <div className="perfil-super-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (!user) return (
    <AdminLayout userRole="super_admin" userName="Super Admin" notificationCount={3}>
      <div className="perfil-super-container">
        <div className="error-container">
          <p>No se pudo cargar el perfil.</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout userRole="super_admin" userName={user.nombre || "Super Admin"} notificationCount={3}>
      <div className="perfil-super-container">
        <div className="perfil-super-content">
          
          {/* Panel Izquierdo - Tarjeta de Perfil */}
          <aside className="perfil-sidebar">
            <div className="perfil-card">
              <div className="perfil-header-gradient"></div>
              
              <div className="perfil-avatar-section">
                <div className="perfil-avatar-wrapper">
                  {imagePreview || user.imagen ? (
                    <img 
                      src={imagePreview || user.imagen} 
                      alt="Foto de perfil" 
                      className="perfil-avatar-img"
                    />
                  ) : (
                    <div className="perfil-avatar-default">
                      <span className="perfil-avatar-initial">{getInitial(user.nombre || "S")}</span>
                    </div>
                  )}
                  <div className="perfil-status-online"></div>
                  
                  {isEditing && (
                    <label htmlFor="image-upload" className="perfil-change-photo">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <input 
                        id="image-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>

                <div className="perfil-user-info">
                  {isEditing ? (
                    <div className="perfil-edit-name">
                      <input 
                        type="text" 
                        value={editedData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className="perfil-input-name"
                        placeholder="Nombre"
                      />
                      <input 
                        type="text" 
                        value={editedData.apellido}
                        onChange={(e) => handleInputChange('apellido', e.target.value)}
                        className="perfil-input-name"
                        placeholder="Apellido"
                      />
                    </div>
                  ) : (
                    <h2 className="perfil-user-name">{user.nombre} {user.apellido}</h2>
                  )}
                  <span className="perfil-user-role">Super Administrador</span>
                </div>
              </div>

              <div className="perfil-details-list">
                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📧</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Correo</span>
                    <span className="perfil-detail-value">{user.email}</span>
                  </div>
                </div>
                
                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📱</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Teléfono</span>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        value={editedData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="perfil-input-phone"
                        placeholder="+56912345678"
                      />
                    ) : (
                      <span className="perfil-detail-value">{user.telefono || "No registrado"}</span>
                    )}
                  </div>
                </div>

                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📅</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Miembro desde</span>
                    <span className="perfil-detail-value">
                      {user.fecha_creacion ? 
                        new Date(user.fecha_creacion).toLocaleDateString('es-CL', { 
                          month: 'long', 
                          year: 'numeric' 
                        }) 
                        : "No disponible"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="perfil-alert perfil-alert-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="perfil-alert perfil-alert-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {success}
                </div>
              )}

              <div className="perfil-actions">
                {isEditing ? (
                  <>
                    <button
                      className="perfil-btn perfil-btn-primary"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      className="perfil-btn perfil-btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    className="perfil-btn perfil-btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Panel Derecho - Contenido Principal */}
          <main className="perfil-main">
            <div className="perfil-main-header">
              <h1 className="perfil-main-title">Mi Perfil</h1>
              <p className="perfil-main-subtitle">Gestiona tu información y configuración de cuenta</p>
            </div>

            {/* Tabs */}
            <div className="perfil-tabs">
              <button 
                className={`perfil-tab ${activeTab === 'personal' ? 'perfil-tab-active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Información Personal
              </button>
              <button 
                className={`perfil-tab ${activeTab === 'seguridad' ? 'perfil-tab-active' : ''}`}
                onClick={() => setActiveTab('seguridad')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Seguridad
              </button>
              <button 
                className={`perfil-tab ${activeTab === 'actividad' ? 'perfil-tab-active' : ''}`}
                onClick={() => setActiveTab('actividad')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Actividad
              </button>
            </div>

            {/* Contenido de Tabs */}
            <div className="perfil-tab-content">
              
              {activeTab === 'personal' && (
                <div className="perfil-section">
                  <h2 className="perfil-section-title">Información de la Cuenta</h2>
                  
                  <div className="perfil-info-grid">
                    <div className="perfil-info-card">
                      <div className="perfil-info-icon">👤</div>
                      <div className="perfil-info-text">
                        <span className="perfil-info-label">Nombre Completo</span>
                        <span className="perfil-info-value">{user.nombre} {user.apellido}</span>
                      </div>
                    </div>

                    <div className="perfil-info-card">
                      <div className="perfil-info-icon">✉️</div>
                      <div className="perfil-info-text">
                        <span className="perfil-info-label">Correo Electrónico</span>
                        <span className="perfil-info-value">{user.email}</span>
                      </div>
                    </div>

                    <div className="perfil-info-card">
                      <div className="perfil-info-icon">📱</div>
                      <div className="perfil-info-text">
                        <span className="perfil-info-label">Teléfono</span>
                        <span className="perfil-info-value">{user.telefono || "No registrado"}</span>
                      </div>
                    </div>

                    <div className="perfil-info-card">
                      <div className="perfil-info-icon">⭐</div>
                      <div className="perfil-info-text">
                        <span className="perfil-info-label">Rol</span>
                        <span className="perfil-info-value perfil-highlight">Super Administrador</span>
                      </div>
                    </div>

                    <div className="perfil-info-card">
                      <div className="perfil-info-icon">✅</div>
                      <div className="perfil-info-text">
                        <span className="perfil-info-label">Estado</span>
                        <span className="perfil-info-value perfil-status-active">Cuenta Activa</span>
                      </div>
                    </div>

                    <div className="perfil-info-card">
                      <div className="perfil-info-icon">📅</div>
                      <div className="perfil-info-text">
                        <span className="perfil-info-label">Fecha de Registro</span>
                        <span className="perfil-info-value">
                          {user.fecha_creacion ? 
                            new Date(user.fecha_creacion).toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })
                            : "No disponible"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seguridad' && (
                <div className="perfil-section">
                  <h2 className="perfil-section-title">Configuración de Seguridad</h2>
                  
                  <div className="perfil-security-banner">
                    <div className="perfil-security-icon">🔐</div>
                    <div className="perfil-security-text">
                      <h3>Tu contraseña es importante</h3>
                      <p>Mantén tu cuenta segura utilizando una contraseña fuerte y única. Recomendamos cambiarla periódicamente para mayor seguridad.</p>
                    </div>
                  </div>

                  <div className="perfil-security-card">
                    <div className="perfil-security-content">
                      <div className="perfil-security-info">
                        <h4>Contraseña de Acceso</h4>
                        <p>Última actualización: Hace 30 días</p>
                      </div>
                      <button
                        className="perfil-btn perfil-btn-outline"
                        onClick={() => router.push("/super_admin/cambiocontra")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                          <polyline points="10 17 15 12 10 7"/>
                          <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Cambiar Contraseña
                      </button>
                    </div>
                  </div>

                  <div className="perfil-security-tips">
                    <h4>Consejos de Seguridad</h4>
                    <ul>
                      <li>✓ Usa una contraseña única que no uses en otros sitios</li>
                      <li>✓ Incluye letras mayúsculas, minúsculas, números y símbolos</li>
                      <li>✓ Evita usar información personal fácil de adivinar</li>
                      <li>✓ Cambia tu contraseña regularmente</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'actividad' && (
                <div className="perfil-section">
                  <h2 className="perfil-section-title">Actividad Reciente</h2>
                  
                  <div className="perfil-coming-soon">
                    <div className="perfil-coming-soon-icon">🚧</div>
                    <h3>Próximamente</h3>
                    <p>Estamos trabajando en esta funcionalidad para mostrarte tu actividad reciente, inicios de sesión y acciones importantes en el sistema.</p>
                    
                    {/* TODO: Implementar historial de actividad
                        - Inicios de sesión con fecha, hora, dispositivo e IP
                        - Cambios en el perfil
                        - Acciones administrativas
                        - Gráficos de actividad por día/semana/mes
                    */}
                    
                    <div className="perfil-placeholder-stats">
                      <div className="perfil-placeholder-stat">
                        <span className="perfil-placeholder-number">---</span>
                        <span className="perfil-placeholder-label">Días activo</span>
                      </div>
                      <div className="perfil-placeholder-stat">
                        <span className="perfil-placeholder-number">---</span>
                        <span className="perfil-placeholder-label">Sesiones</span>
                      </div>
                      <div className="perfil-placeholder-stat">
                        <span className="perfil-placeholder-number">---</span>
                        <span className="perfil-placeholder-label">Acciones</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>

        </div>
      </div>
    </AdminLayout>
  );
}