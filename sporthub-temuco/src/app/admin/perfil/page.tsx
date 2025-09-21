'use client';

import React, { useState } from 'react';
import './perfiladmin.css';

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
    <div className="flex h-screen bg-gray-100">
      {/* Panel izquierdo */}
      <div className="admin-info">
        <div className="admin-avatar">
          <img
            src="https://www.svgrepo.com/show/382106/default-avatar.svg"
            alt="Foto del administrador"
            className="rounded-full shadow-md w-32 h-32 bg-gray-200"
          />
        </div>

        <h2 className="text-xl font-bold mt-2">Administrador</h2>
        <p className="admin-role text-amber-800">Administrador</p>

        <div className="admin-details">
          <div className="flex justify-between">
            <span className="font-semibold">Teléfono:</span>
            <span>+569 12345656</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Correo:</span>
            <span>admin@gmail.com</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Edad:</span>
            <span>41</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Área:</span>
            <span>Reservas</span>
          </div>
        </div>

        <button className="btn-editar hover:opacity-90 transition">
          Editar Perfil
        </button>
      </div>

      {/* Panel derecho */}
      <div className="admin-content">
        <div className="admin-header">
          <h2 className="admin-title">Información para el Administrador</h2>
          <div className="admin-placeholder" />
        </div>

        <div className="grafico-espacio-vacio" />

        <div className="grafico-box">
          <h3 className="text-lg font-semibold">Gráfico de Horas Semanales</h3>
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
                  style={{ height: `${dia.horas * 10}px` }}
                >
                  {hoveredDia === dia.dia && (
                    <div className="tooltip">{dia.horas}h</div>
                  )}
                </div>
                <span>{dia.dia}</span>
              </div>
            ))}
          </div>

          <div className="grafico-footer">
            <p className="semana-label">Semana: 12</p>
            <button className="btn-excel hover:opacity-90 transition">
              Generar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
