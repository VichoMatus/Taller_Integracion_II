'use client';

import React, { useState } from 'react';
import StatsCard, { CardColor } from '@/components/charts/StatsCard';
import ChartCard from '@/components/charts/ChartCard';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import AdminLayout from '@/components/layout/AdminLayout';

// Interfaz para las estadísticas
interface StatData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: CardColor;
}

export default function EstadisticasPage() {
  // Estado para el selector de período
  const [period, setPeriod] = useState('month');

  // Datos para las estadísticas
  const statsData: StatData[] = [
    {
      title: 'Reservas totales',
      value: '845',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      trend: { value: 12.5, isPositive: true },
      color: 'blue'
    },
    {
      title: 'Canchas activas',
      value: '28',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      trend: { value: 4.2, isPositive: true },
      color: 'green'
    },
    {
      title: 'Ingresos mensuales',
      value: '$1,246,350',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: 8.1, isPositive: true },
      color: 'purple'
    },
    {
      title: 'Reservas canceladas',
      value: '32',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      trend: { value: 2.8, isPositive: false },
      color: 'red'
    }
  ];

  // Datos para el gráfico de barras
  const barChartData = [
    { label: 'Lun', value: 45 },
    { label: 'Mar', value: 62 },
    { label: 'Mié', value: 58 },
    { label: 'Jue', value: 71 },
    { label: 'Vie', value: 89 },
    { label: 'Sáb', value: 115 },
    { label: 'Dom', value: 76 }
  ];

  // Datos para el gráfico circular
  const pieChartData = [
    { label: 'Fútbol', value: 45, color: '#3B82F6' },  // blue-500
    { label: 'Tenis', value: 25, color: '#10B981' },   // green-500
    { label: 'Basketball', value: 15, color: '#EF4444' }, // red-500
    { label: 'Volleyball', value: 10, color: '#8B5CF6' }, // purple-500
    { label: 'Otros', value: 5, color: '#F59E0B' }     // amber-500
  ];

  return (
    <AdminLayout>
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Estadísticas</h1>
          
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border ${period === 'week' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} rounded-l-lg`}
              onClick={() => setPeriod('week')}
            >
              Semana
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-t border-b ${period === 'month' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setPeriod('month')}
            >
              Mes
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border ${period === 'year' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} rounded-r-lg`}
              onClick={() => setPeriod('year')}
            >
              Año
            </button>
          </div>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
            />
          ))}
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard 
            title="Reservas por día de la semana" 
            subtitle="Últimos 30 días"
          >
            <BarChart 
              data={barChartData}
              primaryColor="bg-blue-500"
              secondaryColor="bg-blue-100"
              showValues={true}
              animate={true}
            />
          </ChartCard>
          
          <ChartCard 
            title="Distribución por deporte" 
            subtitle="Basado en reservas totales"
          >
            <PieChart 
              data={pieChartData}
              showLegend={true}
              showPercentages={true}
              donut={true}
              centerText="Total"
              centerValue="845"
            />
          </ChartCard>
        </div>
        
        {/* Estadísticas adicionales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rendimiento mensual</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa de ocupación</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crecimiento</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { mes: 'Enero', reservas: 720, ingresos: '$1,102,450', ocupacion: '72%', crecimiento: '+8.5%' },
                  { mes: 'Febrero', reservas: 765, ingresos: '$1,154,320', ocupacion: '78%', crecimiento: '+6.2%' },
                  { mes: 'Marzo', reservas: 792, ingresos: '$1,201,980', ocupacion: '81%', crecimiento: '+3.5%' },
                  { mes: 'Abril', reservas: 845, ingresos: '$1,246,350', ocupacion: '86%', crecimiento: '+6.7%' }
                ].map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.mes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reservas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ingresos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ocupacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{item.crecimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
