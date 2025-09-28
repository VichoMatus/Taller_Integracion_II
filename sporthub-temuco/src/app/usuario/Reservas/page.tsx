'use client';

import React, { useState } from 'react';
import './reserva.css';
import { Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';

type Reserva = {
  id: number;
  titulo: string;
  direccion: string;
  horario: string;
  fecha: string;
  descripcion: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
  precio: number;
  imagen: string;
  deporte: 'basquetbol' | 'futbol' | 'tenis';
};

const reservasMock: Reserva[] = [
  {
    id: 1,
    titulo: 'Basquetball 7 - Club Centro',
    direccion: 'Av. Principal 123',
    horario: '10:00 - 11:00',
    fecha: '08 Junio 2025',
    descripcion: 'Cancha de gran espacio, techada y con opción a utilizar o fregar en un evento como el administrador lo desee.',
    estado: 'Confirmada',
    precio: 500,
    imagen: '/usuario/cancha.jpg',
    deporte: 'basquetbol'
  },
  {
    id: 2,
    titulo: 'Fútbol 11 - Parque Norte',
    direccion: 'Calle Secundaria 456',
    horario: '18:00 - 19:00',
    fecha: '10 Junio 2025',
    descripcion: 'Cancha al aire libre con césped sintético, ideal para partidos rápidos.',
    estado: 'Pendiente',
    precio: 80,
    imagen: 'https://placedog.net/200/200?id=12',
    deporte: 'futbol'
  },
];

export default function ReservaPage() {
  const [reservaActiva, setReservaActiva] = useState<Reserva | null>(reservasMock[0]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Confirmada': return 'estado-confirmada';
      case 'Pendiente': return 'estado-pendiente';
      case 'Cancelada': return 'estado-cancelada';
      default: return 'estado-confirmada';
    }
  };

  const getDeporteIcon = (deporte: string) => {
    switch (deporte) {
      case 'basquetbol': return '🏀';
      case 'futbol': return '⚽';
      case 'tenis': return '🎾';
      default: return '🏟️';
    }
  };

  return (
    <UserLayout userName="Usuario" notificationCount={2}>
      <div className="reserva-wrapper">
        <div className="reserva-header">
          <h1 className="reserva-titulo">Mis Reservas</h1>
          <p className="reserva-subtitulo">Gestiona y revisa tus reservas activas</p>
        </div>

        <div className="reserva-layout">
          <div className="reserva-listado">
            <div className="listado-header">
              <h2>Todas las Reservas</h2>
              <span className="reserva-count">{reservasMock.length} reservas</span>
            </div>
            
            <div className="reserva-grid">
              {reservasMock.map((reserva) => (
                <div 
                  key={reserva.id} 
                  className={`reserva-card ${reservaActiva?.id === reserva.id ? 'active' : ''}`}
                  onClick={() => setReservaActiva(reserva)}
                >
                  <div className="card-header">
                    <div className="deporte-icon">{getDeporteIcon(reserva.deporte)}</div>
                    <div className="card-info">
                      <h3>{reserva.titulo}</h3>
                      <span className={`estado-badge ${getEstadoColor(reserva.estado)}`}>
                        {reserva.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Fecha:</span>
                      <span>{reserva.fecha}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏰ Horario:</span>
                      <span>{reserva.horario}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📍 Dirección:</span>
                      <span>{reserva.direccion}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className="precio">${reserva.precio}</span>
                    <Button className="btn-ver-detalles">Ver Detalles</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reserva-detalle">
            {reservaActiva ? (
              <div className="detalle-card">
                <div className="detalle-header">
                  <div className="deporte-icon-large">{getDeporteIcon(reservaActiva.deporte)}</div>
                  <div>
                    <h2>{reservaActiva.titulo}</h2>
                    <span className={`estado-badge-large ${getEstadoColor(reservaActiva.estado)}`}>
                      {reservaActiva.estado}
                    </span>
                  </div>
                </div>

                <div className="detalle-imagen">
                  <img src={reservaActiva.imagen} alt="Cancha" />
                </div>

                <div className="detalle-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">📅 Fecha:</span>
                      <span>{reservaActiva.fecha}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">⏰ Horario:</span>
                      <span>{reservaActiva.horario}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📍 Dirección:</span>
                      <span>{reservaActiva.direccion}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💰 Precio/h:</span>
                      <span className="precio-detalle">${reservaActiva.precio}</span>
                    </div>
                  </div>

                  <div className="descripcion-section">
                    <h4>Descripción</h4>
                    <p>{reservaActiva.descripcion}</p>
                  </div>

                  <div className="detalle-actions">
                    <Button className="btn-contactar">📞 Contactar Administrador</Button>
                    <Button className="btn-anular">❌ Anular Reserva</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="detalle-placeholder">
                <div className="placeholder-icon">📋</div>
                <h3>Selecciona una reserva</h3>
                <p>Elige una reserva de la lista para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}