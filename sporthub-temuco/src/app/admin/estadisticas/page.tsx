"use client";

import React, { useEffect, useState } from 'react';
import BarChart from '@/components/charts/BarChart';
import StatsCard from '@/components/charts/StatsCard';
import '../dashboard.css';
import { useEstadisticas } from '@/hooks/useEstadisticas';
import { adminService } from '@/services/adminService';

export default function EstadisticasPage() {
  const [complejoId, setComplejoId] = useState<number | null>(null);

  const {
    estadisticas,
    loadingEstadisticas,
    errorEstadisticas,
    reservasPorDia,
    loadingReservasDia,
    errorReservasDia,
    reservasPorCancha,
    loadingReservasCancha,
    errorReservasCancha,
    diasAnalisis,
    cambiarPeriodo,
    cargarTodo,
    isLoading,
    hasError
  } = useEstadisticas(complejoId);

  // Count canchas using the same admin endpoint to match the behavior of Admin Dashboard
  const [canchasCount, setCanchasCount] = useState<number | null>(null);

  useEffect(() => {
    const loadCanchasCount = async () => {
      try {
        const canchas = await adminService.getMisCanchas(100);
        setCanchasCount(Array.isArray(canchas) ? canchas.length : 0);
      } catch (err) {
        console.warn('⚠️ [Estadisticas] No se pudo cargar conteo de canchas admin:', err);
        setCanchasCount(null);
      }
    };

    loadCanchasCount();
  }, []);

  useEffect(() => {
    const loadComplejo = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const complejo = user.complejo_id || user.id_complejo || user.id_establecimiento;
          if (complejo) {
            setComplejoId(complejo);
            return;
          }
        }

        const misComplejos = await adminService.getMisComplejos();
        if (misComplejos && Array.isArray(misComplejos) && misComplejos.length > 0) {
          setComplejoId(misComplejos[0].id);
        }
      } catch (err) {
        console.warn('No se pudo obtener complejo del admin', err);
      }
    };

    loadComplejo();
  }, []);

  // Transformar datos para los charts
  // Filtrar solo canchas con al menos 1 reserva y limitar según tamaño de pantalla
  const [maxCanchas, setMaxCanchas] = useState<number>(10);

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      if (w <= 480) setMaxCanchas(3);
      else if (w <= 768) setMaxCanchas(4);
      else if (w <= 1024) setMaxCanchas(6);
      else setMaxCanchas(10);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const filteredCanchas = (reservasPorCancha?.canchas || []).filter((c: any) => Number(c?.total_reservas ?? 0) > 0);
  const visibleCanchas = filteredCanchas.slice(0, maxCanchas);
  const reservasPorCanchaData = visibleCanchas.map((c: any) => ({ label: c?.cancha_nombre || 'Sin nombre', value: Number(c?.total_reservas ?? 0) }));
  const reservasPorDiaData = (reservasPorDia?.dias || []).filter(Boolean).map((d: any) => ({ label: d?.dia_nombre || 'Sin nombre', value: Number(d?.total_reservas ?? 0) }));

  return (
    <div className="admin-dashboard-container">
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Estadísticas</h1>
        <div>
          <button className="export-button" onClick={() => cargarTodo()} disabled={isLoading}>Recargar</button>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '1rem' }}>Cargando estadísticas...</div>
      )}

      {hasError && (
        <div className="info-banner info-red">
          <div className="info-content">
            <h3 className="info-title">No se pudieron cargar estadísticas</h3>
              <p className="info-text">{errorEstadisticas || errorReservasDia || errorReservasCancha || 'Error desconocido'}</p>
              {(errorReservasDia || errorReservasCancha) && (
                <p className="info-text" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Si el mensaje indica datos incompletos, puede deberse a un fallo temporal del servicio de estadísticas; inténtalo nuevamente o contacta al equipo de backend para verificar el endpoint.
                </p>
              )}
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => cargarTodo()} className="btn-guardar">Reintentar</button>
            </div>
          </div>
        </div>
      )}

      {/* Si no está cargando y no hay estadísticas, avisar al usuario */}
      {!isLoading && !estadisticas && !hasError && (
        <div className="info-banner info-yellow">
          <div className="info-content">
            <h3 className="info-title">Estadísticas no disponibles</h3>
            <p className="info-text">A la espera del endpoint de estadísticas o datos del complejo. Si esto persiste, por favor verifica la conexión con el BFF/FASTAPI.</p>
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => cargarTodo()} className="btn-guardar">Reintentar</button>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatsCard title="Ocupación" value={estadisticas ? `${estadisticas.ocupacion_promedio?.toFixed(1)}%` : '—'} color="blue" icon={<span className="text-3xl opacity-80">📊</span>} />
        <StatsCard title="Reservas mes" value={estadisticas ? String(estadisticas.reservas_ultimo_mes || '-') : '-'} color="green" icon={<span className="text-3xl opacity-80">📅</span>} />
        <StatsCard title="Ingresos mes" value={estadisticas ? `$${(estadisticas.ingresos_ultimo_mes || 0).toLocaleString()}` : '-'} color="purple" icon={<span className="text-3xl opacity-80">💰</span>} />
        <StatsCard title="Canchas" value={canchasCount !== null ? String(canchasCount) : (estadisticas ? String(estadisticas.total_canchas || '-') : '-')} color="green" icon={<span className="text-3xl opacity-80">🏟️</span>} />
      </div>

      {canchasCount === 100 && (
        <div className="info-banner info-yellow">
          <div className="info-content">
            <h3 className="info-title">Nota: listado truncado</h3>
            <p className="info-text">Se están mostrando hasta 100 canchas por petición. Si esperabas ver más, revisa el endpoint o ajusta page_size en la API.</p>
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-background">
            <h3 className="text-lg font-semibold">Reservas por cancha</h3>
            <BarChart data={reservasPorCanchaData.length ? reservasPorCanchaData : [{ label: 'Sin datos', value: 0 }]} primaryColor="#9fb5b8" />
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-background">
            <h3 className="text-lg font-semibold">Reservas por día</h3>
            <BarChart data={reservasPorDiaData.length ? reservasPorDiaData : [{ label: 'Sin datos', value: 0 }]} primaryColor="#14b8a6" />
          </div>
        </div>
      </div>

      <div className="top-canchas-container">
        <h3 className="text-lg font-semibold mb-4">Top canchas</h3>
        <div className="top-canchas-grid">
          {filteredCanchas.length ? (
            // Mostrar TOP 4 solamente en la lista
            filteredCanchas.slice(0, 4).map((c: any, i: number) => (
              <div className="cancha-item" key={`${c.cancha_id ?? i}`}>{i + 1}.- {c.cancha_nombre} ({c.total_reservas})</div>
            ))
          ) : (
            <div>No hay datos de canchas</div>
          )}
        </div>
      </div>
    </div>
  );
}