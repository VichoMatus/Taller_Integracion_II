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
        // Primero, recargar userData desde el backend para asegurar que tenemos complejo_id actualizado
        try {
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data) {
              // Actualizar localStorage con los datos más recientes
              localStorage.setItem('userData', JSON.stringify(data.data));
              
              const complejo = data.data.complejo_id || data.data.id_complejo || data.data.id_establecimiento;
              if (complejo) {
                console.log('✅ [Estadisticas] Complejo obtenido desde backend:', complejo);
                setComplejoId(complejo);
                return;
              }
            }
          }
        } catch (authErr) {
          console.warn('⚠️ [Estadisticas] No se pudo recargar userData desde backend:', authErr);
        }

        // Fallback: Intentar obtener el complejo del usuario desde localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const complejo = user.complejo_id || user.id_complejo || user.id_establecimiento;
          if (complejo) {
            console.log('✅ [Estadisticas] Complejo obtenido desde localStorage:', complejo);
            setComplejoId(complejo);
            return;
          }
        }

        // Si no hay complejo en userData, obtener el primer complejo del admin
        console.log('⚠️ [Estadisticas] No hay complejo en userData, obteniendo lista de complejos...');
        const misComplejos = await adminService.getMisComplejos();
        if (misComplejos && Array.isArray(misComplejos) && misComplejos.length > 0) {
          console.log('✅ [Estadisticas] Primer complejo obtenido:', misComplejos[0].id);
          setComplejoId(misComplejos[0].id);
          
          // Guardar el complejo_id en localStorage para la próxima vez
          const currentUserData = localStorage.getItem('userData');
          if (currentUserData) {
            const userData = JSON.parse(currentUserData);
            userData.complejo_id = misComplejos[0].id;
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        } else {
          console.warn('⚠️ [Estadisticas] No hay complejos disponibles para este admin');
        }
      } catch (err) {
        console.error('❌ [Estadisticas] Error al obtener complejo del admin:', err);
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

  // Filtrar canchas con reservas y preparar datos para gráfico
  const filteredCanchas = (reservasPorCancha?.canchas || [])
    .filter((c: any) => c && typeof c === 'object' && Number(c?.total_reservas ?? 0) > 0);
  
  const visibleCanchas = filteredCanchas.slice(0, maxCanchas);
  
  const reservasPorCanchaData = visibleCanchas.length > 0 
    ? visibleCanchas.map((c: any) => ({ 
        label: c?.cancha_nombre || 'Sin nombre', 
        value: Number(c?.total_reservas ?? 0) 
      }))
    : [{ label: 'Sin datos', value: 0 }];
  
  // Preparar datos de reservas por día
  const reservasPorDiaData = (reservasPorDia?.dias || [])
    .filter(d => d && typeof d === 'object')
    .map((d: any) => ({ 
      label: d?.dia_nombre || 'Sin nombre', 
      value: Number(d?.total_reservas ?? 0) 
    }));
  
  // Si no hay datos, mostrar mensaje
  const reservasPorDiaDataFinal = reservasPorDiaData.length > 0 
    ? reservasPorDiaData 
    : [{ label: 'Sin datos', value: 0 }];

  return (
    <div className="admin-dashboard-container">
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Estadísticas</h1>
        <div>
          <button className="export-button" onClick={() => cargarTodo()} disabled={isLoading}>Recargar</button>
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="info-banner info-blue">
          <div className="info-content">
            <h3 className="info-title">⏳ Cargando estadísticas...</h3>
            <p className="info-text">Por favor espera mientras se cargan los datos de tu complejo.</p>
          </div>
        </div>
      )}

      {/* Error al cargar estadísticas */}
      {hasError && !isLoading && (
        <div className="info-banner info-red">
          <div className="info-content">
            <h3 className="info-title">❌ Error al cargar estadísticas</h3>
            <p className="info-text">
              {errorEstadisticas || errorReservasDia || errorReservasCancha || 'No se pudieron obtener las estadísticas del complejo.'}
            </p>
            {!complejoId && (
              <p className="info-text" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <strong>Posible causa:</strong> No se pudo determinar tu complejo. Asegúrate de tener al menos un complejo registrado en el sistema.
              </p>
            )}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => window.location.reload()} className="btn-guardar">
                🔄 Recargar página
              </button>
              <button onClick={() => cargarTodo()} className="btn-cancelar" disabled={!complejoId}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sin complejo configurado */}
      {!isLoading && !hasError && !complejoId && (
        <div className="info-banner info-yellow">
          <div className="info-content">
            <h3 className="info-title">⚠️ Complejo no configurado</h3>
            <p className="info-text">
              No se pudo determinar tu complejo deportivo. Para ver estadísticas, necesitas tener al menos un complejo registrado.
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <button 
                onClick={() => window.location.href = '/admin/complejos'} 
                className="btn-guardar"
              >
                📝 Registrar Complejo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar estadísticas solo si hay datos válidos y no hay errores */}
      {!hasError && !isLoading && estadisticas && complejoId && (
        <div className="stats-grid">
          <StatsCard 
            title="Ocupación" 
            value={`${(estadisticas.ocupacion_promedio || 0).toFixed(1)}%`} 
            color="blue" 
            icon={<span className="text-3xl opacity-80">📊</span>} 
          />
          <StatsCard 
            title="Reservas mes" 
            value={String(estadisticas.reservas_confirmadas_ultimo_mes || 0)} 
            color="green" 
            icon={<span className="text-3xl opacity-80">📅</span>} 
          />
          <StatsCard 
            title="Ingresos mes" 
            value={`$${(estadisticas.ingresos_ultimo_mes || 0).toLocaleString()}`} 
            color="purple" 
            icon={<span className="text-3xl opacity-80">💰</span>} 
          />
          <StatsCard 
            title="Canchas" 
            value={String(canchasCount !== null ? canchasCount : (estadisticas.total_canchas || 0))} 
            color="green" 
            icon={<span className="text-3xl opacity-80">🏟️</span>} 
          />
        </div>
      )}

      {/* Mostrar advertencia si hay demasiadas canchas */}
      {!hasError && canchasCount === 100 && (
        <div className="info-banner info-yellow">
          <div className="info-content">
            <h3 className="info-title">⚠️ Nota: listado truncado</h3>
            <p className="info-text">Se están mostrando hasta 100 canchas por petición. Si esperabas ver más, contacta al administrador del sistema.</p>
          </div>
        </div>
      )}

      {/* Gráficos - Solo mostrar si hay datos válidos y no hay errores */}
      {!hasError && !isLoading && complejoId && (
        <>
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-background">
                <h3 className="text-lg font-semibold">📊 Reservas por cancha</h3>
                <BarChart 
                  data={reservasPorCanchaData} 
                  primaryColor="#9fb5b8" 
                  loading={loadingReservasCancha}
                  emptyMessage="No hay datos de reservas por cancha"
                />
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-background">
                <h3 className="text-lg font-semibold">📅 Reservas por día de la semana</h3>
                <BarChart 
                  data={reservasPorDiaDataFinal} 
                  primaryColor="#14b8a6"
                  loading={loadingReservasDia}
                  emptyMessage="No hay datos de reservas por día"
                />
              </div>
            </div>
          </div>

          <div className="top-canchas-container">
            <h3 className="text-lg font-semibold mb-4">🏆 Top Canchas con Más Reservas</h3>
            <div className="top-canchas-grid">
              {filteredCanchas.length > 0 ? (
                // Mostrar TOP 4 solamente en la lista
                filteredCanchas.slice(0, 4).map((c: any, i: number) => (
                  <div className="cancha-item" key={`${c.cancha_id ?? i}`}>
                    <span className="font-semibold">{i + 1}.</span> {c.cancha_nombre || 'Sin nombre'} 
                    <span className="text-gray-600"> ({c.total_reservas || 0} reservas)</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  {loadingReservasCancha ? 'Cargando...' : 'No hay datos de canchas con reservas en este período'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}