'use client';

import { useRouter } from 'next/navigation';
import StatsCard from '@/components/charts/StatsCard';
import './dashboard.css';

export default function AdminDashboard() {
  const router = useRouter();

  // Función para navegar a la página de gestión de canchas
  const handleVerTodoCanchas = () => {
    router.push('/admin/canchas');
  };

  // Función para navegar a la página de gestión de reservas
  const handleVerTodoReservas = () => {
    router.push('/admin/reservas');
  };

  // Función para editar cancha específica
  const handleEditarCancha = (canchaId: string) => {
    router.push(`/admin/canchas/${canchaId}`);
  };

  // Función para editar reserva específica
  const handleEditarReserva = (reservaId: string) => {
    router.push(`/admin/reservas/${reservaId}`);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Grid de estadísticas principales */}
      <div className="stats-grid">
        {/* Tarjeta Canchas */}
        <StatsCard
          title="Canchas"
          value="25"
          icon={<span className="text-3xl opacity-80">🏠</span>}
          color="blue"
          className="stats-card-override"
        />
        
        {/* Tarjeta Reservas */}
        <StatsCard
          title="Reservas"
          value="180"
          icon={<span className="text-3xl opacity-80">📅</span>}
          color="green"
          className="stats-card-override"
        />
        
        {/* Tarjeta Estadísticas */}
        <StatsCard
          title="Estadísticas"
          value="Ver estadísticas"
          icon={<span className="text-3xl opacity-80">📈</span>}
          subtitle="Click para ver estadísticas"
          color="purple"
          onClick={() => window.location.href = '/admin/estadisticas'}
          className="stats-card-override"
        />
        
        {/* Tarjeta Reseñas */}
        <StatsCard
          title="Reseñas"
          value="Ver reseñas"
          icon={<span className="text-3xl opacity-80">👥</span>}
          subtitle="Click para ver reseñas"
          color="yellow"
          onClick={() => window.location.href = '/admin/resenas'}
          className="stats-card-override"
        />
      </div>

      {/* Grid de secciones de gestión lado a lado */}
      <div className="management-sections-grid">
        {/* Sección Gestionar Canchas */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Canchas</h2>
            <button className="section-view-all" onClick={handleVerTodoCanchas}>Ver todo</button>
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
                    <button className="action-btn edit" onClick={() => handleEditarCancha('cancha-central')}>✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Cancha Norte</td>
                <td><span className="status-badge status-inactive">Inactivo</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" onClick={() => handleEditarCancha('cancha-norte')}>✏️</button>
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
            <button className="section-view-all" onClick={handleVerTodoReservas}>Ver todo</button>
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
                    <button className="action-btn edit" onClick={() => handleEditarReserva('reserva-001')}>✏️</button>
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
                    <button className="action-btn edit" onClick={() => handleEditarReserva('reserva-002')}>✏️</button>
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