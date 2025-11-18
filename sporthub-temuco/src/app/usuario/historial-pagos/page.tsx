'use client';
import React, { useState, useEffect } from 'react';
import './historial-pagos.css'; 
import { Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';

// 🔥 TIPOS PARA PAGOS
interface Payment {
  id: number;
  reservaId: number;
  monto: number;
  fecha: string;
  estado: 'completado' | 'pendiente' | 'fallido' | 'reembolsado';
  metodoPago: 'tarjeta' | 'transferencia' | 'efectivo' | 'webpay';
  cancha: {
    nombre: string;
    complejo: string;
    deporte: string;
  };
  transactionId?: string;
  descripcion?: string;
}

// 🔥 DATOS ESTÁTICOS DE PAGOS (mientras no tengamos API)
const staticPayments: Payment[] = [
  {
    id: 1,
    reservaId: 101,
    monto: 35000,
    fecha: '2024-11-01T14:30:00Z',
    estado: 'completado',
    metodoPago: 'webpay',
    cancha: {
      nombre: 'Cancha Fútbol 1',
      complejo: 'Complejo Deportivo Norte',
      deporte: 'Fútbol'
    },
    transactionId: 'WP123456789',
    descripcion: 'Pago reserva cancha fútbol - 2 horas'
  },
  {
    id: 2,
    reservaId: 98,
    monto: 42000,
    fecha: '2024-10-28T16:00:00Z',
    estado: 'completado',
    metodoPago: 'tarjeta',
    cancha: {
      nombre: 'Cancha Futsal 2',
      complejo: 'Complejo Deportivo Centro',
      deporte: 'Futsal'
    },
    transactionId: 'TC987654321',
    descripcion: 'Pago reserva cancha futsal - 1.5 horas'
  },
  {
    id: 3,
    reservaId: 95,
    monto: 28000,
    fecha: '2024-10-25T18:45:00Z',
    estado: 'completado',
    metodoPago: 'transferencia',
    cancha: {
      nombre: 'Cancha Futbolito 3',
      complejo: 'Complejo Deportivo Sur',
      deporte: 'Futbolito'
    },
    transactionId: 'TR456789123',
    descripcion: 'Pago reserva cancha futbolito - 1 hora'
  },
  {
    id: 4,
    reservaId: 92,
    monto: 50000,
    fecha: '2024-10-20T20:15:00Z',
    estado: 'reembolsado',
    metodoPago: 'webpay',
    cancha: {
      nombre: 'Cancha Fútbol 2',
      complejo: 'Complejo Deportivo Norte',
      deporte: 'Fútbol'
    },
    transactionId: 'WP741852963',
    descripcion: 'Reembolso por cancelación - lluvia'
  },
  {
    id: 5,
    reservaId: 89,
    monto: 38000,
    fecha: '2024-10-15T10:30:00Z',
    estado: 'fallido',
    metodoPago: 'tarjeta',
    cancha: {
      nombre: 'Cancha Futsal 1',
      complejo: 'Complejo Deportivo Centro',
      deporte: 'Futsal'
    },
    transactionId: 'TC159753486',
    descripcion: 'Pago fallido - fondos insuficientes'
  },
  {
    id: 6,
    reservaId: 87,
    monto: 33000,
    fecha: '2024-10-12T15:00:00Z',
    estado: 'completado',
    metodoPago: 'efectivo',
    cancha: {
      nombre: 'Cancha Fútbol 3',
      complejo: 'Complejo Deportivo Sur',
      deporte: 'Fútbol'
    },
    descripcion: 'Pago en efectivo en recepción'
  }
];

export default function HistorialPagos() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuario");
  
  // 🔥 ESTADOS IGUALES AL HISTORIAL DE RESERVAS
  const [activeTab, setActiveTab] = useState<'completados' | 'historial' | 'estadisticas'>('completados');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'completado' | 'pendiente' | 'fallido' | 'reembolsado'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // 🔥 CARGAR PAGOS (usando misma estructura que reservas)
  const cargarPagos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Aquí iría la llamada a la API de pagos
      // const response = await pagoService.getPagosByUsuario(user?.id);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📊 [HistorialPagos] Cargando datos estáticos...');
      setPayments(staticPayments);
      setUserName("Usuario");
      
    } catch (error: any) {
      console.error('❌ [HistorialPagos] Error cargando pagos:', error);
      setError('Error al cargar el historial de pagos');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  // 🔥 FUNCIONES AUXILIARES IGUALES A RESERVAS
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'confirmada';
      case 'pendiente': return 'pendiente';
      case 'fallido': return 'cancelada';
      case 'reembolsado': return 'reembolsado';
      default: return 'confirmada';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado': return '✅';
      case 'pendiente': return '⏳';
      case 'fallido': return '❌';
      case 'reembolsado': return '↩️';
      default: return '✅';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'webpay': return '💳';
      case 'tarjeta': return '💳';
      case 'transferencia': return '🏦';
      case 'efectivo': return '💵';
      default: return '💰';
    }
  };

  // 🔥 FUNCIONES DE FILTRADO IGUALES A RESERVAS
  const getPagosCompletados = () => {
    return payments.filter(payment => 
      payment.estado === 'completado' || payment.estado === 'reembolsado'
    );
  };

  const getHistorialPagos = () => {
    return payments.filter(payment => 
      payment.estado === 'fallido' || payment.estado === 'pendiente'
    );
  };

  const filtrarPagos = (pagosBase: Payment[]) => {
    let filtered = pagosBase;

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(payment => payment.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.id.toString().includes(searchTerm) ||
        payment.cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.cancha.complejo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.metodoPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // 🔥 CALCULAR ESTADÍSTICAS IGUALES A RESERVAS
  const getEstadisticas = () => {
    const total = payments.length;
    const completados = payments.filter(p => p.estado === 'completado').length;
    const pendientes = payments.filter(p => p.estado === 'pendiente').length;
    const fallidos = payments.filter(p => p.estado === 'fallido').length;
    const reembolsados = payments.filter(p => p.estado === 'reembolsado').length;
    const totalGastado = payments.filter(p => p.estado === 'completado').reduce((sum, p) => sum + p.monto, 0);
    const totalReembolsado = payments.filter(p => p.estado === 'reembolsado').reduce((sum, p) => sum + p.monto, 0);
    const promedioPago = completados > 0 ? totalGastado / completados : 0;

    return {
      total,
      completados,
      pendientes,
      fallidos,
      reembolsados,
      totalGastado,
      totalReembolsado,
      promedioPago
    };
  };

  const stats = getEstadisticas();
  const pagosCompletados = filtrarPagos(getPagosCompletados());
  const historialPagos = filtrarPagos(getHistorialPagos());

  return (
    <UserLayout userName={userName} notificationCount={2}>
      <div className="reservas-container">
        {/* 🔥 HEADER IGUAL AL DE RESERVAS */}
        <div className="reservas-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <span className="title-icon">💳</span>
                Historial de Pagos
              </h1>
              <p className="page-subtitle">
                Gestiona y revisa todos tus pagos deportivos en un solo lugar
              </p>
            </div>
            <div className="header-actions">
              <Button onClick={cargarPagos} disabled={isLoading} className="refresh-btn">
                {isLoading ? '⏳ Cargando...' : '🔄 Actualizar'}
              </Button>
            </div>
          </div>

          {/* 🔥 ESTADÍSTICAS IGUALES A RESERVAS */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-number">{formatPrice(stats.totalGastado)}</span>
                <span className="stat-label">Total Gastado</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">↩️</div>
              <div className="stat-content">
                <span className="stat-number">{formatPrice(stats.totalReembolsado)}</span>
                <span className="stat-label">Total Reembolsado</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <span className="stat-number">{stats.pendientes}</span>
                <span className="stat-label">Pagos Pendientes</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <span className="stat-number">{stats.fallidos}</span>
                <span className="stat-label">Pagos Fallidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NAVEGACIÓN POR PESTAÑAS IGUAL A RESERVAS */}
        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'completados' ? 'active' : ''}`}
              onClick={() => setActiveTab('completados')}
            >
              <span className="tab-icon">💳</span>
              <span>Pagos Completados</span>
              <span className="tab-badge">{pagosCompletados.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
              onClick={() => setActiveTab('historial')}
            >
              <span className="tab-icon">📚</span>
              <span>Historial</span>
              <span className="tab-badge">{historialPagos.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setActiveTab('estadisticas')}
            >
              <span className="tab-icon">📈</span>
              <span>Estadísticas</span>
            </button>
          </div>

          {/* 🔥 FILTROS Y BÚSQUEDA IGUALES A RESERVAS */}
          {(activeTab === 'completados' || activeTab === 'historial') && (
            <div className="filters-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por ID, cancha, complejo o método..."
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
                  <option value="todos">🔍 Todos los estados</option>
                  <option value="completado">✅ Completados</option>
                  <option value="pendiente">⏳ Pendientes</option>
                  <option value="fallido">❌ Fallidos</option>
                  <option value="reembolsado">↩️ Reembolsados</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 🔥 CONTENIDO PRINCIPAL IGUAL A RESERVAS */}
        <div className="main-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3>Cargando tus pagos...</h3>
              <p>Obteniendo la información más reciente</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error al cargar pagos</h3>
              <p>{error}</p>
              <Button onClick={cargarPagos} className="retry-btn">
                🔄 Reintentar
              </Button>
            </div>
          ) : (
            <>
              {/* 🔥 PESTAÑA PAGOS COMPLETADOS */}
              {activeTab === 'completados' && (
                <div className="tab-content">
                  {pagosCompletados.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <h3>No tienes pagos completados</h3>
                      <p>Cuando realices tus primeros pagos, aparecerán aquí</p>
                      <Button className="cta-btn">
                        🏟️ Explorar Canchas
                      </Button>
                    </div>
                  ) : (
                    <div className="history-list">
                      {pagosCompletados.map((payment) => (
                        <div
                          key={payment.id}
                          className="history-item"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                        >
                          <div className="history-date">
                            <div className="date-circle">
                              <span className="date-day">{new Date(payment.fecha).getDate()}</span>
                              <span className="date-month">
                                {new Date(payment.fecha).toLocaleDateString('es-CL', { month: 'short' })}
                              </span>
                            </div>
                          </div>

                          <div className="history-content">
                            <div className="history-header">
                              <h4>{getPaymentMethodIcon(payment.metodoPago)} {formatPrice(payment.monto)}</h4>
                              <span className={`status-badge ${getStatusColor(payment.estado)}`}>
                                {getStatusIcon(payment.estado)} {payment.estado}
                              </span>
                            </div>

                            <div className="history-details">
                              <span>🏟️ {payment.cancha.nombre}</span>
                              <span>🏢 {payment.cancha.complejo}</span>
                              <span>⏰ {formatTime(payment.fecha)}</span>
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

              {/* 🔥 PESTAÑA HISTORIAL */}
              {activeTab === 'historial' && (
                <div className="tab-content">
                  {historialPagos.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📚</div>
                      <h3>Sin historial de pagos pendientes o fallidos</h3>
                      <p>Todos tus pagos están completados exitosamente</p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {historialPagos.map((payment) => (
                        <div
                          key={payment.id}
                          className="history-item"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                        >
                          <div className="history-date">
                            <div className="date-circle">
                              <span className="date-day">{new Date(payment.fecha).getDate()}</span>
                              <span className="date-month">
                                {new Date(payment.fecha).toLocaleDateString('es-CL', { month: 'short' })}
                              </span>
                            </div>
                          </div>

                          <div className="history-content">
                            <div className="history-header">
                              <h4>{getPaymentMethodIcon(payment.metodoPago)} {formatPrice(payment.monto)}</h4>
                              <span className={`status-badge ${getStatusColor(payment.estado)}`}>
                                {getStatusIcon(payment.estado)} {payment.estado}
                              </span>
                            </div>

                            <div className="history-details">
                              <span>🏟️ {payment.cancha.nombre}</span>
                              <span>🏢 {payment.cancha.complejo}</span>
                              <span>⏰ {formatTime(payment.fecha)}</span>
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
                        <h3>📊 Resumen de Pagos</h3>
                      </div>
                      <div className="stats-content">
                        <div className="stat-item">
                          <span className="stat-label">Total de pagos:</span>
                          <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Pagos completados:</span>
                          <span className="stat-value success">{stats.completados}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Pagos pendientes:</span>
                          <span className="stat-value warning">{stats.pendientes}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Pagos fallidos:</span>
                          <span className="stat-value danger">{stats.fallidos}</span>
                        </div>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-header">
                        <h3>💰 Información Financiera</h3>
                      </div>
                      <div className="stats-content">
                        <div className="stat-item">
                          <span className="stat-label">Total gastado:</span>
                          <span className="stat-value">{formatPrice(stats.totalGastado)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total reembolsado:</span>
                          <span className="stat-value">{formatPrice(stats.totalReembolsado)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Promedio por pago:</span>
                          <span className="stat-value">{formatPrice(stats.promedioPago)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reembolsos:</span>
                          <span className="stat-value">{stats.reembolsados}</span>
                        </div>
                      </div>
                    </div>

                    <div className="stats-card full-width">
                      <div className="stats-header">
                        <h3>📈 Análisis de Pagos</h3>
                      </div>
                      <div className="stats-content">
                        <div className="activity-summary">
                          <p>Has realizado un total de <strong>{stats.total} pagos</strong> en la plataforma.</p>
                          {stats.total > 0 && (
                            <>
                              <p>Tu tasa de éxito en pagos es del <strong>{((stats.completados / stats.total) * 100).toFixed(1)}%</strong></p>
                              <p>Has gastado un promedio de <strong>{formatPrice(stats.promedioPago)}</strong> por pago.</p>
                              {stats.reembolsados > 0 && (
                                <p>Has recibido <strong>{stats.reembolsados} reembolsos</strong> por un total de <strong>{formatPrice(stats.totalReembolsado)}</strong></p>
                              )}
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

        {/* 🔥 MODAL DE DETALLES IGUAL A RESERVAS */}
        {showModal && selectedPayment && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles del Pago #{selectedPayment.id}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-status">
                  <span className={`status-badge large ${getStatusColor(selectedPayment.estado)}`}>
                    {getStatusIcon(selectedPayment.estado)} {selectedPayment.estado}
                  </span>
                </div>

                <div className="modal-details">
                  <div className="detail-group">
                    <h4>💳 Información del Pago</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Monto:</span>
                        <span className="value price">{formatPrice(selectedPayment.monto)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDate(selectedPayment.fecha)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Método de Pago:</span>
                        <span className="value">
                          {getPaymentMethodIcon(selectedPayment.metodoPago)} {selectedPayment.metodoPago}
                        </span>
                      </div>
                      {selectedPayment.transactionId && (
                        <div className="detail-item">
                          <span className="label">ID Transacción:</span>
                          <span className="value code">{selectedPayment.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4>🏟️ Información de la Reserva</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Cancha:</span>
                        <span className="value">{selectedPayment.cancha.nombre}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Complejo:</span>
                        <span className="value">{selectedPayment.cancha.complejo}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Deporte:</span>
                        <span className="value">{selectedPayment.cancha.deporte}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Reserva ID:</span>
                        <span className="value">#{selectedPayment.reservaId}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.descripcion && (
                    <div className="detail-group">
                      <h4>📝 Descripción</h4>
                      <p className="notes">{selectedPayment.descripcion}</p>
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
                {selectedPayment.estado === 'completado' && (
                  <Button
                    className="btn-download"
                    onClick={() => alert('Descarga de comprobante en desarrollo')}
                  >
                    📄 Descargar Comprobante
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}