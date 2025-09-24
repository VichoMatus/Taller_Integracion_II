'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import StatsCard from '@/components/charts/StatsCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import ChartCard from '@/components/charts/ChartCard';
import './estadisticas.css';

export default function EstadisticasPage() {
  // Datos de ejemplo - En producción vendrían de una API
  const statsData = {
    ingresosTotales: 500,
    reservasTotales: 40,
    ocupacionMensual: 12,
    valoracionPromedio: 4.7,
    reservasPorDia: [
      { dia: 'Lunes', cantidad: 15 },
      { dia: 'Martes', cantidad: 20 },
      { dia: 'Miércoles', cantidad: 10 },
      { dia: 'Jueves', cantidad: 25 },
      { dia: 'Viernes', cantidad: 18 },
      { dia: 'Sábado', cantidad: 35 },
      { dia: 'Domingo', cantidad: 12 }
    ],
    reservasPorDeporte: [
      { deporte: 'Fútbol', porcentaje: 35 },
      { deporte: 'Basquetbol', porcentaje: 25 },
      { deporte: 'Volleyball', porcentaje: 20 },
      { deporte: 'Tenis', porcentaje: 15 },
      { deporte: 'Pádel', porcentaje: 5 }
    ],
    canchasPopulares: [
      { nombre: 'Cancha Central', reservas: 100, ocupacion: '92%' },
      { nombre: 'Cancha Sur', reservas: 76, ocupacion: '85%' },
    ],
    horariosPopulares: [
      { horario: 'Sábado 16:00-18:00', reservas: 42, ingresos: '$126,000' },
      { horario: 'Domingo 10:00-12:00', reservas: 38, ingresos: '$114,000' },
    ]
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h1>Panel de Reportes y Análisis</h1>
        <Button variant="secondary" className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Exportar Informe</span>
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="stats-grid">
        <StatsCard
          title="Ingresos totales"
          value={`$${statsData.ingresosTotales}`}
          icon="💰"
        />
        <StatsCard
          title="Reservas totales"
          value={statsData.reservasTotales.toString()}
          icon="📅"
        />
        <StatsCard
          title="Ocupación Mensual"
          value={`${statsData.ocupacionMensual}%`}
          icon="📊"
        />
        <StatsCard
          title="Valoración promedio"
          value={`${statsData.valoracionPromedio}/5`}
          icon="⭐"
        />
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <ChartCard title="Reservas por día">
          <LineChart
            data={statsData.reservasPorDia.map(item => ({
              label: item.dia,
              value: item.cantidad
            }))}
          />
        </ChartCard>
        <ChartCard title="Reservas por deporte">
          <PieChart
            data={statsData.reservasPorDeporte.map(item => ({
              label: item.deporte,
              value: item.porcentaje,
              color: `#${Math.floor(Math.random()*16777215).toString(16)}`
            }))}
            donut
            centerText="Total"
            centerValue={statsData.reservasPorDeporte.reduce((acc, curr) => acc + curr.porcentaje, 0)}
          />
        </ChartCard>
      </div>

      {/* Tablas de datos */}
      <div className="data-tables-grid">
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">Canchas más populares</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cancha</th>
                  <th>Reservas totales</th>
                  <th>Ocupación</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {statsData.canchasPopulares.map((cancha, index) => (
                  <tr key={index}>
                    <td>
                      <div className="admin-cell-title">
                        <div className="admin-avatar bg-emerald-100 text-emerald-800">
                          {cancha.nombre[0]}
                        </div>
                        {cancha.nombre}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-subtitle">{cancha.reservas} reservas</div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        parseInt(cancha.ocupacion) > 80 ? 'status-activo' :
                        parseInt(cancha.ocupacion) > 50 ? 'status-por-revisar' :
                        'status-inactivo'
                      }`}>
                        {cancha.ocupacion}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-emerald-500 font-medium">+12%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">Horarios más solicitados</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Reservas</th>
                  <th>Ingresos</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {statsData.horariosPopulares.map((horario, index) => (
                  <tr key={index}>
                    <td>
                      <div className="admin-cell-title">
                        <div className="admin-avatar bg-blue-100 text-blue-800">
                          {horario.horario.split(' ')[0][0]}
                        </div>
                        {horario.horario}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-subtitle">{horario.reservas} reservas</div>
                    </td>
                    <td>
                      <div className="admin-cell-text font-medium text-emerald-600">{horario.ingresos}</div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-emerald-500 font-medium">+8%</span>
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
