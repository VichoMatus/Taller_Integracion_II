'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/charts/StatsCard';
import { useEffect, useState, useRef } from 'react';
import { useEstadisticas } from '@/hooks/useEstadisticas';
import { formatearFecha, formatearHora } from '@/utils/reservaUtils';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminToast } from '@/components/admin/AdminToast';
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
  const { show } = useAdminToast();
  const [selectedComplejo, setSelectedComplejo] = useState<number | null>(null);
  const canchasTableRef = useRef<HTMLTableElement | null>(null);
  const reservasTableRef = useRef<HTMLTableElement | null>(null);
  const [rowsToShow, setRowsToShow] = useState<number>(4);

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

  useEffect(() => {
    // Measure visible rows for both tables and keep parity between panels; default to 4
    const measure = () => {
      try {
        const measureTableRows = (ref: React.RefObject<HTMLTableElement | null>) => {
          if (!ref.current) return 4;
          const tbody = ref.current.querySelector('tbody');
          if (!tbody) return 4;
          const firstRow = tbody.querySelector('tr');
          if (!firstRow) return 4;
          const tbodyHeight = (tbody as HTMLElement).clientHeight || 200;
          const rowHeight = (firstRow as HTMLElement).clientHeight || 40;
          const visible = Math.max(1, Math.floor(tbodyHeight / Math.max(1, rowHeight)));
          return visible;
        };

        const canchasVisible = measureTableRows(canchasTableRef);
        const reservasVisible = measureTableRows(reservasTableRef);
        const target = Math.max(4, Math.min(canchasVisible, reservasVisible || canchasVisible));
        setRowsToShow(target || 4);
      } catch (err) {
        setRowsToShow(4);
      }
    };

    // run after a tick in case content is rendering
    const t = setTimeout(measure, 50);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t); window.removeEventListener('resize', measure); };
  }, [state.data.canchas, state.data.reservas]);

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
          value={'Ver estadísticas'}
          icon={<span className="text-3xl opacity-80">📈</span>}
          color="purple"
          onClick={() => router.push('/admin/estadisticas')}
          subtitle="Click para ver estadísticas"
          className="stats-card-override"
          ariaLabel="Ir a estadísticas"
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

      {/* Reservas por cancha (rápido) — eliminado: dashboard simplificado */}

      {/* (Reservas recientes eliminado) */}

      {/* Grid de secciones de gestión lado a lado */}
      <div className="management-sections-grid">
        {/* Sección Gestionar Canchas */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Canchas</h2>
            <button className="section-view-all" onClick={handleVerTodoCanchas}>Ver todo</button>
          </div>
          
          <table className="management-table" ref={canchasTableRef}>
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
              </thead>
            <tbody>
              {state.data.canchas && state.data.canchas.length > 0 ? state.data.canchas.slice(0, rowsToShow).map((c, i) => (
                  <tr key={c.id ?? `cancha-${i}-${c.nombre}` }>
                  <td data-label="Nombre">{c.nombre}</td>
                  <td data-label="Estado"><span className={`status-badge ${c.activa ? 'status-active' : 'status-inactive'}`}>{c.activa ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEditarCancha(String(c.id))}>✏️</button>
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
          
          <table className="management-table" ref={reservasTableRef}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cancha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.data.reservas && state.data.reservas.length > 0 ? state.data.reservas.slice(0, rowsToShow).map((r, i) => (
                  <tr key={r.id ?? (r as any).reserva_id ?? (r as any).reservaId ?? `reserva-${i}`}>
                  <td data-label="Usuario">
                    <div className="admin-cell-title">
                      {(() => {
                          const user = (r as any).usuario;
                          if (user) return `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.email || `Usuario #${user.id || user.usuarioId}`;
                          // Formato nuevo de FastAPI
                          if ((r as any).usuarioNombre) return (r as any).usuarioNombre;
                          if (r.usuario_nombre && !r.usuario_nombre.startsWith('Usuario #')) return r.usuario_nombre;
                          return r.usuario_nombre || `Usuario #${r.usuario_id ?? (r as any).usuarioId ?? 'desconocido'}`;
                        })()}
                    </div>
                    {( (r as any).usuario?.email || (r as any).usuario_email) && (
                      <div className="admin-cell-subtitle">{(r as any).usuario?.email || (r as any).usuario_email}</div>
                    )}
                    { (r.fecha || (r as any).fechaInicio) && (
                      <div className="admin-cell-subtitle">{formatearFecha(r.fecha || (r as any).fechaInicio)} {formatearHora(r.hora_inicio || (r as any).horaInicio || (r as any).hora_inicio || '')}</div>
                    )}
                  </td>
                  <td data-label="Cancha">
                    <div className="admin-cell-subtitle">
                      {(() => {
                        const cancha = (r as any).cancha;
                        if (cancha) return cancha.nombre || cancha.name || `Cancha #${cancha.id ?? cancha.canchaId}`;
                        // Formato nuevo de FastAPI
                        if ((r as any).canchaNombre) return (r as any).canchaNombre;
                        if (r.cancha_nombre) return r.cancha_nombre;
                        return `Cancha #${r.cancha_id ?? (r as any).canchaId ?? 'desconocida'}`;
                      })()}
                    </div>
                    {((r as any).cancha?.tipo) && (
                      <div className="admin-cell-text" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{(r as any).cancha?.tipo}</div>
                    )}
                    {/* Precio eliminado del mini panel por petición del administrador */}
                  </td>
                  <td data-label="Estado"><span className={`status-badge ${r.estado === 'confirmada' ? 'status-active' : r.estado === 'pendiente' ? 'status-por-revisar' : 'status-inactive'}`}>{r.estado}</span></td>
                  <td>
                      <div className="action-buttons" data-label="Acciones">
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          const idToOpen = r.id ?? (r as any).reservaId ?? (r as any).reserva_id;
                          if (!idToOpen) {
                            console.warn('No reservation id for edit:', r);
                            show('error', 'No se pudo abrir la reserva: ID no disponible');
                            return;
                          }
                          handleEditarReserva(String(idToOpen));
                        }}
                      >✏️</button>
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