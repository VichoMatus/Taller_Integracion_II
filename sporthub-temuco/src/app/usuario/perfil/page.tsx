'use client';

import './perfil.css';
import React, { useState, useEffect } from 'react';
import UserLayout from '../UsuarioLayout';
import Link from 'next/link';
import authService from '@/services/authService';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useRouter } from 'next/navigation';

export default function PerfilUsuario() {
  // Protección de ruta - solo usuarios pueden acceder
  useAuthProtection(['usuario']);
  
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  // Función para cargar los datos del usuario
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const data = await authService.me();
      setUserData({
        id_usuario: data.id_usuario,
        name: `${data.nombre} ${data.apellido}`,
        nombre: data.nombre,
        apellido: data.apellido,
        phone: data.telefono || "No registrado",
        email: data.email,
        avatar: data.avatar_url,
        rol: data.rol,
        bio: data.bio || "",
        esta_activo: data.esta_activo,
        verificado: data.verificado
      });
      console.log("Datos de usuario actualizados:", data);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const userInitial = userData?.name ? userData.name.charAt(0).toUpperCase() : "U";

  if (isLoading) {
    return (
      <UserLayout userName={userData?.name || "Usuario"} notificationCount={2}>
        <div className="perfil-wrapper">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!userData) {
    return (
      <UserLayout userName="Usuario" notificationCount={2}>
        <div className="perfil-wrapper">
          <div className="loading-spinner">
            <p>No se pudo cargar el perfil.</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <div id="tailwind-wrapper">
      <UserLayout userName={userData.name} notificationCount={2}>
        <div className="perfil-wrapper">
          <div className="profile-card">
            {/* SIDEBAR IZQUIERDA */}
            <div className="profile-left">
              <div className="perfil-header-gradient"></div>
              
              <div className="avatar-iniciales">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Avatar" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              <h2>{userData.name}</h2>
              <p>{userData.rol ? userData.rol.charAt(0).toUpperCase() + userData.rol.slice(1) : "Usuario"}</p>

              <div className="profile-details">
                <div>
                  <span>📧 Email</span>
                  <span>{userData.email}</span>
                </div>
                <div>
                  <span>📱 Teléfono</span>
                  <span>{userData.phone}</span>
                </div>
                <div>
                  <span>👤 Nombre</span>
                  <span>{userData.nombre}</span>
                </div>
                <div>
                  <span>👥 Apellido</span>
                  <span>{userData.apellido}</span>
                </div>
                <div>
                  <span>🎯 Rol</span>
                  <span>{userData.rol}</span>
                </div>
                <div>
                  <span>🆔 ID</span>
                  <span>#{userData.id_usuario}</span>
                </div>
              </div>

              <Link href="/usuario/editarperfil">
                <button className="edit-btn">
                  ✏️ Editar Perfil
                </button>
              </Link>
            </div>

            {/* CONTENIDO DERECHA */}
            <div className="profile-right">
              <div className="perfil-main-header">
                <h1 className="perfil-titulo">Mi Perfil</h1>
                <p className="perfil-subtitulo">Gestiona tu información personal y configuraciones</p>
              </div>

              <div className="perfil-content-scroll">
                {/* INFORMACIÓN DEL USUARIO */}
                <div className="info-box">
                  <h3>💬 Sobre mí</h3>
                  {userData.bio ? (
                    <p>{userData.bio}</p>
                  ) : (
                    <p className="bio-placeholder">
                      Hola <strong>{userData.nombre}</strong>, bienvenido a tu perfil. 
                      <br /><br />
                      Aquí podrás ver y gestionar toda tu información personal. 
                      Te invitamos a completar tu biografía para que otros usuarios puedan conocerte mejor.
                      <br /><br />
                      Haz clic en <strong>"Editar Perfil"</strong> para agregar más información sobre ti.
                    </p>
                  )}
                </div>

                {/* ESTADÍSTICAS */}
                <div className="stats-box">
                  <h3>📊 Estadísticas</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">🏟️</div>
                      <div className="stat-info">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Reservas Totales</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">⚽</div>
                      <div className="stat-info">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Canchas Visitadas</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <div className="stat-value">$0</div>
                        <div className="stat-label">Total Gastado</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">⭐</div>
                      <div className="stat-info">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Favoritos</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN DE SEGURIDAD */}
                <div className="security-box">
                  <h3>🔒 Seguridad de la Cuenta</h3>
                  <div className="security-items">
                    <div className="security-item">
                      <div className="security-icon">✅</div>
                      <div className="security-content">
                        <h4>Email Verificado</h4>
                        <p>{userData.verificado ? 'Tu email ha sido verificado correctamente' : 'Verifica tu email para mayor seguridad'}</p>
                      </div>
                      {!userData.verificado && (
                        <button className="security-btn">Verificar</button>
                      )}
                    </div>
                    <div className="security-item">
                      <div className="security-icon">🔑</div>
                      <div className="security-content">
                        <h4>Contraseña Segura</h4>
                        <p>Última actualización: No disponible</p>
                      </div>
                      <button 
                        className="security-btn"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Cambiar
                      </button>
                    </div>
                    <div className="security-item">
                      <div className="security-icon">📱</div>
                      <div className="security-content">
                        <h4>Teléfono Registrado</h4>
                        <p>{userData.phone !== 'No registrado' ? 'Teléfono verificado' : 'Agrega tu teléfono para mayor seguridad'}</p>
                      </div>
                      {userData.phone === 'No registrado' && (
                        <Link href="/usuario/editarperfil">
                          <button className="security-btn">Agregar</button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* PREFERENCIAS */}
                <div className="preferences-box">
                  <h3>⚙️ Preferencias</h3>
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Notificaciones por Email</h4>
                      <p>Recibe actualizaciones sobre tus reservas</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Ofertas y Promociones</h4>
                      <p>Entérate de descuentos especiales</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Recordatorios de Reserva</h4>
                      <p>Recibe avisos antes de tus reservas</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL CAMBIAR CONTRASEÑA */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔐 Cambiar Contraseña</h2>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p className="modal-info">
                  Para cambiar tu contraseña, serás redirigido a la página de configuración.
                </p>
                <div className="modal-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowPasswordModal(false);
                      router.push('/usuario/seguridad');
                    }}
                  >
                    Ir a Configuración
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </UserLayout>
    </div>
  );
}