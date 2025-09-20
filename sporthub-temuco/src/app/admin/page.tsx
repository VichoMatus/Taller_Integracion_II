'use client';

import './dashboard.css';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard-container">
      {/* Grid de estadísticas principales */}
      <div className="stats-grid">
        {/* Tarjeta Canchas */}
        <div className="stats-card">
          <span className="stats-card-icon">🏠</span>
          <div className="stats-card-value">25</div>
          <div className="stats-card-title">Canchas</div>
        </div>
        
        {/* Tarjeta Reservas */}
        <div className="stats-card">
          <span className="stats-card-icon">📅</span>
          <div className="stats-card-value">180</div>
          <div className="stats-card-title">Reservas</div>
        </div>
        
        {/* Tarjeta Estadísticas */}
        <div className="stats-card">
          <span className="stats-card-icon">📈</span>
          <div className="stats-card-value">Estadísticas</div>
          <a href="/admin/estadisticas" className="stats-card-link">
            Click para ver estadísticas
          </a>
        </div>
        
        {/* Tarjeta Reseñas */}
        <div className="stats-card">
          <span className="stats-card-icon">👥</span>
          <div className="stats-card-value">Reseñas</div>
          <a href="/admin/resenas" className="stats-card-link">
            Click para ver reseñas
          </a>
        </div>
      </div>

      {/* Grid de secciones de gestión lado a lado */}
      <div className="management-sections-grid">
        {/* Sección Gestionar Canchas */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Canchas</h2>
            <button className="section-view-all">Ver todo</button>
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
                <td>Cancha Central</td>
                <td><span className="status-badge status-active">Activo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Cancha Norte</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
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

        {/* Sección Gestionar Reservas */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Reservas</h2>
            <button className="section-view-all">Ver todo</button>
          </div>
          
          <table className="management-table">
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
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Ana Castro</td>
                <td>Cancha Norte</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
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

      {/* Sección Reseñas Recientes */}
      <div className="reviews-section">
        <h3>Reseñas Recientes</h3>
        <div className="review-item">
          <div className="review-content">
            Cancha Central: "Instalaciones Limpias" - 5 Estrellas
          </div>
          <div className="review-time">Hace 1 hora</div>
        </div>
        <div className="review-item">
          <div className="review-content">
            Cancha Central: "Instalaciones Limpias" - 5 Estrellas
          </div>
          <div className="review-time">Hace 1 hora</div>
        </div>
      </div>
    </div>
  );
}