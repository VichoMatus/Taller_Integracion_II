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
        <ChartCard 
          title="Canchas más populares"
          className="panel-content"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statsData.canchasPopulares.map((cancha, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cancha.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cancha.reservas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cancha.ocupacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
        
        <ChartCard 
          title="Horarios más solicitados" 
          className="panel-content"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horarios</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statsData.horariosPopulares.map((horario, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horario.horario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horario.reservas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horario.ingresos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
