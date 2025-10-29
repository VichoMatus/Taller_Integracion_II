'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './reserva.css';
import { Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';
import { reservaService } from '@/services/reservaService';
import authService from '@/services/authService';
import type { Reserva } from '@/types/reserva';

// Función para mapear la respuesta de la API a tu tipo Reserva
function mapApiReserva(r: any): Reserva {
  console.log("Mapeando reserva individual:", r);
  
  // La API devuelve fecha_reserva, hora_inicio y hora_fin por separado
  const fechaReserva = r.fecha_reserva || "";
  const horaInicio = r.hora_inicio || "";
  const horaFin = r.hora_fin || "";
  
  // Combinar fecha y hora para crear fechaInicio y fechaFin
  const fechaInicio = fechaReserva && horaInicio 
    ? `${fechaReserva}T${horaInicio}` 
    : horaInicio || fechaReserva || "";
  
  const fechaFin = fechaReserva && horaFin 
    ? `${fechaReserva}T${horaFin}` 
    : horaFin || fechaReserva || "";
  
  return {
    id: Number(r.id_reserva || r.id || 0),
    usuarioId: Number(r.id_usuario || r.usuario_id || 0),
    canchaId: Number(r.id_cancha || r.cancha_id || 0),
    complejoId: Number(r.id_complejo || r.complejo_id || 0),
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    estado: r.estado || "pendiente",
    precioTotal: Number(r.precio_total || r.monto_total || 0),
    metodoPago: r.metodo_pago || undefined,
    pagado: !!r.pagado,
    notas: r.notas || undefined,
    fechaCreacion: r.fecha_creacion || "",
    fechaActualizacion: r.fecha_actualizacion || "",
    codigoConfirmacion: r.codigo_confirmacion || undefined,
    usuario: r.usuario || undefined,
    cancha: r.cancha || undefined,
    complejo: r.complejo || undefined,
  };
}

export default function ReservaPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [reservaActiva, setReservaActiva] = useState<Reserva | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuario");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const cargarReservas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Cargar datos del usuario
      const userData = await authService.me();
      console.log("Usuario actual:", userData);
      setUserName(`${userData.nombre ?? ''} ${userData.apellido ?? ''}`.trim() || 'Usuario');
      
      // Obtener reservas del usuario
      console.log("Obteniendo reservas...");
      const misReservasApi = await reservaService.getMisReservas();
      console.log("Respuesta de API:", misReservasApi);
      
      // Verificar que sea un array
      if (Array.isArray(misReservasApi)) {
        console.log(`Se encontraron ${misReservasApi.length} reservas`);
        
        if (misReservasApi.length === 0) {
          console.log("No hay reservas para mostrar");
          setReservas([]);
        } else {
          // Mapear las reservas
          const reservasMapeadas = misReservasApi.map((reserva, index) => {
            console.log(`Mapeando reserva ${index + 1}:`, reserva);
            return mapApiReserva(reserva);
          });
          
          console.log("Reservas mapeadas:", reservasMapeadas);
          setReservas(reservasMapeadas);
        }
      } else {
        console.warn("La respuesta no es un array:", misReservasApi);
        setReservas([]);
      }
    } catch (error: any) {
      console.error("Error al cargar reservas:", error);
      console.error("Error completo:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Guardar info del error para debug
      setDebugInfo({
        error: {
          message: error.message || "Error desconocido",
          response: error.response?.data || {},
          status: error.response?.status,
        },
        timestamp: new Date().toISOString()
      });
      
      if (error.response?.status === 401) {
        setError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      } else if (error.response?.status === 404) {
        // 404 puede significar que no hay reservas
        console.log("No se encontraron reservas (404)");
        setReservas([]);
        setError(null);
      } else {
        setError("No se pudieron cargar tus reservas. Por favor, intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  // Función para cancelar una reserva
  const handleCancelarReserva = async (id: number) => {
    if (!window.confirm("¿Estás seguro que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      setIsLoading(true);
      await reservaService.cancelarReserva(id);
      await cargarReservas();
      alert("Reserva cancelada con éxito");
    } catch (error: any) {
      console.error("Error al cancelar reserva:", error);
      alert(error?.response?.data?.detail || error?.message || "Error al cancelar la reserva. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = (estado || '').toLowerCase();
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
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Formatear hora
  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    
    // Si es una fecha completa (contiene T), extraer solo la hora
    if (timeString.includes('T')) {
      return timeString.split('T')[1]?.slice(0, 5) || timeString;
    }
    
    // Si ya es solo hora (HH:MM:SS), tomar solo HH:MM
    if (timeString.includes(':')) {
      return timeString.slice(0, 5);
    }
    
    return timeString;
  };

  return (
    <UserLayout userName={userName} notificationCount={2}>
      <div className="reserva-wrapper">
        <div className="reserva-header">
          <h1 className="reserva-titulo">Mis Reservas</h1>
          <p className="reserva-subtitulo">Gestiona y revisa tus reservas activas</p>
        </div>

        {/* Botón de recarga */}
        <div style={{textAlign: 'right', marginBottom: '10px'}}>
          <Button onClick={cargarReservas} disabled={isLoading}>
            {isLoading ? '⏳ Cargando...' : '↻ Recargar'}
          </Button>
        </div>

        {/* Panel de debug - Solo visible en desarrollo */}
        {process.env.NODE_ENV !== 'production' && debugInfo && (
          <div style={{
            background: '#111', 
            color: '#eee', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '12px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <strong>DEBUG INFO:</strong>
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando tus reservas...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <Button className="btn-retry" onClick={cargarReservas}>
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
                            {formatTime(reserva.fechaInicio)} - {formatTime(reserva.fechaFin)}
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
                          {formatTime(reservaActiva.fechaInicio)} - {formatTime(reservaActiva.fechaFin)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">💰 Monto:</span>
                        <span className="precio-detalle">{formatPrice(reservaActiva.precioTotal)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">🏟️ ID Cancha:</span>
                        <span>{reservaActiva.canchaId}</span>
                      </div>
                      {reservaActiva.notas && (
                        <div className="info-item" style={{gridColumn: '1 / -1'}}>
                          <span className="info-label">📝 Notas:</span>
                          <span>{reservaActiva.notas}</span>
                        </div>
                      )}
                    </div>

                    <div className="reserva-metadata">
                      <div>ID Reserva: <strong>{reservaActiva.id}</strong></div>
                      <div>ID Usuario: <strong>{reservaActiva.usuarioId}</strong></div>
                      {reservaActiva.codigoConfirmacion && (
                        <div>Código: <strong>{reservaActiva.codigoConfirmacion}</strong></div>
                      )}
                    </div>
                  </div>

                  <div className="detalle-actions">
                    <Button className="btn-contactar">📞 Contactar Administrador</Button>
                    <Button
                      className="btn-anular"
                      onClick={() => handleCancelarReserva(reservaActiva.id)}
                      disabled={(reservaActiva.estado || '').toLowerCase().includes('cancel')}
                    >
                      {(reservaActiva.estado || '').toLowerCase().includes('cancel')
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