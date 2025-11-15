'use client';

import './pagos.css';
import React, { useState, useEffect } from 'react';
import UserLayout from '../UsuarioLayout';
import Link from 'next/link';
import authService from '@/services/authService';
import { pagosService } from '@/services/pagoService';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import type { Pago, PagosList, PagoQueryParams, PagoDetalle } from '@/types/pagos';



// Datos mock de canchas para asociar con los pagos

//Para comenzar con el apartado de pagos por ahora como aun no logro implementar bien las reservas por ahora los datos van
//a ser simulados o ficticios. Asi deberian de verse los datos dentro de la pagina. Con el tiempo voy a hacer que los datos sean reales
const canchasData = [
  {
    id_reserva: 101,
    nombre: "Cancha de Fútbol 7 - Club Centro",
    imagen: "/usuario/cancha.jpg",
    direccion: "Av. Principal 123, Santiago",
    deporte: "fútbol",
    horario: "10:00 - 11:00",
    fecha: "15 Enero 2024"
  },
  {
    id_reserva: 102,
    nombre: "Cancha de Pádel - Parque Deportivo",
    imagen: "/usuario/cancha2.jpg",
    direccion: "Calle Secundaria 456, Providencia",
    deporte: "pádel",
    horario: "16:00 - 17:00",
    fecha: "16 Enero 2024"
  },
  {
    id_reserva: 103,
    nombre: "Cancha de Tenis - Club Deportivo",
    imagen: "/usuario/cancha3.jpg",
    direccion: "Av. Deportiva 789, Las Condes",
    deporte: "tenis",
    horario: "14:00 - 15:00",
    fecha: "14 Enero 2024"
  },
  {
    id_reserva: 104,
    nombre: "Cancha de Básquetbol - Polideportivo",
    imagen: "/usuario/cancha4.jpg",
    direccion: "Plaza Deportiva 321, Ñuñoa",
    deporte: "básquetbol",
    horario: "18:00 - 19:00",
    fecha: "10 Enero 2024"
  }
];



