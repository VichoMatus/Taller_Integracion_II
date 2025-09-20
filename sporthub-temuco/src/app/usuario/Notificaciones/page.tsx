"use client";
import React from "react";
import "./notificaciones.css";

export default function NotificacionesPage() {
  let canchaSeleccionada: number | null = null;

  const notificaciones = [
    {
      cancha: "Fútbol 7 • Club Centro",
      direccion: "Av. Principal 123",
      mensajes: [
        {
          autor: "Admin de Cancha",
          fecha: "16-09-2025",
          hora: "12:09",
          texto:
            "Hola usuario, se procesó el pago y estamos limpiando y despejando la cancha para que la utilices. Te recordamos llegar puntualmente y respetar los horarios.",
        },
        {
          autor: "Admin de Cancha",
          fecha: "16-09-2025",
          hora: "12:21",
          texto:
            "El comprobante y los datos de la reserva fueron enviados a tu correo. Cualquier duda comunícate con un admin.",
        },
      ],
    },
    {
      cancha: "Fútbol 5 • Cancha Sur",
      direccion: "Calle Secundaria 456",
      mensajes: [],
    },
  ];

  const mostrarMensajes = (index: number) => {
    canchaSeleccionada = index;
    const panelDerecho = document.getElementById("panel-derecho");
    if (panelDerecho) {
      const cancha = notificaciones[index];
      panelDerecho.innerHTML = `
        <h2 class="cancha-titulo">${cancha.cancha}</h2>
        <p class="cancha-subtitulo">
          Administrador de la cancha deportiva para jugar fútbol.
        </p>
        <h3 class="mensajes-titulo">Últimos Mensajes</h3>
        <div class="mensajes-contenedor">
          ${
            cancha.mensajes.length > 0
              ? cancha.mensajes
                  .map(
                    (msg) => `
              <div class="mensaje-card">
                <div class="mensaje-header">
                  <span>${msg.autor}</span>
                  <span>${msg.fecha} • ${msg.hora}</span>
                </div>
                <p>${msg.texto}</p>
              </div>`
                  )
                  .join("")
              : `<p class="no-mensajes">No hay mensajes de esta cancha.</p>`
          }
        </div>
      `;
    }
  };

  return (
    <div className="notificaciones-container">
      <div className="cancha-lista">
        {notificaciones.map((notif, index) => (
          <button
            key={index}
            onClick={() => mostrarMensajes(index)}
            className="cancha-boton"
          >
            <p>{notif.cancha}</p>
            <span className="text-sm">{notif.direccion}</span>
          </button>
        ))}
      </div>

      <div id="panel-derecho" className="panel-derecho">
        Selecciona una Reserva de cancha para ver los mensajes.
      </div>
    </div>
  );
}
