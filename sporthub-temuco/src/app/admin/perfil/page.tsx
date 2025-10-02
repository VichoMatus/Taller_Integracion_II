'use client';

import React, { useState } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';

export default function PerfilAdministrador() {
  const horasPorDia = [
    { dia: 'Lunes', horas: 6 },
    { dia: 'Martes', horas: 7 },
    { dia: 'Miércoles', horas: 5 },
    { dia: 'Jueves', horas: 8 },
    { dia: 'Viernes', horas: 4 },
    { dia: 'Sábado', horas: 2 },
    { dia: 'Domingo', horas: 0 },
  ];

  const [hoveredDia, setHoveredDia] = useState<string | null>(null);

  return (
    <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="admin-layout">
        
        {/* Panel Izquierdo */}
        <div className="admin-info">
          <div className="admin-avatar">
            <img src="https://placedog.net/200/200?id=12" alt="Foto de perfil" className="avatar-img"/>
          </div>

          <h2 className="admin-nombre">Administrador</h2>
          <p className="admin-role">Administrador</p>

          <div className="admin-details">
            <div className="admin-detail-row">
              <span className="detail-label">Número Telefónico:</span>
              <span className="detail-value">+569 12098456</span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-label">Correo:</span>
              <span className="detail-value">Admin@gmail.com</span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-label">Edad:</span>
              <span className="detail-value">41</span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-label">Encargado:</span>
              <span className="encargado-text">Reservas</span>
            </div>
          </div>

          <button className="btn-editar">Editar Perfil</button>
        </div>

        {/* Panel Derecho */}
        <div className="admin-content">
          <div className="admin-header">
            <h2 className="admin-title">Panel del Administrador</h2>
          </div>

          {/* Gráfico de Horas */}
          <div className="grafico-box">
            <h3 className="grafico-title">Gráfico de Horas Semanales</h3>

            <div className="grafico-barras">
              {horasPorDia.map((dia) => (
                <div
                  key={dia.dia}
                  className="barra-item"
                  onMouseEnter={() => setHoveredDia(dia.dia)}
                  onMouseLeave={() => setHoveredDia(null)}
                >
                  <div
                    className="barra"
                    style={{
                      height: `${dia.horas * 10}px`,
                      backgroundColor:
                        hoveredDia === dia.dia ? '#ffb347' : '#5a6993',
                    }}
                  >
                    {hoveredDia === dia.dia && (
                      <div className="tooltip">{dia.horas}h</div>
                    )}
                  </div>
                  <span className="dia-label">{dia.dia}</span>
                </div>
              ))}
            </div>

            <div className="grafico-footer">
              <p className="semana-label">Semana: 12</p>
              <button className="btn-excel">Generar Excel</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
