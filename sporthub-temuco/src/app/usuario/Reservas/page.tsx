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
  estado: string;
  precio: number;
  imagen: string;
};

const reservasMock: Reserva[] = [
  {
    id: 1,
    titulo: 'Basquetball 7 - Club Centro',
    direccion: 'Av. Principal 123',
    horario: '10:00 - 11:00',
    fecha: '08 Junio 2025',
    descripcion:
      'Cancha de gran espacio, techada y con opción a utilizar o fregar en un evento como el administrador lo desee, además de contar con gradas en buen estado y con administración excelente al medio.',
    estado: 'Disponible',
    precio: 500,
    imagen: '/usuario/cancha.jpg',
  },
  {
    id: 2,
    titulo: 'Basquetball 5 - Parque Norte',
    direccion: 'Calle Secundaria 456',
    horario: '18:00 - 19:00',
    fecha: '10 Junio 2025',
    descripcion:
      'Cancha al aire libre con césped sintético, ideal para partidos rápidos y eventos recreativos.',
    estado: 'Disponible',
    precio: 80,
    imagen: 'https://placedog.net/200/200?id=12',
  },
];

export default function ReservaPage() {
  const [reservaActiva, setReservaActiva] = useState<Reserva | null>(null);

  return (
    <UserLayout
      userName="Usuario"
      sport="futbol"
      notificationCount={2}
    >
      <div className="page-wrapper">
        <h1 className="titulo-principal">Mis Reservas</h1>

        <div className="reserva-layout">
          {/* Panel izquierdo */}
          <div className="reserva-listado">
            <div className="reserva-listado-grid">
              {reservasMock.map((reserva) => (
                <div key={reserva.id} className="resumen-card">
                  <h3 className="text-lg font-semibold">{reserva.titulo}</h3>
                  <p><strong>Dirección:</strong> {reserva.direccion}</p>
                  <p><strong>Horario:</strong> {reserva.horario}</p>
                  <p><strong>Fecha:</strong> {reserva.fecha}</p>

                  <Button
                    className="btn-ver-info w-full mt-2"
                    onClick={() => setReservaActiva(reserva)}
                  >
                    Ver Información de Reserva
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho */}
          <div className="reserva-detalle">
            {reservaActiva ? (
              <div className="detalle-card">
                <img src={reservaActiva.imagen} alt="Cancha" className="detalle-img" />
                <h2 className="text-xl font-bold mb-2">{reservaActiva.titulo}</h2>
                <p><strong>Dirección:</strong> {reservaActiva.direccion}</p>
                <p><strong>Estado:</strong> <span className="estado-disponible">{reservaActiva.estado}</span></p>
                <p><strong>Descripción:</strong> {reservaActiva.descripcion}</p>
                <p><strong>Cancha:</strong> {reservaActiva.titulo}</p>
                <p><strong>Horario:</strong> {reservaActiva.horario}</p>
                <p><strong>Fecha:</strong> {reservaActiva.fecha}</p>
                <p><strong>Jugadores:</strong> 10</p>
                <p><strong>Precio / h:</strong> ${reservaActiva.precio}</p>

                <div className="detalle-actions flex gap-2 mt-2">
                  <Button className="btn-contactar flex-1">Contactar Administrador</Button>
                  <Button className="btn-anular flex-1">Anular Reserva</Button>
                </div>
              </div>
            ) : (
              <div className="detalle-placeholder">
                <p>Selecciona una reserva para ver los detalles.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
