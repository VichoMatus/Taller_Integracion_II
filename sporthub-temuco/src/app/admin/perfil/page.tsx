'use client';

import React, { useState, useEffect } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import { authService } from '@/services/authService';
import { MeResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';

export default function PerfilAdministrador() {
  const [userData, setUserData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const userDataResponse = await authService.me();
        setUserData(userDataResponse);
        
        console.log('✅ Datos del usuario:', userDataResponse);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const handleEditProfile = () => {
    router.push('/admin/editarperfil');
  };

  if (loading) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
        <div className="perfil-admin-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
        <div className="perfil-admin-container">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const userName = userData ? `${userData.nombre} ${userData.apellido}`.trim() : "Administrador";

  return (
    <AdminLayout 
      userRole="admin" 
      userName={userData?.nombre || "Admin"} 
      notificationCount={3}
    >
      <div className="perfil-admin-container">
        <div className="perfil-admin-content">
          
          {/* ============= SIDEBAR ============= */}
          <aside className="perfil-sidebar">
            <div className="perfil-card">
              <div className="perfil-header-gradient"></div>
              
              <div className="perfil-avatar-section">
                <div className="perfil-avatar-wrapper">
                  {userData?.avatar_url ? (
                    <img 
                      src={userData.avatar_url} 
                      alt="Foto de perfil" 
                      className="perfil-avatar-img"
                    />
                  ) : (
                    <div className="perfil-avatar-default">
                      <span className="perfil-avatar-initial">{getInitial(userName)}</span>
                    </div>
                  )}
                  <div className="perfil-status-online"></div>
                </div>

                <div className="perfil-user-info">
                  <h2 className="perfil-user-name">{userName}</h2>
                  <span className="perfil-user-role">Administrador</span>
                  {userData?.verificado && (
                    <span className="perfil-verified-badge">✓ Verificado</span>
                  )}
                </div>
              </div>

              <div className="perfil-details-list">
                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📧</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Correo</span>
                    <span className="perfil-detail-value">{userData?.email}</span>
                  </div>
                </div>
                
                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📱</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Teléfono</span>
                    <span className="perfil-detail-value">{userData?.telefono || "No registrado"}</span>
                  </div>
                </div>

                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">🆔</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">ID Usuario</span>
                    <span className="perfil-detail-value">#{userData?.id_usuario}</span>
                  </div>
                </div>

                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">🔑</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Rol</span>
                    <span className="perfil-detail-value perfil-highlight">
                      {userData?.rol || 'admin'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="perfil-actions">
                <button
                  className="perfil-btn perfil-btn-primary"
                  onClick={handleEditProfile}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar Perfil
                </button>
              </div>
            </div>
          </aside>

          {/* ============= PANEL PRINCIPAL ============= */}
          <main className="perfil-main">
            
            {/* Header */}
            <div className="perfil-main-header">
              <div>
                <h1 className="perfil-main-title">Panel del Administrador</h1>
                <p className="perfil-main-subtitle">
                  Bienvenido a tu panel de control, {userData?.nombre}
                </p>
              </div>
            </div>

            {/* ============= BANNER INFORMATIVO ============= */}
            <div className="info-banner">
              <div className="info-banner-icon">📊</div>
              <div className="info-banner-content">
                <strong>Estadísticas Próximamente Disponibles</strong>
                <p>
                  El panel de estadísticas estará disponible una vez que el backend implemente 
                  el envío de <code>owner_id</code> o <code>complejo_id</code> en el token JWT o en el endpoint <code>/auth/me</code>.
                </p>
                <div className="info-banner-steps">
                  <div className="step">
                    <span className="step-icon">⏳</span>
                    <span>Esperando actualización del backend</span>
                  </div>
                  <div className="step">
                    <span className="step-icon">🔧</span>
                    <span>Endpoints de estadísticas listos en frontend</span>
                  </div>
                  <div className="step">
                    <span className="step-icon">✅</span>
                    <span>UI completamente diseñada y preparada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============= INFORMACIÓN PERSONAL PREMIUM ============= */}
            <div className="perfil-info-section">
              <div className="section-header-premium">
                <div className="section-title-wrapper">
                  <span className="section-icon-premium">👤</span>
                  <div>
                    <h2 className="section-title-premium">Información Personal</h2>
                    <p className="section-subtitle-premium">Detalles completos de tu cuenta</p>
                  </div>
                </div>
              </div>
              
              <div className="info-grid-premium">
                <div className="info-card-premium">
                  <div className="info-card-icon-wrapper gradient-purple">
                    <span className="info-card-icon-premium">📝</span>
                  </div>
                  <div className="info-card-body">
                    <h3 className="info-card-title">Nombre Completo</h3>
                    <p className="info-card-value-premium">{userName}</p>
                  </div>
                </div>

                <div className="info-card-premium">
                  <div className="info-card-icon-wrapper gradient-blue">
                    <span className="info-card-icon-premium">📧</span>
                  </div>
                  <div className="info-card-body">
                    <h3 className="info-card-title">Correo Electrónico</h3>
                    <p className="info-card-value-premium">{userData?.email}</p>
                  </div>
                </div>

                <div className="info-card-premium">
                  <div className="info-card-icon-wrapper gradient-green">
                    <span className="info-card-icon-premium">📱</span>
                  </div>
                  <div className="info-card-body">
                    <h3 className="info-card-title">Teléfono</h3>
                    <p className="info-card-value-premium">{userData?.telefono || "No registrado"}</p>
                  </div>
                </div>

                <div className="info-card-premium">
                  <div className="info-card-icon-wrapper gradient-orange">
                    <span className="info-card-icon-premium">
                      {userData?.verificado ? '✅' : '⏳'}
                    </span>
                  </div>
                  <div className="info-card-body">
                    <h3 className="info-card-title">Estado de Verificación</h3>
                    <p className="info-card-value-premium">
                      {userData?.verificado ? 'Cuenta Verificada' : 'Verificación Pendiente'}
                    </p>
                    {userData?.verificado && (
                      <span className="verified-badge-mini">✓ Verificado</span>
                    )}
                  </div>
                </div>

                <div className="info-card-premium">
                  <div className="info-card-icon-wrapper gradient-pink">
                    <span className="info-card-icon-premium">🆔</span>
                  </div>
                  <div className="info-card-body">
                    <h3 className="info-card-title">ID de Usuario</h3>
                    <p className="info-card-value-premium">#{userData?.id_usuario}</p>
                  </div>
                </div>

                <div className="info-card-premium">
                  <div className="info-card-icon-wrapper gradient-cyan">
                    <span className="info-card-icon-premium">🔑</span>
                  </div>
                  <div className="info-card-body">
                    <h3 className="info-card-title">Rol del Sistema</h3>
                    <p className="info-card-value-premium">
                      <span className="role-badge">{userData?.rol || 'admin'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ============= INFORMACIÓN PARA EL ADMINISTRADOR ============= */}
            <div className="admin-info-section">
              <div className="section-header-premium">
                <div className="section-title-wrapper">
                  <span className="section-icon-premium">📋</span>
                  <div>
                    <h2 className="section-title-premium">Información Importante</h2>
                    <p className="section-subtitle-premium">Guía rápida de administración</p>
                  </div>
                </div>
              </div>

              <div className="admin-info-grid">
                <div className="admin-info-card">
                  <div className="admin-info-header">
                    <span className="admin-info-icon">🎯</span>
                    <h3>Responsabilidades del Administrador</h3>
                  </div>
                  <div className="admin-info-content">
                    <ul>
                      <li>✅ Gestionar y supervisar todas las reservas del complejo</li>
                      <li>✅ Administrar la disponibilidad de canchas deportivas</li>
                      <li>✅ Monitorear el estado de las instalaciones</li>
                      <li>✅ Atender consultas y solicitudes de usuarios</li>
                      <li>✅ Mantener actualizada la información del complejo</li>
                    </ul>
                  </div>
                </div>

                <div className="admin-info-card">
                  <div className="admin-info-header">
                    <span className="admin-info-icon">🔐</span>
                    <h3>Seguridad y Acceso</h3>
                  </div>
                  <div className="admin-info-content">
                    <ul>
                      <li>🔒 Acceso completo al panel de administración</li>
                      <li>🔒 Control total sobre las reservas y canchas</li>
                      <li>🔒 Gestión de usuarios y permisos</li>
                      <li>🔒 Visualización de reportes y estadísticas</li>
                      <li>🔒 Configuración del sistema</li>
                    </ul>
                  </div>
                </div>

                <div className="admin-info-card">
                  <div className="admin-info-header">
                    <span className="admin-info-icon">💡</span>
                    <h3>Funcionalidades Disponibles</h3>
                  </div>
                  <div className="admin-info-content">
                    <ul>
                      <li>📊 Panel de estadísticas y métricas en tiempo real</li>
                      <li>📅 Calendario de reservas y disponibilidad</li>
                      <li>🏟️ Gestión completa de canchas deportivas</li>
                      <li>👥 Administración de usuarios y clientes</li>
                      <li>⚙️ Configuración personalizada del complejo</li>
                    </ul>
                  </div>
                </div>

                <div className="admin-info-card">
                  <div className="admin-info-header">
                    <span className="admin-info-icon">📞</span>
                    <h3>Soporte y Ayuda</h3>
                  </div>
                  <div className="admin-info-content">
                    <ul>
                      <li>📧 Email de soporte: soporte@sporthub.cl</li>
                      <li>📱 Teléfono de contacto: +56 9 1234 5678</li>
                      <li>💬 Chat en vivo disponible 24/7</li>
                      <li>📖 Documentación completa en línea</li>
                      <li>🎓 Tutoriales y guías de uso</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </main>

        </div>
      </div>
    </AdminLayout>
  );
}