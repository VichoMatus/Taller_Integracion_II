'use client';

import React, { useState } from 'react';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import StatsCard from '@/components/charts/StatsCard';
import '../dashboard.css'; // Importar CSS compartido

export default function EstadisticasPage() {
  // Datos para el gráfico de barras - Reservas por cancha
  const reservasPorCancha = [
    { label: 'Central', value: 40 },
    { label: 'Norte', value: 30 },
    { label: 'Sur', value: 20 },
    { label: 'Este', value: 35 },
    { label: 'Oeste', value: 15 }
  ];

  // Datos para el gráfico de líneas - Reservas por día
  const reservasPorDia = [
    { label: 'Lunes', value: 0 },
    { label: 'Martes', value: 25 },
    { label: 'Miércoles', value: 12 },
    { label: 'Jueves', value: 30 },
    { label: 'Viernes', value: 20 },
    { label: 'Sábado', value: 25 },
    { label: 'Domingo', value: 15 }
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Estadísticas Generales</h1>
        <button className="export-button">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar informe
        </button>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="stats-grid">
        <StatsCard
          title="Ocupación Mensual"
          value="95%"
          icon={<span className="text-3xl opacity-80">�</span>}
          color="blue"
          className="stats-card-override"
        />
        
        <StatsCard
          title="Reservas canceladas"
          value="25"
          icon={<span className="text-3xl opacity-80">❌</span>}
          color="red"
          className="stats-card-override"
        />
        
        <StatsCard
          title="Total usuarios"
          value="25"
          icon={<span className="text-3xl opacity-80">👥</span>}
          color="purple"
          className="stats-card-override"
        />
        
        <StatsCard
          title="Total canchas"
          value="25"
          icon={<span className="text-3xl opacity-80">🏟️</span>}
          color="green"
          className="stats-card-override"
        />
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Gráfico de barras - Reservas por cancha */}
        <div className="chart-container">
          <div className="chart-background">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Reservas por cancha (Último mes)</h3>
            <BarChart 
              data={reservasPorCancha}
              primaryColor="#9fb5b8"
              animate={true}
              showValues={true}
              maxValue={40}
              className="px-2"
            />
          </div>
        </div>
        
        {/* Gráfico de líneas - Reservas por día */}
        <div className="chart-container">
          <div className="chart-background">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por día</h3>
            <LineChart 
              data={reservasPorDia}
              maxValue={40}
              lineColor="#14b8a6"
              pointColor="#14b8a6"
              animate={true}
              showPoints={true}
              gridLines={true}
            />
          </div>
        </div>
      </div>

      {/* Top Canchas más activas */}
      <div className="top-canchas-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Canchas más activas</h3>
        <div className="top-canchas-grid">
          <div className="space-y-2">
            <div className="cancha-item">1.- Cancha Norte</div>
            <div className="cancha-item">2.- Cancha Pataping bong bing</div>
          </div>
          <div className="space-y-2">
            <div className="cancha-item">3.- Hola soy un texto de prueba...</div>
            <div className="cancha-item">4.- Hola soy un texto de prueba...</div>
          </div>
        </div>
      </div>
    </div>
  );
}