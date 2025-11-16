'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/charts/StatsCard';
import BarChart from '@/components/charts/BarChart';
import { useEffect, useState } from 'react';
import { useEstadisticas } from '@/hooks/useEstadisticas';
import { useAdmin } from '@/hooks/useAdmin';
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

  const { state, loadDashboard, loadMisReservas } = useAdmin();
  const [selectedComplejo, setSelectedComplejo] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      await loadDashboard();
      // Cargar reservas también para la vista rápida del dashboard
      await loadMisReservas();
    })();
  }, []);

  // Cuando se actualizan los complejos del state, auto-seleccionar el primer complejo para charts
  useEffect(() => {
    if (!selectedComplejo && state.data.complejos && state.data.complejos.length > 0) {
      setSelectedComplejo(state.data.complejos[0].id);
    }
  }, [state.data.complejos]);

  const { reservasPorCancha } = useEstadisticas(selectedComplejo);

  const { estadisticas } = state.data;

  return (
    <div className="admin-dashboard-container">
      {/* Grid de estadísticas principales */}
      <div className="stats-grid">
        {/* Tarjeta Canchas */}
        <StatsCard
          title="Canchas"
          value={String(state.data.canchas?.length || 0)}
          icon={<span className="text-3xl opacity-80">🏠</span>}
          color="blue"
          className="stats-card-override"
        />
        
        {/* Tarjeta Reservas */}
        <StatsCard
          title="Reservas"
          value={String(state.data.reservas?.length ?? state.data?.estadisticas?.reservas_mes ?? '-')}
          icon={<span className="text-3xl opacity-80">📅</span>}
          color="green"
          className="stats-card-override"
        />
        
        {/* Tarjeta Estadísticas */}
        <StatsCard
          title="Estadísticas"
          value={estadisticas ? `${estadisticas.ocupacion_promedio?.toFixed?.(1) ?? '-'}%` : 'Ver estadísticas'}
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

      {/* Quick Chart de Reservas por Cancha (primer complejo) */}
        <div style={{ marginTop: '1rem' }}>
        <h3 className="text-lg font-semibold">Reservas por cancha (rápido)</h3>
        <div style={{ marginTop: '0.75rem' }} className="chart-background">
          {(reservasPorCancha?.canchas || []).length > 0 ? (
            <BarChart
              data={(reservasPorCancha?.canchas || []).map((c: any) => ({ label: c.cancha_nombre || 'Sin nombre', value: Number(c.total_reservas || 0) }))}
              primaryColor="#9fb5b8"
            />
          ) : (
            <div className="text-gray-500">No hay datos para mostrar en Reservas por cancha.</div>
          )}
        </div>
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
              {state.data.canchas && state.data.canchas.length > 0 ? state.data.canchas.slice(0, 5).map((c, i) => (
                <tr key={c.id ?? `cancha-${i}-${c.nombre}` }>
                  <td>{c.nombre}</td>
                  <td><span className={`status-badge ${c.activa ? 'status-active' : 'status-inactive'}`}>{c.activa ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEditarCancha(String(c.id))}>✏️</button>
                      <button className="action-btn delete">🗑️</button>
                    </div>
                  </td>
                </tr>
                )) : (
                <tr key="no-canchas">
                  <td colSpan={3} className="text-gray-500">No hay canchas registradas</td>
                </tr>
              )}
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
              {state.data.reservas && state.data.reservas.length > 0 ? state.data.reservas.slice(0, 5).map((r, i) => (
                <tr key={r.id ?? `reserva-${i}-${r.usuario_id}` }>
                  <td>{r.usuario_nombre || `Usuario #${r.usuario_id}`}</td>
                  <td>{r.cancha_nombre || `Cancha #${r.cancha_id}`}</td>
                  <td><span className={`status-badge ${r.estado === 'confirmada' ? 'status-active' : r.estado === 'pendiente' ? 'status-por-revisar' : 'status-inactive'}`}>{r.estado}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEditarReserva(String(r.id))}>✏️</button>
                      <button className="action-btn delete">🗑️</button>
                    </div>
                  </td>
                </tr>
                )) : (
                <tr key="no-reservas">
                  <td colSpan={4} className="text-gray-500">No hay reservas recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reseñas recientes: eliminadas porque no hay endpoint estable */}
    </div>
  );
}