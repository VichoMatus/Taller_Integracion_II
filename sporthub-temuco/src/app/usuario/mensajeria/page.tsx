'use client';
import React, { useState, useEffect } from "react";
import "./mensajeria.css";
import UserLayout from "../UsuarioLayout";

export default function MensajeriaPage() {
  const [canchaSeleccionada, setCanchaSeleccionada] = useState<number | null>(null);

  const reservas = [
    {
      cancha: "Basquetball 7 • Club Centro",
      direccion: "Av. Principal 123",
      fechaReserva: "20-09-2025 • 15:00 - 17:00",
      mensajes: [
        {
          autor: "Admin de Cancha",
          fecha: "16-09-2025",
          hora: "12:09",
          texto: "Hola usuario, se procesó el pago y estamos limpiando y despejando la cancha para que la utilices. Te recordamos llegar puntualmente y respetar los horarios.",
        },
        {
          autor: "Admin de Cancha",
          fecha: "16-09-2025",
          hora: "12:21",
          texto: "El comprobante y los datos de la reserva fueron enviados a tu correo. Cualquier duda comunícate con un admin.",
        },
      ],
    },
    {
      cancha: "Basquetball 5 • Cancha Sur",
      direccion: "Calle Secundaria 456",
      fechaReserva: "22-09-2025 • 10:00 - 12:00",
      mensajes: [],
    },
    {
      cancha: "Fútbol 11 • Estadio Norte",
      direccion: "Av. Deportiva 789",
      fechaReserva: "25-09-2025 • 18:00 - 20:00",
      mensajes: [
        {
          autor: "Administrador",
          fecha: "17-09-2025",
          hora: "09:15",
          texto: "Tu reserva ha sido confirmada. Recuerda traer tu equipo deportivo.",
        },
      ],
    },
  ];

  const seleccionarCancha = (index: number) => {
    setCanchaSeleccionada(index);
  };

  useEffect(() => {
    if (reservas.length > 0 && canchaSeleccionada === null) {
      setCanchaSeleccionada(0);
    }
  }, []);

  const canchaActiva = canchaSeleccionada !== null ? reservas[canchaSeleccionada] : null;

  return (
    <UserLayout userName="Usuario" sport="futbol" notificationCount={2}>
      <div className="mensajeria-wrapper">
        {/* Título a la izquierda como en Reservas y Editar Perfil */}
        <div className="mensajeria-header">
          <h1 className="mensajeria-titulo">Mensajería</h1>
          <p className="mensajeria-subtitulo">Comunicación con administradores de canchas</p>
        </div>

        <div className="mensajeria-container">
          {/* Panel izquierdo - Lista de reservas */}
          <div className="reservas-lista">
            <div className="lista-header">
              <h2>Tus Reservas</h2>
              <span className="reservas-count">{reservas.length}</span>
            </div>
            
            <div className="reservas-items">
              {reservas.map((reserva, index) => (
                <button
                  key={index}
                  onClick={() => seleccionarCancha(index)}
                  className={`reserva-item ${canchaSeleccionada === index ? 'active' : ''}`}
                >
                  <div className="reserva-info">
                    <h3>{reserva.cancha}</h3>
                    <p>{reserva.direccion}</p>
                    <span className="reserva-fecha">{reserva.fechaReserva}</span>
                  </div>
                  {reserva.mensajes.length > 0 && (
                    <div className="mensajes-indicador">
                      {reserva.mensajes.length}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Panel derecho - Mensajes */}
          <div className="mensajes-panel">
            {canchaActiva ? (
              <>
                <div className="mensajes-header">
                  <div>
                    <h2>{canchaActiva.cancha}</h2>
                    <p>{canchaActiva.direccion}</p>
                    <span className="reserva-status">Reserva: {canchaActiva.fechaReserva}</span>
                  </div>
                </div>

                <div className="mensajes-contenedor">
                  <div className="mensajes-info">
                    <h3>Mensajes del Administrador</h3>
                    <span>{canchaActiva.mensajes.length} mensajes</span>
                  </div>
                  
                  <div className="mensajes-lista">
                    {canchaActiva.mensajes.length > 0 ? (
                      canchaActiva.mensajes.map((msg, index) => (
                        <div key={index} className="mensaje-card">
                          <div className="mensaje-header">
                            <span className="mensaje-autor">{msg.autor}</span>
                            <span className="mensaje-fecha">{msg.fecha} • {msg.hora}</span>
                          </div>
                          <p className="mensaje-texto">{msg.texto}</p>
                        </div>
                      ))
                    ) : (
                      <div className="sin-mensajes">
                        <div className="sin-mensajes-icon">💬</div>
                        <h4>No hay mensajes</h4>
                        <p>El administrador aún no ha enviado mensajes para esta reserva.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="seleccionar-reserva">
                <div className="seleccionar-icon">👈</div>
                <h3>Selecciona una reserva</h3>
                <p>Elige una reserva de la lista para ver los mensajes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}