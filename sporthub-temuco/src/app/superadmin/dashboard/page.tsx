
'use client';

import React, { useState } from 'react';
import './superadmin.css';

const SuperAdminDashboard = () => {
  // Datos de ejemplo para el superadmin
  const stats = {
    totalUsers: 500,
    totalCourts: 40,
    totalAdmins: 12,
    todayReservations: 10
  };

  const admins = [
    { id: '1', name: 'Ana Lopez', status: 'Activo' as const, email: 'ana.lopez@example.com' },
    { id: '2', name: 'Admin123', status: 'Inactivo' as const, email: 'admin123@example.com' },
    { id: '3', name: 'Juan Carlos', status: 'Activo' as const, email: 'juan.carlos@example.com' }
  ];

  const users = [
    { id: '1', name: 'Juan Lopez', status: 'Activo' as const, email: 'juan.lopez@example.com' },
    { id: '2', name: 'Tlovixo', status: 'Inactivo' as const, email: 'tlovixo@example.com' },
    { id: '3', name: 'Patricio Saez', status: 'Por revisar' as const, email: 'patricio@example.com' }
  ];

  const courts = [
    { id: '1', name: 'Cancha Central', type: 'Futbol', status: 'Disponible' as const },
    { id: '2', name: 'Cancha Sur', type: 'Voleyball', status: 'Mantenimiento' as const },
    { id: '3', name: 'Cancha Norte', type: 'Futbol', status: 'Disponible' as const }
  ];

  return (
    <div className="superadmin-content">
      {/* Header con mensaje de bienvenida */}
      <div className="welcome-header">
        <h1>Bienvenido, Superadministrador</h1>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon">👥</div>
          <div className="stats-value">{stats.totalUsers}</div>
          <div className="stats-title">Usuarios Totales</div>
          <div className="stats-percentage">+50%</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">🏟️</div>
          <div className="stats-value">{stats.totalCourts}</div>
          <div className="stats-title">Canchas Registradas</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">👤</div>
          <div className="stats-value">{stats.totalAdmins}</div>
          <div className="stats-title">Administradores</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">📅</div>
          <div className="stats-value">{stats.todayReservations}</div>
          <div className="stats-title">Reservas Hoy</div>
        </div>
      </div>

      {/* Sección de Gestión de Administradores */}
      <div className="management-section">
        <div className="section-header">
          <div className="section-title">Gestión Administradores</div>
          <div className="section-actions">
            <button className="btn-primary">Agregar</button>
            <button className="btn-link">Ver todo</button>
          </div>
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
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>
                  <div className="user-info">
                    <div className="user-name">{admin.name}</div>
                    <div className="user-email">{admin.email}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${admin.status.toLowerCase()}`}>
                    {admin.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" title="Editar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button" title="Eliminar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección de Gestión de Usuarios */}
      <div className="management-section">
        <div className="section-header">
          <div className="section-title">Gestión Usuarios</div>
          <div className="section-actions">
            <button className="btn-link">Ver todo</button>
          </div>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase().replace(' ', '-')}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" title="Editar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button" title="Eliminar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección de Gestión de Canchas */}
      <div className="management-section">
        <div className="section-header">
          <div className="section-title">Gestión de Canchas</div>
          <div className="section-actions">
            <button className="btn-primary">Agregar</button>
            <button className="btn-link">Ver todo</button>
          </div>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cancha</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court.id}>
                <td>{court.name}</td>
                <td>{court.type}</td>
                <td>
                  <span className={`status-badge status-${court.status.toLowerCase()}`}>
                    {court.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" title="Editar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="action-button" title="Eliminar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;