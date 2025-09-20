"use client";

import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/charts/StatsCard";
import "./dashboard.css";

export default function SuperAdminDashboard() {
  return (
    <div className="superadmin-dashboard-layout">
      <Sidebar userRole="superadmin" />
      <main className="superadmin-dashboard-main">
        <h1 className="dashboard-title">Bienvenido, Superadministrador</h1>
        <div className="dashboard-stats-grid">
          <StatsCard title="Usuarios Totales" value={500} icon={<span>👥</span>} color="blue" />
          <StatsCard title="Canchas Registradas" value={40} icon={<span>🏠</span>} color="green" />
          <StatsCard title="Administradores" value={12} icon={<span>🧑‍💼</span>} color="purple" />
          <StatsCard title="Reservas Hoy" value={10} icon={<span>📅</span>} color="yellow" />
        </div>
        <div className="dashboard-management-grid">
          {/* Gestión Administradores */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Gestión Administradores</h2>
              <button className="section-add-btn">➕ Agregar</button>
              <button className="section-view-btn">Ver todo</button>
            </div>
            <table className="dashboard-table">
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
                  <td><span className="badge badge-success">Activo</span></td>
                  <td>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
                <tr>
                  <td>Admin123</td>
                  <td><span className="badge badge-danger">Inactivo</span></td>
                  <td>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
                <tr>
                  <td>Juan Carlos</td>
                  <td><span className="badge badge-success">Activo</span></td>
                  <td>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          {/* Gestión Usuarios */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Gestión Usuarios</h2>
              <button className="section-view-btn">Ver todo</button>
            </div>
            <table className="dashboard-table">
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
                  <td><span className="badge badge-success">Activo</span></td>
                  <td>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
                <tr>
                  <td>Tiovixo</td>
                  <td><span className="badge badge-danger">Inactivo</span></td>
                  <td>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
                <tr>
                  <td>Patricio Saez</td>
                  <td><span className="badge badge-warning">Por revisar</span></td>
                  <td>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        {/* Gestión de Canchas */}
        <section className="dashboard-section dashboard-courts-section">
          <div className="section-header">
            <h2>Gestión de Canchas</h2>
            <button className="section-add-btn">➕ Agregar</button>
            <button className="section-view-btn">Ver todo</button>
          </div>
          <table className="dashboard-table">
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
                <td><span className="badge badge-success">Disponible</span></td>
                <td>
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </td>
              </tr>
              <tr>
                <td>Cancha Sur</td>
                <td>Volleyball</td>
                <td><span className="badge badge-warning">Mantenimiento</span></td>
                <td>
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
