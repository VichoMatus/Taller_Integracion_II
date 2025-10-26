"use client";

import { useEffect, useState } from "react";
import StatsCard from '@/components/charts/StatsCard';

export default function SuperAdminDashboard() {
  // 🔥 AGREGAR VERIFICACIÓN DE CLIENTE
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 MOSTRAR LOADING HASTA QUE ESTÉ MONTADO EN EL CLIENTE
  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando panel de administración...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      
      {/* Grid de estadísticas principales */}
      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-card-icon">👥</span>
          <div className="stats-card-value">500</div>
          <div className="stats-card-title">Usuarios Totales</div>
        </div>
        
        <div className="stats-card">
          <span className="stats-card-icon">🏠</span>
          <div className="stats-card-value">40</div>
          <div className="stats-card-title">Canchas Registradas</div>
        </div>
        
        <div className="stats-card">
          <span className="stats-card-icon">🧑‍💼</span>
          <div className="stats-card-value">12</div>
          <div className="stats-card-title">Administradores</div>
        </div>
        
        <div className="stats-card">
          <span className="stats-card-icon">📅</span>
          <div className="stats-card-value">10</div>
          <div className="stats-card-title">Reservas Hoy</div>
        </div>
      </div>

      {/* Grid de secciones de gestión lado a lado */}
      <div className="management-sections-grid">
        {/* Sección Gestionar Administradores */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Administradores</h2>
            <div className="section-header-buttons">
              <button className="section-view-all">Agregar</button>
              <button className="section-view-all">Ver todo</button>
            </div>
          </div>
          
          <table className="management-table">
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ana Lopez</td>
                <td><span className="status-badge status-active">Activo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Admin123</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Juan Carlos</td>
                <td><span className="status-badge status-active">Activo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección Gestionar Usuarios */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Usuarios</h2>
            <div className="section-header-buttons">
              <button className="section-view-all">Agregar</button>
              <button className="section-view-all">Ver todo</button>
            </div>
          </div>
          
          <table className="management-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Juan Lopez</td>
                <td><span className="status-badge status-active">Activo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Tiovixo</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Patricio Saez</td>
                <td><span className="status-badge status-pending">Por revisar</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Gestión de Canchas */}
      <div className="management-section courts-section">
        <div className="section-header">
          <h2 className="section-title">Gestion de canchas</h2>
          <div className="section-header-buttons">
            <button className="section-view-all">Agregar</button>
            <button className="section-view-all">Ver todo</button>
          </div>
        </div>
        
        <table className="management-table">
          <thead>
            <tr>
              <th>Cancha</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cancha Central</td>
              <td>Futbol</td>
              <td><span className="status-badge status-active">Disponible</span></td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Cancha Sur</td>
              <td>Volleyball</td>
              <td><span className="status-badge status-maintenance">Mantenimiento</span></td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}