export default function PagosUsuario() {
  // Protección de ruta - solo usuarios pueden acceder
  useAuthProtection(['usuario']);
  
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [detallesPagos, setDetallesPagos] = useState<{[key: number]: PagoDetalle}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [filtros, setFiltros] = useState<PagoQueryParams>({
    page: 1,
    page_size: 10
  });
  const [pagoExpandido, setPagoExpandido] = useState<number | null>(null);
  const [mostrarModalReembolso, setMostrarModalReembolso] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<number | null>(null);
  const [motivoReembolso, setMotivoReembolso] = useState('');
  const [loadingDetalles, setLoadingDetalles] = useState<number | null>(null);

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

  // Función para cargar los pagos
  const loadPagos = async () => {
    setIsLoading(true);
    try {
      const data: PagosList = await pagosService.getMisPagos(filtros);
      setPagos(data.items);
    } catch (error) {
      console.error("Error al cargar los pagos:", error);
      setPagos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar detalles de un pago específico
  const loadDetallesPago = async (idPago: number) => {
    setLoadingDetalles(idPago);
    try {
      const detalle = await pagosService.getPagoDetalle(idPago);
      setDetallesPagos(prev => ({
        ...prev,
        [idPago]: detalle
      }));
    } catch (error) {
      console.error(`Error al cargar detalles del pago ${idPago}:`, error);
    } finally {
      setLoadingDetalles(null);
    }
  };

  useEffect(() => {
    loadUserData();
    loadPagos();
  }, [filtros]);

  const toggleDetallesPago = async (idPago: number) => {
    if (pagoExpandido === idPago) {
      setPagoExpandido(null);
    } else {
      setPagoExpandido(idPago);
      // Cargar detalles si no están cargados
      if (!detallesPagos[idPago]) {
        await loadDetallesPago(idPago);
      }
    }
  };

  const handleSolicitarReembolso = async () => {
    if (!pagoSeleccionado || !motivoReembolso.trim()) return;

    try {
      const resultado = await pagosService.solicitarReembolso(pagoSeleccionado, motivoReembolso);
      
      if (resultado.success) {
        alert('Solicitud de reembolso enviada correctamente');
        setMostrarModalReembolso(false);
        setMotivoReembolso('');
        setPagoSeleccionado(null);
        // Recargar los pagos para actualizar el estado
        loadPagos();
      } else {
        alert(resultado.message || 'Error al solicitar reembolso');
      }
    } catch (error) {
      console.error('Error al solicitar reembolso:', error);
      alert('Error al solicitar reembolso');
    }
  };

  const abrirModalReembolso = (idPago: number) => {
    setPagoSeleccionado(idPago);
    setMostrarModalReembolso(true);
  };

  const getEstadoColor = (estado: string) => {
    const colores = {
      'pagado': 'estado-pagado',
      'creado': 'estado-creado',
      'autorizado': 'estado-autorizado',
      'fallido': 'estado-fallido',
      'reembolsado': 'estado-reembolsado'
    };
    return colores[estado as keyof typeof colores] || 'estado-creado';
  };

  const getEstadoTexto = (estado: string) => {
    const textos = {
      'pagado': 'Pagado',
      'creado': 'Pendiente',
      'autorizado': 'Autorizado',
      'fallido': 'Fallido',
      'reembolsado': 'Reembolsado'
    };
    return textos[estado as keyof typeof textos] || estado;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (monto: number, moneda: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: moneda
    }).format(monto);
  };

  // Obtener información de la cancha basada en el ID de reserva
  const getInfoCancha = (idReserva: number) => {
    return canchasData.find(cancha => cancha.id_reserva === idReserva) || {
      nombre: "Cancha no disponible",
      imagen: "/usuario/cancha-default.jpg",
      direccion: "Dirección no disponible",
      deporte: "deporte",
      horario: "Horario no disponible",
      fecha: "Fecha no disponible"
    };
  };

  const generarBoleta = (pago: Pago, detalles?: PagoDetalle) => {
    // Por ahora solo muestra un alert, luego se puede implementar generación de PDF
    alert(`Función de generar boleta para pago #${pago.id_pago} será implementada próximamente`);
    console.log('Generando boleta para:', { pago, detalles });
  };

  if (isLoading) {
    return (
      <UserLayout userName={userData?.name || "Usuario"} notificationCount={2}>
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
      <UserLayout userName={userData?.name || "Usuario"} notificationCount={2}>
        <div className="pagos-wrapper">
          <div className="pagos-header">
            <h1 className="pagos-titulo">Mis Pagos</h1>
            <p className="pagos-subtitulo">Revisa el historial y estados de tus pagos en SportHub</p>
          </div>

          {/* Filtros */}
          <div className="filtros-pagos">
            <div className="filtro-group">
              <label>Estado:</label>
              <select 
                value={filtros.estado || ''} 
                onChange={(e) => setFiltros({...filtros, estado: e.target.value as any})}
              >
                <option value="">Todos los estados</option>
                <option value="pagado">Pagado</option>
                <option value="creado">Pendiente</option>
                <option value="autorizado">Autorizado</option>
                <option value="fallido">Fallido</option>
                <option value="reembolsado">Reembolsado</option>
              </select>
            </div>
            
            <div className="filtro-group">
              <label>Proveedor:</label>
              <select 
                value={filtros.proveedor || ''} 
                onChange={(e) => setFiltros({...filtros, proveedor: e.target.value})}
              >
                <option value="">Todos los proveedores</option>
                <option value="mercadopago">Mercado Pago</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <button 
              className="btn-limpiar"
              onClick={() => setFiltros({ page: 1, page_size: 10 })}
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Lista de Pagos */}
          <div className="pagos-lista">
            {pagos.length === 0 ? (
              <div className="sin-pagos">
                <div className="sin-pagos-icon">💳</div>
                <h3>No se encontraron pagos</h3>
                <p>No hay pagos que coincidan con los criterios de búsqueda.</p>
                <Link href="/sports">
                  <button className="btn-explorar-cancha">
                    Explorar Canchas
                  </button>
                </Link>
              </div>
            ) : (
              pagos.map((pago) => {
                const infoCancha = getInfoCancha(pago.id_reserva);
                const detalles = detallesPagos[pago.id_pago];
                
                return (
                  <div key={pago.id_pago} className="pago-card">
                    {/* Header con información básica */}
                    <div className="pago-header">
                      <div className="pago-info-cancha">
                        <img 
                          src={infoCancha.imagen} 
                          alt={infoCancha.nombre}
                          className="cancha-imagen"
                        />
                        <div className="cancha-info">
                          <h4>{infoCancha.nombre}</h4>
                          <p className="cancha-detalle">
                            <span className="deporte-tag">{infoCancha.deporte}</span>
                            <span>{infoCancha.fecha} - {infoCancha.horario}</span>
                          </p>
                          <p className="cancha-direccion">{infoCancha.direccion}</p>
                        </div>
                      </div>
                      
                      <div className="pago-monto-estado">
                        <span className="pago-monto">
                          {formatearMoneda(pago.monto, pago.moneda)}
                        </span>
                        <span className={`estado-pago ${getEstadoColor(pago.estado)}`}>
                          {getEstadoTexto(pago.estado)}
                        </span>
                        <span className="pago-fecha">
                          {formatearFecha(pago.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Botón para ver detalles */}
                    <button 
                      className="btn-ver-detalles"
                      onClick={() => toggleDetallesPago(pago.id_pago)}
                      disabled={loadingDetalles === pago.id_pago}
                    >
                      {loadingDetalles === pago.id_pago ? (
                        <>🔄 Cargando...</>
                      ) : pagoExpandido === pago.id_pago ? (
                        'Ocultar Detalles'
                      ) : (
                        'Ver Detalles de Pago'
                      )}
                    </button>

                    {/* Detalles expandidos - Tipo Boleta */}
                    {pagoExpandido === pago.id_pago && detalles && (
                      <div className="boleta-detalles">
                        <div className="boleta-header">
                          <div className="boleta-titulo">
                            <h3>SportHub - Comprobante de Pago</h3>
                            <span className="boleta-numero"># {pago.id_pago}</span>
                          </div>
                          <div className="boleta-estado">
                            <span className={`estado-boleta ${getEstadoColor(pago.estado)}`}>
                              {getEstadoTexto(pago.estado)}
                            </span>
                          </div>
                        </div>

                        <div className="boleta-content">
                          {/* Información de la Cancha */}
                          <div className="boleta-section">
                            <h4>Información de la Reserva</h4>
                            <div className="cancha-detalle-completo">
                              <img 
                                src={infoCancha.imagen} 
                                alt={infoCancha.nombre}
                                className="cancha-imagen-boleta"
                              />
                              <div className="cancha-info-boleta">
                                <h5>{infoCancha.nombre}</h5>
                                <p><strong>Deporte:</strong> {infoCancha.deporte}</p>
                                <p><strong>Fecha:</strong> {infoCancha.fecha}</p>
                                <p><strong>Horario:</strong> {infoCancha.horario}</p>
                                <p><strong>Dirección:</strong> {infoCancha.direccion}</p>
                              </div>
                            </div>
                          </div>

                          {/* Información del Pago */}
                          <div className="boleta-section">
                            <h4>Detalles del Pago</h4>
                            <div className="detalles-pago-grid">
                              <div><span>ID de Transacción:</span><span>{pago.id_externo || 'N/A'}</span></div>
                              <div><span>Proveedor:</span><span>{pago.proveedor}</span></div>
                              <div><span>Moneda:</span><span>{pago.moneda}</span></div>
                              <div><span>Monto Total:</span><span className="monto-total">{formatearMoneda(pago.monto, pago.moneda)}</span></div>
                              <div><span>Fecha de Pago:</span><span>{formatearFecha(pago.created_at)}</span></div>
                              <div><span>Última Actualización:</span><span>{formatearFecha(pago.updated_at)}</span></div>
                            </div>
                          </div>

                          {/* Información Adicional */}
                          {pago.metadata && Object.keys(pago.metadata).length > 0 && (
                            <div className="boleta-section">
                              <h4>Información Adicional</h4>
                              <div className="metadata-grid">
                                {Object.entries(pago.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    <span>{key.replace(/_/g, ' ')}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="boleta-actions">
                          <button 
                            className="btn-generar-boleta"
                            onClick={() => generarBoleta(pago, detalles)}
                          >
                            📄 Generar Boleta
                          </button>
                          
                          {pago.estado === 'pagado' && (
                            <button 
                              className="btn-reembolso"
                              onClick={() => abrirModalReembolso(pago.id_pago)}
                            >
                              🔄 Solicitar Reembolso
                            </button>
                          )}
                          
                          <Link href={`/usuario/reservas`}>
                            <button className="btn-ver-reserva">
                              📅 Ver Reserva
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

          {/* Modal de Reembolso */}
          {mostrarModalReembolso && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>📋 Solicitar Reembolso</h3>
                <p>¿Estás seguro de que deseas solicitar un reembolso para el pago #{pagoSeleccionado}?</p>
                
                <div className="motivo-reembolso">
                  <label>Motivo del reembolso:</label>
                  <textarea 
                    value={motivoReembolso}
                    onChange={(e) => setMotivoReembolso(e.target.value)}
                    placeholder="Describe el motivo de tu solicitud de reembolso..."
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
                    Cancelar
                  </button>
                  <button 
                    className="btn-confirmar"
                    onClick={handleSolicitarReembolso}
                    disabled={!motivoReembolso.trim()}
                  >
                    Solicitar Reembolso
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