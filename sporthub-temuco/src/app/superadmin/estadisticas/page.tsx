'use client';

import React, { useState } from 'react';
import BarChart from '@/components/charts/BarChart';
import StatsCard from '@/components/charts/StatsCard';
import './estadisticas.css'; // Importar CSS compartido

export default function EstadisticasPage() {
  // Datos para las métricas principales
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
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Reportes y Análisis</h1>
        <button className="export-button">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar informe
        </button>
      </div>

      {/* Métricas principales */}
      <div className="stats-grid">
        <StatsCard
          title="Ingresos totales"
          value={`$${statsData[0].value.toLocaleString()}`}
          icon={<span className="text-3xl opacity-80">💰</span>}
          color="blue"
          className="stats-card-override"
        />
        <StatsCard
          title="Reservas totales"
          value={statsData[1].value.toString()}
          icon={<span className="text-3xl opacity-80">📅</span>}
          color="green"
          className="stats-card-override"
        />
        <StatsCard
          title="Ocupación Mensual"
          value={`${statsData[2].value}%`}
          icon={<span className="text-3xl opacity-80">📊</span>}
          color="purple"
          className="stats-card-override"
        />
        <StatsCard
          title="Valoración promedio"
          value={`${statsData[3].value}/5`}
          icon={<span className="text-3xl opacity-80">⭐</span>}
          color="blue"
          className="stats-card-override"
        />
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-background">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Reservas por día</h3>
            <BarChart 
              data={reservasPorDia} 
              primaryColor="#9fb5b8"
              animate={true}
              showValues={true}
              maxValue={40}
              className="px-2"
            />
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-background">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por deporte</h3>
            <BarChart 
              data={reservasPorDeporte} 
              primaryColor="#14b8a6"
              animate={true}
              showValues={true}
              maxValue={40}
              className="px-2"
            />
          </div>
        </div>
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
                  <th>Reservas</th>
                  <th>Ocupación</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {canchasPopulares.map((cancha, index) => (  
                  <tr key={index}>
                    <td>
                      <div className="admin-cell-title">
                        <div className="admin-avatar bg-emerald-100 text-emerald-800">
                          {cancha.nombre.charAt(0)}
                        </div>
                        {cancha.nombre}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-subtitle">{cancha.reservas}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        cancha.ocupacion > 80 ? 'status-activo' :
                        cancha.ocupacion > 50 ? 'status-por-revisar' :
                        'status-inactivo'
                      }`}>
                        {cancha.ocupacion}%
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-emerald-500 font-medium">+{index === 0 ? '12' : '8'}%</span>
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
                      <div className="admin-cell-title">
                        <div className="admin-avatar bg-blue-100 text-blue-800">
                          {horario.horario.charAt(0)}
                        </div>
                        {horario.horario}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-subtitle">{horario.reservas}</div>
                    </td>
                    <td>
                      <div className="admin-cell-text font-medium text-emerald-600">
                        ${horario.ingresos.toLocaleString('es-CL')}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-emerald-500 font-medium">+{index === 0 ? '15' : '10'}%</span>
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