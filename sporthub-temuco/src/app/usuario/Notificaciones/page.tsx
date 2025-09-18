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

  // 🔧 Función para mostrar mensajes en el panel derecho
  const mostrarMensajes = (index: number) => {
    canchaSeleccionada = index;

    const panelDerecho = document.getElementById("panel-derecho");
    if (panelDerecho) {
      const cancha = notificaciones[index];
      panelDerecho.innerHTML = `
        <h2 class="text-xl font-bold text-green-700">${cancha.cancha}</h2>
        <p class="text-sm text-gray-600">
          Administrador de la cancha deportiva para jugar fútbol.
        </p>
        <h3 class="mt-4 font-semibold text-center">Últimos Mensajes</h3>

        <div class="mt-3 flex flex-col gap-3">
          ${
            cancha.mensajes.length > 0
              ? cancha.mensajes
                  .map(
                    (msg) => `
              <div class="bg-gray-100 rounded-lg p-3 shadow-sm text-sm">
                <div class="flex justify-between text-gray-500 text-xs mb-1">
                  <span>${msg.autor}</span>
                  <span>${msg.fecha} • ${msg.hora}</span>
                </div>
                <p>${msg.texto}</p>
              </div>`
                  )
                  .join("")
              : `<p class="text-gray-400 text-center">No hay mensajes de esta cancha.</p>`
          }
        </div>
      `;
    }
  };

  return (
    <div className="flex gap-4 p-4">
      {/* Columna Izquierda */}
      <div className="flex flex-col w-1/3 gap-3">
        {notificaciones.map((notif, index) => (
          <button
            key={index}
            onClick={() => mostrarMensajes(index)}
            className="bg-green-200 hover:bg-green-300 p-3 rounded-xl shadow text-center font-bold"
          >
            <p>{notif.cancha}</p>
            <span className="text-sm">{notif.direccion}</span>
          </button>
        ))}
      </div>

      {/* Columna Derecha */}
      <div
        id="panel-derecho"
        className="flex-1 bg-white rounded-xl shadow p-4 text-gray-500 text-center mt-20"
      >
        Selecciona una cancha para ver los mensajes.
      </div>
    </div>
  );
}
