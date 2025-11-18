'use client';

import './pagos.css';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import UserLayout from '../UsuarioLayout';
import Link from 'next/link';
import authService from '@/services/authService';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useMisReservasUsuario } from '@/hooks/useReservasUsuario'; // 🔥 Hook de reservas
import type { Reserva, EstadoReserva } from '@/types/reserva'; // 🔥 Tipo de reserva
export default function PagosUsuario() {
  // Protección de ruta - todos los usuarios autenticados pueden acceder
  useAuthProtection(['usuario', 'admin', 'super_admin']);
  
  // 🔥 USAR HOOK DE RESERVAS EN LUGAR DE PAGOS
  const { 
    reservas, 
    loading: isLoading, 
    error,
    cancelarReserva: cancelarReservaHook 
  } = useMisReservasUsuario();
  
  const [userData, setUserData] = useState<any>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagoExpandido, setPagoExpandido] = useState<number | null>(null);
  const [mostrarModalReembolso, setMostrarModalReembolso] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<number | null>(null);
  const [motivoReembolso, setMotivoReembolso] = useState('');

  // Función para cargar los datos del usuario
  const loadUserData = async () => {
    try {
      const data = await authService.me();
      setUserData({
        id_usuario: data.id_usuario,
        name: `${data.nombre} ${data.apellido}`,
        nombre: data.nombre,
        apellido: data.apellido,
        phone: data.telefono || "No registrado",
        email: data.email,
        avatar: data.avatar_url,
        rol: data.rol,
        bio: data.bio || "",
        esta_activo: data.esta_activo,
        verificado: data.verificado
      });
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setUserData(null);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const toggleDetallesPago = useCallback(async (idReserva: number) => {
    setPagoExpandido(prevId => prevId === idReserva ? null : idReserva);
  }, []);

  const handleSolicitarReembolso = async () => {
    if (!pagoSeleccionado || !motivoReembolso.trim()) return;

    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      await cancelarReservaHook(pagoSeleccionado);
      alert('Reserva cancelada con éxito');
      setMostrarModalReembolso(false);
      setMotivoReembolso('');
      setPagoSeleccionado(null);
    } catch (error: any) {
      console.error('Error al cancelar reserva:', error);
      alert(error?.message || 'Error al cancelar la reserva');
    }
  };

  const abrirModalReembolso = (idReserva: number) => {
    setPagoSeleccionado(idReserva);
    setMostrarModalReembolso(true);
  };

  // Función para verificar si una reserva ya pasó (memoizada)
  const reservaYaPaso = useCallback((reserva: Reserva): boolean => {
    const ahora = new Date();
    const fechaFin = new Date(reserva.fechaFin);
    return fechaFin < ahora;
  }, []);

  // Función para obtener el estado visual (memoizada)
  const getEstadoVisual = useCallback((reserva: Reserva): EstadoReserva => {
    if (reservaYaPaso(reserva)) {
      return 'completada';
    }
    return reserva.estado;
  }, [reservaYaPaso]);  // 🔥 FUNCIONES ADAPTADAS PARA RESERVAS
  const getEstadoColor = (estado: string) => {
    const estadoLower = (estado || '').toLowerCase();
    if (estadoLower.includes('confirm')) return 'estado-pagado';
    if (estadoLower.includes('completada')) return 'estado-completado'; // 🎨 Nuevo estado visual
    if (estadoLower.includes('pendiente')) return 'estado-creado';
    if (estadoLower.includes('cancel')) return 'estado-fallido';
    return 'estado-creado';
  };

  const getEstadoTexto = (estado: string) => {
    const estadoLower = (estado || '').toLowerCase();
    if (estadoLower.includes('confirm')) return 'Pagado';
    if (estadoLower.includes('completada')) return 'Completado'; // 🎨 Texto para completada
    if (estadoLower.includes('pendiente')) return 'Pendiente';
    if (estadoLower.includes('cancel')) return 'Cancelado';
    return estado;
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "Fecha no disponible";
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const formatearHora = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateTimeString;
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto);
  };

  const generarBoleta = (reserva: Reserva) => {
    alert(`Función de generar boleta para reserva #${reserva.id} será implementada próximamente`);
    console.log('Generando boleta para:', reserva);
  };

  // 🔥 FILTRAR RESERVAS SEGÚN ESTADO (MEMOIZADO)
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por estado
      if (filtroEstado !== 'todas') {
        const estadoLower = (reserva.estado || '').toLowerCase();
        if (filtroEstado === 'pagado' && !estadoLower.includes('confirm')) return false;
        if (filtroEstado === 'pendiente' && !estadoLower.includes('pendiente')) return false;
        if (filtroEstado === 'cancelado' && !estadoLower.includes('cancel')) return false;
      }

      // Filtro por búsqueda
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const nombreCancha = reserva.cancha?.nombre?.toLowerCase() || '';
        const nombreComplejo = reserva.complejo?.nombre?.toLowerCase() || '';
        return nombreCancha.includes(searchLower) || nombreComplejo.includes(searchLower);
      }

      return true;
    });
  }, [reservas, filtroEstado, searchTerm]); // Solo recalcular cuando cambien estos valores

  if (isLoading) {
    return (
      <UserLayout userName={userData?.name || "Usuario"}>
        <div className="pagos-wrapper">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando pagos...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <div id="tailwind-wrapper">
      <UserLayout userName={userData?.name || "Usuario"}>
        <div className="pagos-wrapper">
          <div className="pagos-header">
            <h1 className="pagos-titulo">Mis Pagos</h1>
            <p className="pagos-subtitulo">Historial de pagos basado en tus reservas en SportHub</p>
          </div>

          {/* Filtros */}
          <div className="filtros-pagos">
            <div className="filtro-group">
              <label>Estado:</label>
              <select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todos los estados</option>
                <option value="pagado">Pagado (Confirmadas)</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            <div className="filtro-group">
              <label>Buscar:</label>
              <input 
                type="text"
                placeholder="Buscar por cancha o complejo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              className="btn-limpiar"
              onClick={() => {
                setFiltroEstado('todas');
                setSearchTerm('');
              }}
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Lista de Pagos (Reservas) */}
          <div className="pagos-lista">
            {reservasFiltradas.length === 0 ? (
              <div className="sin-pagos">
                <div className="sin-pagos-icon">💳</div>
                <h3>No se encontraron pagos</h3>
                <p>No hay reservas que coincidan con los criterios de búsqueda.</p>
                <Link href="/sports">
                  <button className="btn-explorar-cancha">
                    Explorar Canchas
                  </button>
                </Link>
              </div>
            ) : (
              reservasFiltradas.map((reserva) => {
                const nombreCancha = reserva.cancha?.nombre || String(reserva.canchaId) || "Cancha no especificada";
                const nombreComplejo = reserva.complejo?.nombre || "Complejo Deportivo";
                const direccionComplejo = reserva.complejo?.direccion || "Dirección no disponible";
                const imagenCancha = "/usuario/cancha-default.jpg";
                const deporteCancha = reserva.cancha?.tipo || "Deporte";
                const estadoVisual = getEstadoVisual(reserva); // 🎨 Obtener estado visual
                
                return (
                  <div key={reserva.id} className="pago-card">
                    {/* Header con información básica */}
                    <div className="pago-header">
                      <div className="pago-info-cancha">
                        <img 
                          src={imagenCancha} 
                          alt={`Cancha ${nombreCancha}`}
                          className="cancha-imagen"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/usuario/cancha-default.jpg';
                          }}
                        />
                        <div className="cancha-info">
                          <h4>{nombreCancha}</h4>
                          <p className="cancha-detalle">
                            <span className="deporte-tag">{deporteCancha}</span>
                            <span>{formatearFecha(reserva.fechaInicio)} - {formatearHora(reserva.fechaInicio)} a {formatearHora(reserva.fechaFin)}</span>
                          </p>
                          <p className="cancha-direccion">{nombreComplejo} - {direccionComplejo}</p>
                        </div>
                      </div>
                      
                      <div className="pago-monto-estado">
                        <span className="pago-monto">
                          {formatearMoneda(reserva.precioTotal || 0)}
                        </span>
                        <span className={`estado-pago ${getEstadoColor(estadoVisual)}`}>
                          {getEstadoTexto(estadoVisual)}
                        </span>
                        <span className="pago-fecha">
                          Reserva #{reserva.id}
                        </span>
                      </div>
                    </div>

                    {/* Botón para ver detalles */}
                    <button 
                      className="btn-ver-detalles"
                      onClick={() => toggleDetallesPago(reserva.id)}
                    >
                      {pagoExpandido === reserva.id ? 'Ocultar Detalles' : 'Ver Detalles de Pago'}
                    </button>

                    {/* Detalles expandidos - Tipo Boleta */}
                    {pagoExpandido === reserva.id && (
                      <div className="boleta-detalles">
                        <div className="boleta-header">
                          <div className="boleta-titulo">
                            <h3>SportHub - Comprobante de Pago</h3>
                            <span className="boleta-numero"># {reserva.id}</span>
                          </div>
                          <div className="boleta-estado">
                            <span className={`estado-boleta ${getEstadoColor(estadoVisual)}`}>
                              {getEstadoTexto(estadoVisual)}
                            </span>
                          </div>
                        </div>

                        <div className="boleta-content">
                          {/* Información de la Cancha */}
                          <div className="boleta-section">
                            <h4>Información de la Reserva</h4>
                            <div className="cancha-detalle-completo">
                              <img 
                                src={imagenCancha} 
                                alt={nombreCancha}
                                className="cancha-imagen-boleta"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/usuario/cancha-default.jpg';
                                }}
                              />
                              <div className="cancha-info-boleta">
                                <h5>{nombreCancha}</h5>
                                <p><strong>Deporte:</strong> {deporteCancha}</p>
                                <p><strong>Fecha:</strong> {formatearFecha(reserva.fechaInicio)}</p>
                                <p><strong>Horario:</strong> {formatearHora(reserva.fechaInicio)} - {formatearHora(reserva.fechaFin)}</p>
                                <p><strong>Complejo:</strong> {nombreComplejo}</p>
                                <p><strong>Dirección:</strong> {direccionComplejo}</p>
                              </div>
                            </div>
                          </div>

                          {/* Información del Pago */}
                          <div className="boleta-section">
                            <h4>Detalles del Pago</h4>
                            <div className="detalles-pago-grid">
                              <div><span>ID de Reserva:</span><span>{reserva.id}</span></div>
                              <div><span>Estado:</span><span>{getEstadoTexto(estadoVisual)}</span></div>
                              <div><span>Moneda:</span><span>CLP</span></div>
                              <div><span>Monto Total:</span><span className="monto-total">{formatearMoneda(reserva.precioTotal || 0)}</span></div>
                              <div><span>Fecha de Creación:</span><span>{formatearFecha(reserva.fechaCreacion)}</span></div>
                              <div><span>Última Actualización:</span><span>{formatearFecha(reserva.fechaActualizacion)}</span></div>
                              {reserva.metodoPago && (
                                <div><span>Método de Pago:</span><span>{reserva.metodoPago}</span></div>
                              )}
                              <div><span>Estado de Pago:</span><span>{reserva.pagado ? 'Pagado' : 'Pendiente'}</span></div>
                            </div>
                          </div>

                          {/* Notas adicionales si existen */}
                          {reserva.notas && (
                            <div className="boleta-section">
                              <h4>Notas de la Reserva</h4>
                              <p className="notas-contenido">{reserva.notas}</p>
                            </div>
                          )}

                          {/* Código de confirmación */}
                          {reserva.codigoConfirmacion && (
                            <div className="boleta-section">
                              <h4>Código de Confirmación</h4>
                              <div className="codigo-confirmacion">
                                <strong>{reserva.codigoConfirmacion}</strong>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="boleta-actions">
                          <button 
                            className="btn-generar-boleta"
                            onClick={() => generarBoleta(reserva)}
                          >
                            📄 Generar Boleta
                          </button>
                          
                          {reserva.estado === 'confirmada' && (
                            <button 
                              className="btn-reembolso"
                              onClick={() => abrirModalReembolso(reserva.id)}
                            >
                              🔄 Cancelar Reserva
                            </button>
                          )}
                          
                          <Link href={`/usuario/historial-reservas`}>
                            <button className="btn-ver-reserva">
                              📅 Ver Historial
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Modal de Cancelación */}
          {mostrarModalReembolso && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>📋 Cancelar Reserva</h3>
                <p>¿Estás seguro de que deseas cancelar la reserva #{pagoSeleccionado}?</p>
                
                <div className="motivo-reembolso">
                  <label>Motivo de la cancelación:</label>
                  <textarea 
                    value={motivoReembolso}
                    onChange={(e) => setMotivoReembolso(e.target.value)}
                    placeholder="Describe el motivo de tu cancelación..."
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-cancelar"
                    onClick={() => {
                      setMostrarModalReembolso(false);
                      setMotivoReembolso('');
                      setPagoSeleccionado(null);
                    }}
                  >
                    Cerrar
                  </button>
                  <button 
                    className="btn-confirmar"
                    onClick={handleSolicitarReembolso}
                    disabled={!motivoReembolso.trim()}
                  >
                    Confirmar Cancelación
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </UserLayout>
    </div>
  );
}



// src/components/layout/Sidebar.tsx
//    {
//      name: 'Pagos',
//      icon: '💳',
//      href: '/usuario/pagos',
//      active: pathname === '/usuario/pagos'
//    },