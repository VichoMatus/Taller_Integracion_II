'use client';

import React, { useState } from 'react';
import './perfilsuperadmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';

export default function PerfilSuperAdministrador() {
  const [activeTab, setActiveTab] = useState('personal');
  
  const userImage = null;
  const userName = "Super Administrador";
  
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const actividadReciente = [
    { id: 1, accion: "Inicio de sesión", fecha: "Hoy 09:30", dispositivo: "Chrome - Windows" },
    { id: 2, accion: "Revisión de reportes", fecha: "Ayer 15:45", dispositivo: "Safari - MacOS" },
    { id: 3, accion: "Actualización de sistema", fecha: "05 Ene 2024", dispositivo: "Chrome - Windows" },
  ];

  return (
    <AdminLayout userRole="superadmin" userName="Super Admin" notificationCount={3}>
      <div className="superadmin-container">
        
        <div className="profile-card">
          <div className="avatar-container">
            {userImage ? (
              <img 
                src={userImage} 
                alt="Foto de perfil" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-default superadmin-avatar">
                <span className="avatar-initial">{getInitial(userName)}</span>
              </div>
            )}
            <div className="online-status"></div>
          </div>

          <h2 className="profile-name">{userName}</h2>

          <div className="profile-details">
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">+569 12098456</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Correo</span>
                <span className="detail-value">superadmin@empresa.com</span>
              </div>
            </div>
          </div>

          <div className="superadmin-actions">
            <button className="action-button secondary">
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
                    <span className="info-value">Super Administrador</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Correo Electrónico</span>
                    <span className="info-value">superadmin@empresa.com</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Teléfono</span>
                    <span className="info-value">+569 12098456</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Rol</span>
                    <span className="info-value highlight">Super Administrador</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Estado de Cuenta</span>
                    <span className="info-value status-active">Activa</span>
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
                    <p>Último cambio: 15 Dic 2023</p>
                  </div>
                  <button className="security-action-btn">
                    Cambiar Contraseña
                  </button>
                </div>
                
                <div className="security-item">
                  <div className="security-info">
                    <h4>Sesiones Activas</h4>
                    <p>2 dispositivos conectados</p>
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