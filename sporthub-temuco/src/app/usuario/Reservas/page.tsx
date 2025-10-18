'use client';

import React, { useState, useEffect } from 'react';
import './reserva.css';
import { Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';
import { reservaService } from '@/services/reservaService';
import authService from '@/services/authService';
import type { Reserva } from '@/types/reserva';

// Función para mapear la respuesta de la API a tu tipo Reserva
function mapApiReserva(r: any): Reserva {
  return {
    id: r.id_reserva,
    usuarioId: r.id_usuario,
    canchaId: r.id_cancha,
    complejoId: r.complejo_id ?? 0,
    fechaInicio: r.hora_inicio || r.fecha_inicio || r.fecha_reserva || "",
    fechaFin: r.hora_fin || r.fecha_fin || r.fecha_reserva || "",
    estado: r.estado,
    precioTotal: r.monto_total ?? 0,
    metodoPago: r.metodo_pago,
    pagado: r.pagado ?? false,
    notas: r.notas,
    fechaCreacion: r.fecha_creacion ?? "",
    fechaActualizacion: r.fecha_actualizacion ?? "",
    codigoConfirmacion: r.codigo_confirmacion,
    usuario: r.usuario,
    cancha: r.cancha,
    complejo: r.complejo,
  };
}

export default function ReservaPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservaActiva, setReservaActiva] = useState<Reserva | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    async function cargarDatos() {
      try {
        // Cargar datos del usuario
        const userData = await authService.me();
        setUserName(`${userData.nombre} ${userData.apellido}`);

        // Cargar reservas del usuario
        const misReservasApi = await reservaService.getMisReservas();
        const misReservas: Reserva[] = Array.isArray(misReservasApi)
          ? misReservasApi.map(mapApiReserva)
          : [];

        if (misReservas.length > 0) {
          setReservas(misReservas);
          setReservaActiva(misReservas[0]);
        } else {
          setReservas([]);
          setReservaActiva(null);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("No se pudieron cargar las reservas. Intente más tarde.");
        setReservas([]);
        setReservaActiva(null);
      } finally {
        setIsLoading(false);
      }
    }

    cargarDatos();
  }, []);

  // Función para cancelar una reserva
  const handleCancelarReserva = async (id: number) => {
    if (!window.confirm("¿Estás seguro que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      setIsLoading(true);
      await reservaService.cancelarReserva(id);

      // Recargar datos después de cancelar
      const misReservasApi = await reservaService.getMisReservas();
      const misReservas: Reserva[] = Array.isArray(misReservasApi)
        ? misReservasApi.map(mapApiReserva)
        : [];

      if (misReservas.length > 0) {
        setReservas(misReservas);
        setReservaActiva(misReservas[0]);
      } else {
        setReservas([]);
        setReservaActiva(null);
      }

      alert("Reserva cancelada con éxito");
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      alert("Error al cancelar la reserva. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('confirm')) return 'estado-confirmada';
    if (estadoLower.includes('pendiente')) return 'estado-pendiente';
    if (estadoLower.includes('cancel')) return 'estado-cancelada';
    return 'estado-confirmada';
  };

  // Formatear monto como moneda CLP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <UserLayout userName={userName} notificationCount={2}>
      <div className="reserva-wrapper">
        <div className="reserva-header">
          <h1 className="reserva-titulo">Mis Reservas</h1>
          <p className="reserva-subtitulo">Gestiona y revisa tus reservas activas</p>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando tus reservas...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <Button className="btn-retry" onClick={() => window.location.reload()}>
              Intentar nuevamente
            </Button>
          </div>
        ) : (
          <div className="reserva-layout">
            <div className="reserva-listado">
              <div className="listado-header">
                <h2>Todas las Reservas</h2>
                <span className="reserva-count">{reservas.length} reservas</span>
              </div>

              {reservas.length === 0 ? (
                <div className="no-reservas">
                  <div className="no-reservas-icon">📅</div>
                  <h3>No tienes reservas activas</h3>
                  <p>Explora nuestras canchas disponibles y haz tu primera reserva</p>
                  <Button className="btn-explorar">Explorar Canchas</Button>
                </div>
              ) : (
                <div className="reserva-grid">
                  {reservas.map((reserva) => (
                    <div
                      key={reserva.id}
                      className={`reserva-card ${reservaActiva?.id === reserva.id ? 'active' : ''}`}
                      onClick={() => setReservaActiva(reserva)}
                    >
                      <div className="card-header">
                        <div className="deporte-icon">🏟️</div>
                        <div className="card-info">
                          <h3>Reserva #{reserva.id}</h3>
                          <span className={`estado-badge ${getEstadoColor(reserva.estado)}`}>
                            {reserva.estado}
                          </span>
                        </div>
                      </div>

                      <div className="card-details">
                        <div className="detail-item">
                          <span className="detail-label">📅 Fecha:</span>
                          <span>{formatDate(reserva.fechaInicio)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">⏰ Horario:</span>
                          <span>
                            {reserva.fechaInicio.slice(11, 16)} - {reserva.fechaFin.slice(11, 16)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">💰 Monto:</span>
                          <span>{formatPrice(reserva.precioTotal)}</span>
                        </div>
                      </div>

                      <div className="card-footer">
                        <Button className="btn-ver-detalles">Ver Detalles</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="reserva-detalle">
              {reservaActiva ? (
                <div className="detalle-card">
                  <div className="detalle-header">
                    <div className="deporte-icon-large">🏟️</div>
                    <div>
                      <h2>Reserva #{reservaActiva.id}</h2>
                      <span className={`estado-badge-large ${getEstadoColor(reservaActiva.estado)}`}>
                        {reservaActiva.estado}
                      </span>
                    </div>
                  </div>

                  <div className="detalle-info">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">📅 Fecha:</span>
                        <span>{formatDate(reservaActiva.fechaInicio)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">⏰ Horario:</span>
                        <span>
                          {reservaActiva.fechaInicio.slice(11, 16)} - {reservaActiva.fechaFin.slice(11, 16)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">💰 Monto:</span>
                        <span className="precio-detalle">{formatPrice(reservaActiva.precioTotal)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">ID Cancha:</span>
                        <span>{reservaActiva.canchaId}</span>
                      </div>
                    </div>

                    <div className="reserva-metadata">
                      <div>ID Reserva: <strong>{reservaActiva.id}</strong></div>
                      <div>ID Usuario: <strong>{reservaActiva.usuarioId}</strong></div>
                    </div>
                  </div>

                  <div className="detalle-actions">
                    <Button className="btn-contactar">📞 Contactar Administrador</Button>
                    <Button
                      className="btn-anular"
                      onClick={() => handleCancelarReserva(reservaActiva.id)}
                      disabled={reservaActiva.estado.toLowerCase().includes('cancel')}
                    >
                      {reservaActiva.estado.toLowerCase().includes('cancel')
                        ? '❌ Reserva Cancelada'
                        : '❌ Cancelar Reserva'
                      }
                    </Button>
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
        )}
      </div>
    </UserLayout>
  );
}