'use client';

import React, { useState } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';

export default function PerfilAdministrador() {
  const horasPorDia = [
    { dia: 'Lunes', horas: 6 },
    { dia: 'Martes', horas: 7 },
    { dia: 'Miércoles', horas: 5 },
    { dia: 'Jueves', horas: 8 },
    { dia: 'Viernes', horas: 4 },
    { dia: 'Sábado', horas: 2 },
    { dia: 'Domingo', horas: 0 },
  ];

  const [hoveredDia, setHoveredDia] = useState<string | null>(null);
  
  // Simulamos que no hay imagen para mostrar el avatar con inicial
  const userImage = null;
  const userName = "Administrador";
  
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="admin-container">
        
        {/* Panel Izquierdo - Perfil */}
        <div className="profile-card">
          <div className="avatar-container">
            {userImage ? (
              <img 
                src={userImage} 
                alt="Foto de perfil" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-default">
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
                <span className="detail-value">Admin@gmail.com</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Edad</span>
                <span className="detail-value">41 años</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Encargado de</span>
                <span className="detail-value highlight">Reservas y Gestión</span>
              </div>
            </div>
          </div>

          <button className="edit-button">
            Editar Perfil
          </button>
        </div>

        {/* Panel Derecho - Contenido */}
        <div className="content-panel">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Panel del Administrador</h1>
            <p className="dashboard-subtitle">Bienvenido de vuelta, aquí tienes tu resumen semanal</p>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Horas Trabajadas - Semana 12</h3>
            </div>

            <div className="chart-content">
              <div className="bars-container">
                {horasPorDia.map((dia) => (
                  <div
                    key={dia.dia}
                    className="bar-wrapper"
                    onMouseEnter={() => setHoveredDia(dia.dia)}
                    onMouseLeave={() => setHoveredDia(null)}
                  >
                    {hoveredDia === dia.dia && (
                      <div className="tooltip-content">
                        {dia.horas}h {dia.dia}
                      </div>
                    )}
                    
                    <div 
                      className={`bar ${hoveredDia === dia.dia ? 'bar-hover' : ''}`}
                      style={{ height: `${dia.horas * 12}px` }}
                    ></div>
                    
                    <span className="bar-label">{dia.dia.substring(0, 3)}</span>
                    <span className="bar-value">{dia.horas}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-footer">
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-label">Total Semanal: </span>
                  <span className="stat-value">32 horas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Promedio Diario: </span>
                  <span className="stat-value">4.6 horas</span>
                </div>
              </div>
              
              <button className="excel-button">
                Generar Reporte Excel
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">156</span>
                <span className="stat-text">Usuarios Activos</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">89%</span>
                <span className="stat-text">Eficiencia</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <span className="stat-number">32h</span>
                <span className="stat-text">Esta Semana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}