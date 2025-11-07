'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './historial-reservas.css';
import { Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';
import { reservaService } from '@/services/reservaService';
import authService from '@/services/authService';
import type { Reserva } from '@/types/reserva';

// Función para mapear la respuesta de la API a tu tipo Reserva
function mapApiReserva(r: any): Reserva {
  console.log("Mapeando reserva individual:", r);
  
  const fechaReserva = r.fecha_reserva || "";
  const horaInicio = r.hora_inicio || "";
  const horaFin = r.hora_fin || "";
  
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
  
  // 🔥 NUEVOS ESTADOS PARA LA PÁGINA RENOVADA
  const [activeTab, setActiveTab] = useState<'actuales' | 'historial' | 'estadisticas'>('actuales');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'confirmadas' | 'pendientes' | 'canceladas'>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  const cargarReservas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await authService.me();
      console.log("Usuario actual:", userData);
      setUserName(`${userData.nombre ?? ''} ${userData.apellido ?? ''}`.trim() || 'Usuario');
      
      console.log("Obteniendo reservas...");
      const misReservasApi = await reservaService.getMisReservas();
      console.log("Respuesta de API:", misReservasApi);
      
      if (Array.isArray(misReservasApi)) {
        console.log(`Se encontraron ${misReservasApi.length} reservas`);
        
        if (misReservasApi.length === 0) {
          console.log("No hay reservas para mostrar");
          setReservas([]);
        } else {
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

  const handleCancelarReserva = async (id: number) => {
    if (!window.confirm("¿Estás seguro que deseas cancelar esta reserva?")) {
      return;
    }

    try {
      setIsLoading(true);
      await reservaService.cancelarReserva(id);
      await cargarReservas();
      alert("Reserva cancelada con éxito");
      setShowModal(false);
    } catch (error: any) {
      console.error("Error al cancelar reserva:", error);
      alert(error?.response?.data?.detail || error?.message || "Error al cancelar la reserva. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 FUNCIONES AUXILIARES MEJORADAS
  const getEstadoColor = (estado: string) => {
    const estadoLower = (estado || '').toLowerCase();
    if (estadoLower.includes('confirm')) return 'confirmada';
    if (estadoLower.includes('pendiente')) return 'pendiente';
    if (estadoLower.includes('cancel')) return 'cancelada';
    return 'confirmada';
  };

  const getEstadoIcon = (estado: string) => {
    const estadoLower = (estado || '').toLowerCase();
    if (estadoLower.includes('confirm')) return '✅';
    if (estadoLower.includes('pendiente')) return '⏳';
    if (estadoLower.includes('cancel')) return '❌';
    return '✅';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(price);
  };

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

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    
    if (timeString.includes('T')) {
      return timeString.split('T')[1]?.slice(0, 5) || timeString;
    }
    
    if (timeString.includes(':')) {
      return timeString.slice(0, 5);
    }
    
    return timeString;
  };

  // 🔥 FUNCIONES DE FILTRADO Y BÚSQUEDA
  const getReservasActuales = () => {
    const ahora = new Date();
    return reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fechaInicio);
      return fechaReserva >= ahora && !reserva.estado.toLowerCase().includes('cancel');
    });
  };

  const getHistorialReservas = () => {
    const ahora = new Date();
    return reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fechaInicio);
      return fechaReserva < ahora || reserva.estado.toLowerCase().includes('cancel');
    });
  };

  const filtrarReservas = (reservasBase: Reserva[]) => {
    let filtered = reservasBase;

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      filtered = filtered.filter(reserva => {
        const estado = reserva.estado.toLowerCase();
        switch (filtroEstado) {
          case 'confirmadas':
            return estado.includes('confirm');
          case 'pendientes':
            return estado.includes('pendiente');
          case 'canceladas':
            return estado.includes('cancel');
          default:
            return true;
        }
      });
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(reserva =>
        reserva.id.toString().includes(searchTerm) ||
        reserva.estado.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // 🔥 CALCULAR ESTADÍSTICAS
  const getEstadisticas = () => {
    const total = reservas.length;
    const confirmadas = reservas.filter(r => r.estado.toLowerCase().includes('confirm')).length;
    const pendientes = reservas.filter(r => r.estado.toLowerCase().includes('pendiente')).length;
    const canceladas = reservas.filter(r => r.estado.toLowerCase().includes('cancel')).length;
    const montoTotal = reservas.reduce((sum, r) => sum + r.precioTotal, 0);
    const promedioPrecio = total > 0 ? montoTotal / total : 0;

    return {
      total,
      confirmadas,
      pendientes,
      canceladas,
      montoTotal,
      promedioPrecio
    };
  };

  const stats = getEstadisticas();
  const reservasActuales = filtrarReservas(getReservasActuales());
  const historialReservas = filtrarReservas(getHistorialReservas());

  return (
    <UserLayout userName={userName} notificationCount={2}>
      <div className="reservas-container">
        {/* 🔥 HEADER RENOVADO */}
        <div className="reservas-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <span className="title-icon">🏆</span>
                Centro de Reservas
              </h1>
              <p className="page-subtitle">
                Gestiona todas tus reservas deportivas en un solo lugar
              </p>
            </div>
            <div className="header-actions">
              <Button onClick={cargarReservas} disabled={isLoading} className="refresh-btn">
                {isLoading ? '⏳ Cargando...' : '🔄 Actualizar'}
              </Button>
            </div>
          </div>

          {/* 🔥 ESTADÍSTICAS RÁPIDAS */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Reservas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-number">{stats.confirmadas}</span>
                <span className="stat-label">Confirmadas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <span className="stat-number">{stats.pendientes}</span>
                <span className="stat-label">Pendientes</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <span className="stat-number">{stats.canceladas}</span>
                <span className="stat-label">Canceladas</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NAVEGACIÓN POR PESTAÑAS */}
        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'actuales' ? 'active' : ''}`}
              onClick={() => setActiveTab('actuales')}
            >
              <span className="tab-icon">🔥</span>
              <span>Reservas Actuales</span>
              <span className="tab-badge">{reservasActuales.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
              onClick={() => setActiveTab('historial')}
            >
              <span className="tab-icon">📚</span>
              <span>Historial</span>
              <span className="tab-badge">{historialReservas.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setActiveTab('estadisticas')}
            >
              <span className="tab-icon">📈</span>
              <span>Estadísticas</span>
            </button>
          </div>

          {/* 🔥 FILTROS Y BÚSQUEDA */}
          {(activeTab === 'actuales' || activeTab === 'historial') && (
            <div className="filters-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por ID o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-dropdown">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="todas">🔍 Todos los estados</option>
                  <option value="confirmadas">✅ Confirmadas</option>
                  <option value="pendientes">⏳ Pendientes</option>
                  <option value="canceladas">❌ Canceladas</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 🔥 CONTENIDO PRINCIPAL */}
        <div className="main-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3>Cargando tus reservas...</h3>
              <p>Obteniendo la información más reciente</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error al cargar reservas</h3>
              <p>{error}</p>
              <Button onClick={cargarReservas} className="retry-btn">
                🔄 Reintentar
              </Button>
            </div>
          ) : (
            <>
              {/* 🔥 PESTAÑA RESERVAS ACTUALES */}
              {activeTab === 'actuales' && (
                <div className="tab-content">
                  {reservasActuales.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🎯</div>
                      <h3>No tienes reservas activas</h3>
                      <p>¡Es hora de reservar tu próxima sesión deportiva!</p>
                      <Button className="cta-btn">
                        🏟️ Explorar Canchas
                      </Button>
                    </div>
                  ) : (
                    <div className="reservas-grid">
                      {reservasActuales.map((reserva) => (
                        <div
                          key={reserva.id}
                          className="reserva-card modern"
                          onClick={() => {
                            setSelectedReserva(reserva);
                            setShowModal(true);
                          }}
                        >
                          <div className="card-header">
                            <div className="card-status">
                              <span className={`status-badge ${getEstadoColor(reserva.estado)}`}>
                                {getEstadoIcon(reserva.estado)} {reserva.estado}
                              </span>
                            </div>
                            <div className="card-id">#{reserva.id}</div>
                          </div>

                          <div className="card-content">
                            <div className="card-date">
                              <span className="date-day">{formatDate(reserva.fechaInicio)}</span>
                              <span className="date-time">
                                {formatTime(reserva.fechaInicio)} - {formatTime(reserva.fechaFin)}
                              </span>
                            </div>

                            <div className="card-details">
                              <div className="detail-row">
                                <span className="detail-icon">🏟️</span>
                                <span>Cancha {reserva.canchaId}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">💰</span>
                                <span className="price">{formatPrice(reserva.precioTotal)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="card-footer">
                            <Button className="card-action-btn">
                              👁️ Ver Detalles
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 🔥 PESTAÑA HISTORIAL */}
              {activeTab === 'historial' && (
                <div className="tab-content">
                  {historialReservas.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📚</div>
                      <h3>Sin historial de reservas</h3>
                      <p>Tus reservas pasadas aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {historialReservas.map((reserva) => (
                        <div
                          key={reserva.id}
                          className="history-item"
                          onClick={() => {
                            setSelectedReserva(reserva);
                            setShowModal(true);
                          }}
                        >
                          <div className="history-date">
                            <div className="date-circle">
                              <span className="date-day">{new Date(reserva.fechaInicio).getDate()}</span>
                              <span className="date-month">
                                {new Date(reserva.fechaInicio).toLocaleDateString('es-CL', { month: 'short' })}
                              </span>
                            </div>
                          </div>

                          <div className="history-content">
                            <div className="history-header">
                              <h4>Reserva #{reserva.id}</h4>
                              <span className={`status-badge ${getEstadoColor(reserva.estado)}`}>
                                {getEstadoIcon(reserva.estado)} {reserva.estado}
                              </span>
                            </div>

                            <div className="history-details">
                              <span>🏟️ Cancha {reserva.canchaId}</span>
                              <span>⏰ {formatTime(reserva.fechaInicio)} - {formatTime(reserva.fechaFin)}</span>
                              <span className="price">💰 {formatPrice(reserva.precioTotal)}</span>
                            </div>
                          </div>

                          <div className="history-action">
                            <Button className="view-btn">👁️</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 🔥 PESTAÑA ESTADÍSTICAS */}
              {activeTab === 'estadisticas' && (
                <div className="tab-content">
                  <div className="stats-grid">
                    <div className="stats-card">
                      <div className="stats-header">
                        <h3>📊 Resumen General</h3>
                      </div>
                      <div className="stats-content">
                        <div className="stat-item">
                          <span className="stat-label">Total de reservas:</span>
                          <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reservas confirmadas:</span>
                          <span className="stat-value success">{stats.confirmadas}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reservas pendientes:</span>
                          <span className="stat-value warning">{stats.pendientes}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reservas canceladas:</span>
                          <span className="stat-value danger">{stats.canceladas}</span>
                        </div>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-header">
                        <h3>💰 Información Financiera</h3>
                      </div>
                      <div className="stats-content">
                        <div className="stat-item">
                          <span className="stat-label">Total invertido:</span>
                          <span className="stat-value">{formatPrice(stats.montoTotal)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Promedio por reserva:</span>
                          <span className="stat-value">{formatPrice(stats.promedioPrecio)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reserva más cara:</span>
                          <span className="stat-value">
                            {reservas.length > 0 ? formatPrice(Math.max(...reservas.map(r => r.precioTotal))) : '$0'}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reserva más barata:</span>
                          <span className="stat-value">
                            {reservas.length > 0 ? formatPrice(Math.min(...reservas.map(r => r.precioTotal))) : '$0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="stats-card full-width">
                      <div className="stats-header">
                        <h3>📈 Análisis de Actividad</h3>
                      </div>
                      <div className="stats-content">
                        <div className="activity-summary">
                          <p>Has realizado un total de <strong>{stats.total} reservas</strong> en la plataforma.</p>
                          {stats.total > 0 && (
                            <>
                              <p>Tu tasa de confirmación es del <strong>{((stats.confirmadas / stats.total) * 100).toFixed(1)}%</strong></p>
                              <p>Has invertido un promedio de <strong>{formatPrice(stats.promedioPrecio)}</strong> por reserva.</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 🔥 MODAL DE DETALLES */}
        {showModal && selectedReserva && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles de Reserva #{selectedReserva.id}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-status">
                  <span className={`status-badge large ${getEstadoColor(selectedReserva.estado)}`}>
                    {getEstadoIcon(selectedReserva.estado)} {selectedReserva.estado}
                  </span>
                </div>

                <div className="modal-details">
                  <div className="detail-group">
                    <h4>📅 Información de la Reserva</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDate(selectedReserva.fechaInicio)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Horario:</span>
                        <span className="value">
                          {formatTime(selectedReserva.fechaInicio)} - {formatTime(selectedReserva.fechaFin)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Cancha:</span>
                        <span className="value">Cancha #{selectedReserva.canchaId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Complejo:</span>
                        <span className="value">Complejo #{selectedReserva.complejoId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>💰 Información de Pago</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Precio Total:</span>
                        <span className="value price">{formatPrice(selectedReserva.precioTotal)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Estado de Pago:</span>
                        <span className={`value ${selectedReserva.pagado ? 'success' : 'warning'}`}>
                          {selectedReserva.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                        </span>
                      </div>
                      {selectedReserva.metodoPago && (
                        <div className="detail-item">
                          <span className="label">Método de Pago:</span>
                          <span className="value">{selectedReserva.metodoPago}</span>
                        </div>
                      )}
                      {selectedReserva.codigoConfirmacion && (
                        <div className="detail-item">
                          <span className="label">Código de Confirmación:</span>
                          <span className="value code">{selectedReserva.codigoConfirmacion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedReserva.notas && (
                    <div className="detail-group">
                      <h4>📝 Notas Adicionales</h4>
                      <p className="notes">{selectedReserva.notas}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  className="btn-contact"
                  onClick={() => alert('Función de contacto en desarrollo')}
                >
                  📞 Contactar Soporte
                </Button>
                <Button
                  className="btn-cancel"
                  onClick={() => handleCancelarReserva(selectedReserva.id)}
                  disabled={selectedReserva.estado.toLowerCase().includes('cancel')}
                >
                  {selectedReserva.estado.toLowerCase().includes('cancel')
                    ? '❌ Ya Cancelada'
                    : '❌ Cancelar Reserva'
                  }
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 DEBUG INFO (solo en desarrollo) */}
        {process.env.NODE_ENV !== 'production' && debugInfo && (
          <div className="debug-panel">
            <details>
              <summary>🐛 Debug Info</summary>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </UserLayout>
  );
}