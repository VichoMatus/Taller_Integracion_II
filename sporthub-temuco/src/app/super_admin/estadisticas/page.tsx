'use client';

import { useEffect, useState } from 'react';
import BarChart from '@/components/charts/BarChart';
import StatsCard from '@/components/charts/StatsCard';
import { useEstadisticasSuperAdmin } from '@/hooks/useEstadisticasSuperAdmin';
import styles from './estadisticas.module.css';

export default function EstadisticasPage() {
  const { estadisticas, isLoading, error, cargarEstadisticas } = useEstadisticasSuperAdmin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      cargarEstadisticas();
    }
  }, [mounted, cargarEstadisticas]);

  // Transformar datos para los gráficos
  const reservasPorDia = estadisticas?.reservas_por_dia?.map(item => ({
    label: item.dia_semana.substring(0, 3),
    value: item.cantidad_reservas
  })) || [];

  const reservasPorDeporte = estadisticas?.reservas_por_deporte?.map(item => ({
    label: item.deporte,
    value: item.cantidad_reservas
  })) || [];

  const canchasPopulares = estadisticas?.top_canchas?.map(item => ({
    nombre: item.cancha_nombre,
    complejo: item.complejo_nombre,
    reservas: item.cantidad_reservas,
    ocupacion: item.ocupacion_porcentaje
  })) || [];

  const horariosPopulares = estadisticas?.top_horarios?.map(item => ({
    horario: `${item.dia_semana} ${item.hora_inicio}`,
    reservas: item.cantidad_reservas,
    ingresos: item.ingresos
  })) || [];

  // Mostrar error si hay
  if (error) {
    return (
      <div className={styles.estadisticasPage}>
        <div style={{ padding: '20px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            El endpoint de estadísticas aún no está implementado en el backend. 
            Las estadísticas estarán disponibles una vez que se implemente el endpoint 
            <code>/super_admin/estadisticas/completas</code>.
          </p>
        </div>
        <button 
          onClick={() => cargarEstadisticas()}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.estadisticasPage}>
      {/* Header */}
      <div className={styles.estadisticasHeader}>
        <h1 className={styles.estadisticasTitle}>Panel de Reportes y Análisis</h1>
        <button className={styles.estadisticasExportBtn}>
          <svg className={styles.estadisticasW4 + ' ' + styles.estadisticasH4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar informe
        </button>
      </div>

      {/* Métricas principales */}
      <div className={styles.estadisticasStatsGrid}>
        <StatsCard
          title="Ingresos totales"
          value={estadisticas?.metricas_mensuales?.ganancias_mes 
            ? `$${estadisticas.metricas_mensuales.ganancias_mes.toLocaleString()}` 
            : '$0'}
          emoji="💰"
          icon={<span className="text-3xl opacity-80">💰</span>}
          color="blue"
          className={styles.estadisticasCard}
          loading={isLoading}
        />
        <StatsCard
          title="Reservas totales"
          value={estadisticas?.metricas_mensuales?.reservas_totales_mes || 0}
          emoji="📅"
          icon={<span className="text-3xl opacity-80">📅</span>}
          color="green"
          className={styles.estadisticasCard}
          loading={isLoading}
        />
        <StatsCard
          title="Ocupación Mensual"
          value={estadisticas?.metricas_mensuales?.ocupacion_mensual 
            ? `${estadisticas.metricas_mensuales.ocupacion_mensual}%` 
            : '0%'}
          emoji="📊"
          icon={<span className="text-3xl opacity-80">📊</span>}
          color="purple"
          className={styles.estadisticasCard}
          loading={isLoading}
        />
        <StatsCard
          title="Valoración promedio"
          value={estadisticas?.metricas_mensuales?.valoracion_promedio 
            ? `${estadisticas.metricas_mensuales.valoracion_promedio.toFixed(1)}/5` 
            : '0/5'}
          emoji="⭐"
          icon={<span className="text-3xl opacity-80">⭐</span>}
          color="yellow"
          className={styles.estadisticasCard}
          loading={isLoading}
        />
      </div>

      {/* Gráficos */}
      <div className={styles.estadisticasChartsGrid}>
        <div className={styles.estadisticasChartContainer}>
          <div className={styles.estadisticasChartBackground}>
            <h3 className={styles.estadisticasTextLg + ' ' + styles.estadisticasFontSemibold + ' ' + styles.estadisticasTextGray900 + ' ' + styles.estadisticasMb6}>Reservas por día</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : reservasPorDia.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No hay datos disponibles
              </div>
            ) : (
              <BarChart 
                data={reservasPorDia} 
                primaryColor="#9fb5b8"
                animate={true}
                showValues={true}
                maxValue={Math.max(...reservasPorDia.map(d => d.value)) + 5}
                className={styles.estadisticasPx2}
              />
            )}
          </div>
        </div>
        
        <div className={styles.estadisticasChartContainer}>
          <div className={styles.estadisticasChartBackground}>
            <h3 className={styles.estadisticasTextLg + ' ' + styles.estadisticasFontSemibold + ' ' + styles.estadisticasTextGray900 + ' ' + styles.estadisticasMb4}>Reservas por deporte</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : reservasPorDeporte.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No hay datos disponibles
              </div>
            ) : (
              <BarChart 
                data={reservasPorDeporte} 
                primaryColor="#14b8a6"
                animate={true}
                showValues={true}
                maxValue={Math.max(...reservasPorDeporte.map(d => d.value)) + 5}
                className={styles.estadisticasPx2}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tablas de datos */}
      <div className={styles.estadisticasTablesGrid}>
        <div className={styles.estadisticasTableContainer}>
          <div className={styles.estadisticasTableHeader}>
            <h2 className={styles.estadisticasTableTitle}>Canchas más populares</h2>
          </div>
          
          <div className={styles.estadisticasOverflowXAuto}>
            <table className={styles.estadisticasTable}>
              <thead>
                <tr>
                  <th>Cancha</th>
                  <th>Complejo</th>
                  <th>Reservas</th>
                  <th>Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : canchasPopulares.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  canchasPopulares.map((cancha, index) => (  
                    <tr key={index}>
                      <td>
                        <div className={styles.estadisticasCellTitle}>
                          <div className={styles.estadisticasAvatar + ' ' + styles.estadisticasTextEmerald800} style={{backgroundColor: '#dcfce7'}}>
                            {cancha.nombre.charAt(0)}
                          </div>
                          {cancha.nombre}
                        </div>
                      </td>
                      <td>
                        <div className={styles.estadisticasCellSubtitle}>{cancha.complejo}</div>
                      </td>
                      <td>
                        <div className={styles.estadisticasCellSubtitle}>{cancha.reservas}</div>
                      </td>
                      <td>
                        <span className={`${styles.estadisticasStatusBadge} ${
                          cancha.ocupacion > 80 ? styles.estadisticasStatusActivo :
                          cancha.ocupacion > 50 ? styles.estadisticasStatusPorRevisar :
                          styles.estadisticasStatusInactivo
                        }`}>
                          {cancha.ocupacion}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.estadisticasTableContainer}>
          <div className={styles.estadisticasTableHeader}>
            <h2 className={styles.estadisticasTableTitle}>Horarios más solicitados</h2>
          </div>
          
          <div className={styles.estadisticasOverflowXAuto}>
            <table className={styles.estadisticasTable}>
              <thead>
                <tr>
                  <th>Horarios</th>
                  <th>Reservas</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : horariosPopulares.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  horariosPopulares.map((horario, index) => (  
                    <tr key={index}>
                      <td>
                        <div className={styles.estadisticasCellTitle}>
                          <div className={styles.estadisticasAvatar} style={{backgroundColor: '#dbeafe', color: '#1e40af'}}>
                            {horario.horario.charAt(0)}
                          </div>
                          {horario.horario}
                        </div>
                      </td>
                      <td>
                        <div className={styles.estadisticasCellSubtitle}>{horario.reservas}</div>
                      </td>
                      <td>
                        <div className={styles.estadisticasCellText + ' ' + styles.estadisticasFontMedium + ' ' + styles.estadisticasTextEmerald600}>
                          ${horario.ingresos.toLocaleString('es-CL')}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}