'use client';

import React, { useState } from 'react';
import './user.css';

export default function PerfilUsuario() {
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'informacion', label: 'Información del Usuario' },
    { id: 'reservas', label: 'Últimas Reservas' },
  ];

  return (
    <div>
      <h1 className="titulo-bienvenida">Bienvenido, Usuario.</h1>

      {/* Navegación Tabs */}
      <div className="tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido Tabs */}
      {activeTab === 'perfil' && (
        <div className="card perfil-card">
          <img
            src="https://placedog.net/200/200?id=12"
            alt="Foto de perfil"
            className="perfil-foto"
          />
          <h2 className="perfil-nombre">Perro Inteligente</h2>
          <p className="perfil-rol">Usuario</p>

          <div className="perfil-info">
            <p><strong>Ubicación:</strong> Padre Las Casas</p>
            <p><strong>Teléfono:</strong> +569 28102374</p>
            <p><strong>Correo:</strong> Usuario@gmail.com</p>
            <p>
              <strong>Deporte favorito:</strong>{' '}
              <span className="verde">Fútbol</span>
            </p>
            <p><strong>Edad:</strong> 28</p>
          </div>

          <button className="btn-editar">Editar Perfil</button>
        </div>
      )}

      {activeTab === 'informacion' && (
        <div className="card info-card">
          <h2>Información del Usuario</h2>
          <p>
            Me gusta jugar a la pelota y ando en busca de una buena aplicación
            web para poder reservar canchas para jugar a la pelota.
          </p>
        </div>
      )}

      {activeTab === 'reservas' && (
        <div className="card reservas-card">
          <h2>Últimas Reservas Activas</h2>
          <div className="reserva-item">
            <img
              src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400"
              alt="Cancha"
              className="reserva-img"
            />
            <div>
              <p className="reserva-titulo">Fútbol 7 - Club Centro</p>
              <p className="reserva-detalle">Av. Principal 123</p>
              <p className="reserva-detalle">Horario: 10:00 - 11:00</p>
              <p className="reserva-detalle">Fecha: 08 Junio 2025</p>
              <button className="btn-reserva">Ir a Reservas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
