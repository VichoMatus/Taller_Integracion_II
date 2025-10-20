'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import './perfilsuper_admin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import authService from '@/services/authService';

export default function PerfilSuperAdministrador() {
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.me();
        setUser(data);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const actividadReciente = [
    { id: 1, accion: "Inicio de sesión", fecha: "Hoy 09:30", dispositivo: "Chrome - Windows" },
    { id: 2, accion: "Revisión de reportes", fecha: "Ayer 15:45", dispositivo: "Safari - MacOS" },
    { id: 3, accion: "Actualización de sistema", fecha: "05 Ene 2024", dispositivo: "Chrome - Windows" },
  ];

  if (loading) return (
    <AdminLayout userRole="super_admin" userName="Super Admin" notificationCount={3}>
      <div className="super_admin-container">
        <div className="profile-card">
          <div>Cargando perfil...</div>
        </div>
      </div>
    </AdminLayout>
  );

  if (!user) return (
    <AdminLayout userRole="super_admin" userName="Super Admin" notificationCount={3}>
      <div className="super_admin-container">
        <div className="profile-card">
          <div>No se pudo cargar el perfil.</div>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout userRole="super_admin" userName={user.nombre || "Super Admin"} notificationCount={3}>
      <div className="super_admin-container">
        {/* Panel Izquierdo - Perfil */}
        <div className="profile-card">
          <div className="avatar-container">
            {user.imagen ? (
              <img 
                src={user.imagen} 
                alt="Foto de perfil" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-default super_admin-avatar">
                <span className="avatar-initial">{getInitial(user.nombre || "S")}</span>
              </div>
            )}
            <div className="online-status"></div>
          </div>

          <h2 className="profile-name">{user.nombre} {user.apellido}</h2>

          <div className="profile-details">
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">{user.telefono || "No registrado"}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Correo</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="super_admin-actions">
            <button
              className="action-button secondary"
              onClick={() => router.push("/super_admin/cambiocontra")}
            >
              <span className="action-icon">🔑</span>
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Panel Derecho - Contenido */}
        <div className="content-panel">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Mi Perfil</h1>
            <p className="dashboard-subtitle">Información de tu cuenta y actividad</p>
          </div>

          {/* Tabs de Navegación */}
          <div className="tabs-container">
            <button 
              className={`tab ${activeTab === 'personal' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              👤 Información Personal
            </button>
            <button 
              className={`tab ${activeTab === 'seguridad' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('seguridad')}
            >
              🔒 Seguridad
            </button>
            <button 
              className={`tab ${activeTab === 'actividad' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('actividad')}
            >
              📊 Actividad
            </button>
          </div>

          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="info-section">
                <h3 className="section-title">Información de la Cuenta</h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Nombre Completo</span>
                    <span className="info-value">{user.nombre} {user.apellido}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Correo Electrónico</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Teléfono</span>
                    <span className="info-value">{user.telefono || "No registrado"}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Rol</span>
                    <span className="info-value highlight">{user.rol || "Super Administrador"}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Estado de Cuenta</span>
                    <span className="info-value status-active">{user.estado || "Activa"}</span>
                  </div>
                </div>
                
                <div className="info-note">
                  <p>📝 <strong>Nota:</strong> Para modificar esta información, contacta al equipo de soporte técnico.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="tab-content">
              <div className="security-section">
                <h3 className="section-title">Configuración de Seguridad</h3>
                
                <div className="security-item">
                  <div className="security-info">
                    <h4>Contraseña</h4>
                    <p>Último cambio: {user.ultimaActualizacionContrasena || "No disponible"}</p>
                  </div>
                  <button
                    className="security-action-btn"
                    onClick={() => router.push("/super_admin/cambiocontra")}
                  >
                    Cambiar Contraseña
                  </button>
                </div>
                
                <div className="security-item">
                  <div className="security-info">
                    <h4>Sesiones Activas</h4>
                    <p>{user.sesionesActivas ? `${user.sesionesActivas} dispositivos conectados` : "No disponible"}</p>
                  </div>
                  <button className="security-action-btn">
                    Gestionar Sesiones
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actividad' && (
            <div className="tab-content">
              <div className="activity-section">
                <h3 className="section-title">Actividad Reciente</h3>
                
                <div className="activity-list">
                  {actividadReciente.map(actividad => (
                    <div key={actividad.id} className="activity-item">
                      <div className="activity-icon">🔐</div>
                      <div className="activity-content">
                        <div className="activity-action">{actividad.accion}</div>
                        <div className="activity-details">
                          <span className="activity-date">{actividad.fecha}</span>
                          <span className="activity-device">{actividad.dispositivo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="activity-stats">
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                      <span className="stat-number">156</span>
                      <span className="stat-text">Días activo</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🕒</div>
                    <div className="stat-info">
                      <span className="stat-number">89%</span>
                      <span className="stat-text">Tiempo activo</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <span className="stat-number">99.9%</span>
                      <span className="stat-text">Confianza</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}