'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import './NotificacionesDropdown.css';

export const NotificacionesDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notificaciones,
    noLeidas,
    loading,
    marcarComoLeida,
    marcarTodasLeidas,
    eliminarNotificacion
  } = useNotificaciones();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificacionClick = async (id: number, leida: boolean) => {
    if (!leida) {
      await marcarComoLeida(id);
    }
  };

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return fechaObj.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getIconoTipo = (tipo?: string | null) => {
    switch (tipo) {
      case 'RESERVA': return '📅';
      case 'PAGO': return '💰';
      case 'SISTEMA': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="notificaciones-dropdown" ref={dropdownRef}>
      <button 
        className="notificaciones-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {noLeidas > 0 && (
          <span className="notificaciones-badge">{noLeidas > 99 ? '99+' : noLeidas}</span>
        )}
      </button>

      {isOpen && (
        <div className="notificaciones-panel">
          <div className="notificaciones-header">
            <h3>Notificaciones</h3>
            {noLeidas > 0 && (
              <button 
                className="btn-marcar-todas"
                onClick={marcarTodasLeidas}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notificaciones-list">
            {loading && notificaciones.length === 0 ? (
              <div className="notificaciones-loading">
                <div className="spinner-small"></div>
                <p>Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="notificaciones-empty">
                <span className="empty-icon">🔔</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map(notif => (
                <div 
                  key={notif.id_notificacion}
                  className={`notificacion-item ${!notif.leida ? 'no-leida' : ''}`}
                  onClick={() => handleNotificacionClick(notif.id_notificacion, notif.leida)}
                >
                  <div className="notificacion-icono">
                    {getIconoTipo(notif.tipo)}
                  </div>
                  
                  <div className="notificacion-contenido">
                    <div className="notificacion-titulo">
                      {notif.titulo}
                      {!notif.leida && (
                        <span className="punto-no-leido"></span>
                      )}
                    </div>
                    <div className="notificacion-mensaje">{notif.cuerpo}</div>
                    <div className="notificacion-fecha">
                      {formatearFecha(notif.created_at)}
                    </div>
                  </div>

                  <button
                    className="btn-eliminar-notif"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarNotificacion(notif.id_notificacion);
                    }}
                    aria-label="Eliminar notificación"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="notificaciones-footer">
              <button className="btn-ver-todas">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};