'use client';

import React, { useState } from 'react';
// No importamos AdminLayout porque lo reemplazamos con nuestra propia implementación
// import AdminLayout from '../../components/layout/AdminLayout';
import StatsCard from '../../components/charts/StatsCard';
import CourtForm from '../../components/forms/CourtForm';
import ReservationForm from '../../components/forms/ReservationForm';
import './admin.css'; // Importamos el nuevo CSS

const AdminDashboard = () => {
  const [showCourtForm, setShowCourtForm] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);

  // Datos de ejemplo (en producción vendrían de tu API)
  const stats = {
    courts: 25,
    reservations: 180
  };

  const courts = [
    { id: '1', name: 'Cancha Central', status: 'Activo' as const },
    { id: '2', name: 'Cancha Norte', status: 'Inactivo' as const }
  ];

  const reservations = [
    { id: '1', user: 'Juan Pérez', court: 'Cancha Central', date: '2024-01-15', time: '14:00', status: 'Activo' as const },
    { id: '2', user: 'Ana Castro', court: 'Cancha Norte', date: '2024-01-15', time: '16:00', status: 'Inactivo' as const }
  ];

  const recentReviews = [
    { id: '1', court: 'Cancha Central', review: 'Instalaciones Limpias', rating: 5, time: 'Hace 1 hora' },
    { id: '2', court: 'Cancha Central', review: 'Instalaciones Limpias', rating: 5, time: 'Hace 1 hora' }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">SportHub</div>
          <div className="sidebar-role">Administrador</div>
        </div>
        
        <div className="sidebar-menu">
          <div className="sidebar-menu-item active">
            <span>📊</span>
            <span>Dashboard</span>
          </div>
          <div className="sidebar-menu-item">
            <span>📈</span>
            <span>Estadísticas</span>
          </div>
          <div className="sidebar-menu-item">
            <span>⭐</span>
            <span>Gestionar Reseñas</span>
          </div>
          <div className="sidebar-menu-item">
            <span>🏟️</span>
            <span>Gestionar Canchas</span>
          </div>
          <div className="sidebar-menu-item">
            <span>📅</span>
            <span>Gestionar Reservas</span>
          </div>
          <div className="sidebar-menu-item">
            <span>👤</span>
            <span>Perfil</span>
          </div>
        </div>
        
        <div className="sidebar-logout">
          <div className="sidebar-menu-item">
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="welcome-message">
            Bienvenido, Administrador.
          </div>
          
          <div className="header-right">
            <div className="search-bar">
              <input type="text" placeholder="Buscar" />
              <button>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
            
            <div className="user-menu">
              <button className="user-menu-button">
                <div className="user-avatar">A</div>
                <span className="user-name">Admin</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">🏠</div>
            <div className="stats-value">25</div>
            <div className="stats-title">Canchas</div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">📅</div>
            <div className="stats-value">180</div>
            <div className="stats-title">Reservas</div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">📈</div>
            <div className="stats-title">Estadísticas</div>
            <div className="stats-link">Click para ver estadísticas</div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">⭐</div>
            <div className="stats-title">Reseñas</div>
            <div className="stats-link">Click para ver reseñas</div>
          </div>
        </div>
        
        {/* Gestionar Canchas */}
        <div className="management-section">
          <div className="section-header">
            <div className="section-title">Gestionar Canchas</div>
            <div className="view-all-link">Ver todo</div>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cancha Central</td>
                <td><span className="status-badge status-active">Activo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Cancha Norte</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Gestionar Reservas */}
        <div className="management-section">
          <div className="section-header">
            <div className="section-title">Gestionar Reservas</div>
            <div className="view-all-link">Ver todo</div>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cancha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Juan Pérez</td>
                <td>Cancha Central</td>
                <td><span className="status-badge status-active">Activo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Ana Castro</td>
                <td>Cancha Norte</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Reseñas Recientes */}
        <div className="reviews-section">
          <div className="section-header">
            <div className="section-title">Reseñas Recientes</div>
          </div>
          
          <div className="review-item">
            <div className="review-title">Cancha Central: "Instalaciones Limpias" - 5 Estrellas</div>
            <div className="review-time">Hace 1 hora</div>
          </div>
          
          <div className="review-item">
            <div className="review-title">Cancha Central: "Instalaciones Limpias" - 5 Estrellas</div>
            <div className="review-time">Hace 1 hora</div>
          </div>
        </div>

  {/* Footer global ya está en app/layout.tsx */}
      </div>
    </div>
  );
};

export default AdminDashboard;