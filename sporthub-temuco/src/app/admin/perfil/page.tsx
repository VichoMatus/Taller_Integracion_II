'use client';

import React, { useState, useEffect } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar_url?: string;
  rol: string;
}

export default function PerfilAdministrador() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDia, setHoveredDia] = useState<string | null>(null);
  const router = useRouter();

  const horasPorDia = [
    { dia: 'Lunes', horas: 6, color: '#5a6993' },
    { dia: 'Martes', horas: 7, color: '#6b7aa3' },
    { dia: 'Miércoles', horas: 5, color: '#7a89b3' },
    { dia: 'Jueves', horas: 8, color: '#8998c3' },
    { dia: 'Viernes', horas: 4, color: '#98a7d3' },
    { dia: 'Sábado', horas: 2, color: '#a7b6e3' },
    { dia: 'Domingo', horas: 0, color: '#b6c5f3' },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const userData = await authService.me() as UserProfile;
        console.log('Datos del usuario desde auth/me:', userData);
        
        setUserData(userData);
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
  const totalHoras = horasPorDia.reduce((acc, dia) => acc + dia.horas, 0);
  const promedioDiario = (totalHoras / 7).toFixed(1);
  const maxHoras = Math.max(...horasPorDia.map(d => d.horas));
  const diaMaxHoras = horasPorDia.find(d => d.horas === maxHoras)?.dia || 'N/A';

  return (
    <AdminLayout 
      userRole="admin" 
      userName={userData?.nombre || "Admin"} 
      notificationCount={3}
    >
      <div className="perfil-admin-container">
        <div className="perfil-admin-content">
          
          {/* SIDEBAR - Igual que Super Admin */}
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
                  <div className="perfil-detail-icon">💼</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Encargado de</span>
                    <span className="perfil-detail-value perfil-highlight">Reservas y Gestión</span>
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

          {/* PANEL PRINCIPAL */}
          <main className="perfil-main">
            <div className="perfil-main-header">
              <div>
                <h1 className="perfil-main-title">Panel del Administrador</h1>
                <p className="perfil-main-subtitle">Bienvenido de vuelta, aquí tienes tu resumen semanal</p>
              </div>
            </div>

            {/* Gráfico de Horas - AMPLIADO */}
            <div className="chart-card-large">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">Análisis de Horas Trabajadas</h3>
                  <p className="chart-card-subtitle">Resumen detallado de tu actividad semanal - Semana 12 de 2024</p>
                </div>
                <div className="header-actions">
                  <button className="btn-period active">Semanal</button>
                  <button className="btn-period">Mensual</button>
                  <button className="btn-export">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exportar
                  </button>
                </div>
              </div>

              <div className="chart-body-large">
                <div className="chart-bars-container-large">
                  {horasPorDia.map((dia, index) => (
                    <div
                      key={dia.dia}
                      className="chart-bar-wrapper-large"
                      onMouseEnter={() => setHoveredDia(dia.dia)}
                      onMouseLeave={() => setHoveredDia(null)}
                    >
                      {hoveredDia === dia.dia && (
                        <div className="chart-tooltip-large">
                          <div className="tooltip-header">
                            <strong>{dia.dia}</strong>
                          </div>
                          <div className="tooltip-body">
                            <span className="tooltip-hours">{dia.horas} horas</span>
                            <span className="tooltip-percentage">{((dia.horas / totalHoras) * 100).toFixed(1)}% del total</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="chart-bar-track-large">
                        <div 
                          className={`chart-bar-fill-large ${hoveredDia === dia.dia ? 'hovered' : ''}`}
                          style={{ 
                            height: `${(dia.horas / 10) * 100}%`,
                            background: `linear-gradient(180deg, ${dia.color}, ${dia.color}dd)`
                          }}
                        >
                          <div className="chart-bar-glow" style={{ background: dia.color }}></div>
                          <div className="chart-bar-shine"></div>
                        </div>
                      </div>
                      
                      <span className="chart-bar-label-large">{dia.dia}</span>
                      <span className="chart-bar-value-large">{dia.horas}h</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card-footer-large">
                <div className="chart-stats-large">
                  <div className="chart-stat-item-large">
                    <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                      <span className="chart-stat-icon-large">📊</span>
                    </div>
                    <div className="chart-stat-info-large">
                      <span className="chart-stat-label-large">Total Semanal</span>
                      <span className="chart-stat-value-large">{totalHoras} horas</span>
                    </div>
                  </div>
                  
                  <div className="chart-stat-separator-large"></div>
                  
                  <div className="chart-stat-item-large">
                    <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                      <span className="chart-stat-icon-large">📈</span>
                    </div>
                    <div className="chart-stat-info-large">
                      <span className="chart-stat-label-large">Promedio Diario</span>
                      <span className="chart-stat-value-large">{promedioDiario} horas</span>
                    </div>
                  </div>
                  
                  <div className="chart-stat-separator-large"></div>
                  
                  <div className="chart-stat-item-large">
                    <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                      <span className="chart-stat-icon-large">🎯</span>
                    </div>
                    <div className="chart-stat-info-large">
                      <span className="chart-stat-label-large">Meta Semanal</span>
                      <span className="chart-stat-value-large">40 horas</span>
                    </div>
                  </div>
                  
                  <div className="chart-stat-separator-large"></div>
                  
                  <div className="chart-stat-item-large">
                    <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)' }}>
                      <span className="chart-stat-icon-large">⭐</span>
                    </div>
                    <div className="chart-stat-info-large">
                      <span className="chart-stat-label-large">Día Más Productivo</span>
                      <span className="chart-stat-value-large">{diaMaxHoras}</span>
                    </div>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Progreso hacia la meta</span>
                    <span className="progress-value">{((totalHoras / 40) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${Math.min((totalHoras / 40) * 100, 100)}%` }}
                    >
                      <div className="progress-bar-glow"></div>
                    </div>
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