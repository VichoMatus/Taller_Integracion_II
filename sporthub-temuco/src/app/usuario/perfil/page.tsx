'use client';

import './perfil.css';
import React, { useState, useEffect } from 'react';
import UserLayout from '../UsuarioLayout';
import Link from 'next/link';
import authService from '@/services/authService';
import userStatsService, { UserStats } from '@/services/userStatsService';
import userPreferencesService, { UserPreferences } from '@/services/userPreferencesService';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useRouter } from 'next/navigation';

export default function PerfilUsuario() {
  useAuthProtection(['usuario']);
  
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    reservas_totales: 0,
    canchas_reservadas: 0,
    total_gastado: 0,
    favoritos: 0
  });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    notificaciones_email: true,
    notificaciones_promociones: true,
    notificaciones_recordatorios: true
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  // Función para cargar estadísticas
  const loadUserStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await userStatsService.getUserStats();
      setUserStats(stats);
      console.log("Estadísticas cargadas:", stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Función para cargar preferencias
  const loadUserPreferences = async () => {
    try {
      setLoadingPreferences(true);
      const preferences = await userPreferencesService.getPreferences();
      setUserPreferences(preferences);
      console.log("Preferencias cargadas:", preferences);
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  // Función para actualizar una preferencia
  const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean) => {
    try {
      // Actualizar estado local inmediatamente para mejor UX
      setUserPreferences(prev => ({
        ...prev,
        [key]: value
      }));

      // Actualizar en el backend
      await userPreferencesService.updatePreference(key, value);
      
      console.log(`✅ Preferencia ${key} actualizada a ${value}`);
    } catch (error) {
      console.error('Error actualizando preferencia:', error);
      
      // Revertir cambio si falla
      setUserPreferences(prev => ({
        ...prev,
        [key]: !value
      }));
      
      alert('No se pudo actualizar la preferencia. Inténtalo de nuevo.');
    }
  };

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
    loadUserStats();
    loadUserPreferences(); // Cargar preferencias

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserData();
        loadUserStats();
        loadUserPreferences(); // Recargar preferencias
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

                {/* ESTADÍSTICAS CON DATOS REALES */}
                <div className="stats-box">
                  <h3>📊 Estadísticas</h3>
                  {loadingStats ? (
                    <div className="stats-loading">
                      <div className="spinner-small"></div>
                      <p>Cargando estadísticas...</p>
                    </div>
                  ) : (
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon">🏟️</div>
                        <div className="stat-info">
                          <div className="stat-value">{userStats.reservas_totales}</div>
                          <div className="stat-label">Reservas Totales</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">⚽</div>
                        <div className="stat-info">
                          <div className="stat-value">{userStats.canchas_reservadas}</div>
                          <div className="stat-label">Canchas Reservadas</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                          <div className="stat-value">
                            ${userStats.total_gastado.toLocaleString('es-CL')}
                          </div>
                          <div className="stat-label">Total Gastado</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-info">
                          <div className="stat-value">{userStats.favoritos}</div>
                          <div className="stat-label">Favoritos</div>
                        </div>
                      </div>
                    </div>
                  )}
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

                {/* PREFERENCIAS CON FUNCIONALIDAD REAL */}
                <div className="preferences-box">
                  <h3>⚙️ Preferencias</h3>
                  {loadingPreferences ? (
                    <div className="stats-loading">
                      <div className="spinner-small"></div>
                      <p>Cargando preferencias...</p>
                    </div>
                  ) : (
                    <>
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Notificaciones por Email</h4>
                          <p>Recibe actualizaciones sobre tus reservas</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={userPreferences.notificaciones_email}
                            onChange={(e) => handlePreferenceChange('notificaciones_email', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Ofertas y Promociones</h4>
                          <p>Entérate de descuentos especiales</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={userPreferences.notificaciones_promociones}
                            onChange={(e) => handlePreferenceChange('notificaciones_promociones', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Recordatorios de Reserva</h4>
                          <p>Recibe avisos antes de tus reservas</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={userPreferences.notificaciones_recordatorios}
                            onChange={(e) => handlePreferenceChange('notificaciones_recordatorios', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </>
                  )}
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