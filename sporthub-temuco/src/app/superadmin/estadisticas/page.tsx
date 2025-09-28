'use client';

import BarChart from '@/components/charts/BarChart';
import StatsCard from '@/components/charts/StatsCard';
import styles from './estadisticas.module.css';

export default function EstadisticasPage() {
  // Datos para las métricas principales, luego vendrian de la API
  const statsData = [
    { label: 'Ingresos Totales', value: 500 },
    { label: 'Reservas Totales', value: 40 },
    { label: 'Ocupación Mensual', value: 95 },
    { label: 'Valoración Promedio', value: 4.7 }
  ];

  // Datos para el gráfico de barras - Reservas por día
  const reservasPorDia = [
    { label: 'Lun', value: 15 },
    { label: 'Mar', value: 25 },
    { label: 'Mié', value: 12 },
    { label: 'Jue', value: 30 },
    { label: 'Vie', value: 20 },
    { label: 'Sáb', value: 35 },
    { label: 'Dom', value: 18 }
  ];

  // Datos para el gráfico de barras - Reservas por deporte
  const reservasPorDeporte = [
    { label: 'Futbol', value: 35 },
    { label: 'Basquetbol', value: 25 },
    { label: 'Volleyball', value: 20 },
    { label: 'Tenis', value: 15 },
    { label: 'Padel', value: 5 }
  ];

  // Datos para la tabla de canchas populares
  const canchasPopulares = [
    { nombre: 'Cancha Central', reservas: 100, ocupacion: 92 },
    { nombre: 'Cancha Sur', reservas: 76, ocupacion: 85 }
  ];

  // Datos para la tabla de horarios populares
  const horariosPopulares = [
    { horario: 'Sábado 16:00-18:00', reservas: 42, ingresos: 126000 },
    { horario: 'Domingo 10:00-12:00', reservas: 38, ingresos: 114000 }
  ];

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
          value={`$${statsData[0].value.toLocaleString()}`}
          icon={<span className="text-3xl opacity-80">💰</span>}
          color="blue"
          className={styles.estadisticasCard}
        />
        <StatsCard
          title="Reservas totales"
          value={statsData[1].value.toString()}
          icon={<span className="text-3xl opacity-80">📅</span>}
          color="green"
          className={styles.estadisticasCard}
        />
        <StatsCard
          title="Ocupación Mensual"
          value={`${statsData[2].value}%`}
          icon={<span className="text-3xl opacity-80">📊</span>}
          color="purple"
          className={styles.estadisticasCard}
        />
        <StatsCard
          title="Valoración promedio"
          value={`${statsData[3].value}/5`}
          icon={<span className="text-3xl opacity-80">⭐</span>}
          color="blue"
          className={styles.estadisticasCard}
        />
      </div>

      {/* Gráficos */}
      <div className={styles.estadisticasChartsGrid}>
        <div className={styles.estadisticasChartContainer}>
          <div className={styles.estadisticasChartBackground}>
            <h3 className={styles.estadisticasTextLg + ' ' + styles.estadisticasFontSemibold + ' ' + styles.estadisticasTextGray900 + ' ' + styles.estadisticasMb6}>Reservas por día</h3>
            <BarChart 
              data={reservasPorDia} 
              primaryColor="#9fb5b8"
              animate={true}
              showValues={true}
              maxValue={40}
              className={styles.estadisticasPx2}
            />
          </div>
        </div>
        
        <div className={styles.estadisticasChartContainer}>
          <div className={styles.estadisticasChartBackground}>
            <h3 className={styles.estadisticasTextLg + ' ' + styles.estadisticasFontSemibold + ' ' + styles.estadisticasTextGray900 + ' ' + styles.estadisticasMb4}>Reservas por deporte</h3>
            <BarChart 
              data={reservasPorDeporte} 
              primaryColor="#14b8a6"
              animate={true}
              showValues={true}
              maxValue={40}
              className={styles.estadisticasPx2}
            />
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
                  <th>Reservas</th>
                  <th>Ocupación</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {canchasPopulares.map((cancha, index) => (  
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
                    <td>
                      <div className={styles.estadisticasFlex + ' ' + styles.estadisticasItemsCenter + ' ' + styles.estadisticasSpaceX1}>
                        <svg className={styles.estadisticasW5 + ' ' + styles.estadisticasH5 + ' ' + styles.estadisticasTextEmerald500} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className={styles.estadisticasTextEmerald500 + ' ' + styles.estadisticasFontMedium}>+{index === 0 ? '12' : '8'}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
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
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {horariosPopulares.map((horario, index) => (  
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
                    <td>
                      <div className={styles.estadisticasFlex + ' ' + styles.estadisticasItemsCenter + ' ' + styles.estadisticasSpaceX1}>
                        <svg className={styles.estadisticasW5 + ' ' + styles.estadisticasH5 + ' ' + styles.estadisticasTextEmerald500} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className={styles.estadisticasTextEmerald500 + ' ' + styles.estadisticasFontMedium}>+{index === 0 ? '15' : '10'}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}