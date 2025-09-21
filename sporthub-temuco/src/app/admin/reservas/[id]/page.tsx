'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../dashboard.css';

interface Reservation {
  id: string;
  nombre: string;
  cancha: string;
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  fecha: string;
  horaInicio: string;
  horaFin: string;
  telefono: string;
  email: string;
  tipoReserva: string;
  precioTotal: number;
  metodoPago: string;
  notas: string;
  fechaCreacion: string;
}

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  // Datos de ejemplo para las reservas
  const getReservationData = (id: string): Reservation | null => {
    const reservationsData: { [key: string]: Reservation } = {
      '1': {
        id: '1',
        nombre: 'Miguel Chamo',
        cancha: 'Cancha Central',
        status: 'Activo',
        fecha: 'Hoy, 19:03',
        horaInicio: '14:00',
        horaFin: '16:00',
        telefono: '+56 9 1234 5678',
        email: 'miguel.chamo@email.com',
        tipoReserva: 'Partido Amistoso',
        precioTotal: 50000,
        metodoPago: 'Transferencia',
        notas: 'Reserva para partido de fútbol entre amigos. Solicita pelotas adicionales.',
        fechaCreacion: '15-09-2025'
      },
      '2': {
        id: '2',
        nombre: 'Ana García',
        cancha: 'Cancha Norte',
        status: 'Inactivo',
        fecha: '28-08-2025',
        horaInicio: '10:00',
        horaFin: '12:00',
        telefono: '+56 9 8765 4321',
        email: 'ana.garcia@email.com',
        tipoReserva: 'Entrenamiento',
        precioTotal: 36000,
        metodoPago: 'Efectivo',
        notas: 'Entrenamiento de básquetbol para equipo juvenil. Requiere red en buenas condiciones.',
        fechaCreacion: '20-08-2025'
      },
      '3': {
        id: '3',
        nombre: 'Carlos López',
        cancha: 'Cancha Sur',
        status: 'Por revisar',
        fecha: 'Ayer, 16:45',
        horaInicio: '18:00',
        horaFin: '20:00',
        telefono: '+56 9 5555 6666',
        email: 'carlos.lopez@email.com',
        tipoReserva: 'Torneo',
        precioTotal: 30000,
        metodoPago: 'Tarjeta',
        notas: 'Partido de tenis para torneo local. Verificar estado de la superficie.',
        fechaCreacion: '18-09-2025'
      },
      '4': {
        id: '4',
        nombre: 'Laura Martínez',
        cancha: 'Cancha Central',
        status: 'Activo',
        fecha: 'Hoy, 11:35',
        horaInicio: '09:00',
        horaFin: '11:00',
        telefono: '+56 9 7777 8888',
        email: 'laura.martinez@email.com',
        tipoReserva: 'Clase Particular',
        precioTotal: 40000,
        metodoPago: 'Transferencia',
        notas: 'Clase de fútbol para niños. Solicita conos y material de entrenamiento.',
        fechaCreacion: '19-09-2025'
      },
      '5': {
        id: '5',
        nombre: 'Pedro Sánchez',
        cancha: 'Cancha Norte',
        status: 'Activo',
        fecha: 'Hoy, 08:20',
        horaInicio: '07:00',
        horaFin: '09:00',
        telefono: '+56 9 9999 0000',
        email: 'pedro.sanchez@email.com',
        tipoReserva: 'Partido Liga',
        precioTotal: 60000,
        metodoPago: 'Transferencia',
        notas: 'Partido oficial de liga. Requiere árbitro y cronometraje oficial.',
        fechaCreacion: '16-09-2025'
      },
      '6': {
        id: '6',
        nombre: 'Isabella Torres',
        cancha: 'Cancha Sur',
        status: 'Inactivo',
        fecha: '25-08-2025',
        horaInicio: '16:00',
        horaFin: '18:00',
        telefono: '+56 9 1111 2222',
        email: 'isabella.torres@email.com',
        tipoReserva: 'Evento Corporativo',
        precioTotal: 80000,
        metodoPago: 'Transferencia',
        notas: 'Evento de empresa. Incluye catering y equipamiento especial.',
        fechaCreacion: '20-08-2025'
      }
    };
    return reservationsData[id] || null;
  };

  const reservation = getReservationData(reservationId);

  const goBack = () => {
    router.push('/admin/reservas');
  };

  const handleSave = () => {
    console.log('Guardando cambios para reserva:', reservationId);
    router.push('/admin/reservas');
  };

  if (!reservation) {
    return (
      <div className="admin-page-layout">
        <div className="error-container">
          <h2>Reserva no encontrada</h2>
          <p>No se pudo encontrar la información de la reserva solicitada.</p>
          <button onClick={goBack} className="btn-volver">
            Volver a Reservas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-layout">
      {/* Header */}
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <button onClick={goBack} className="btn-volver">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Información de Reserva</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button className="btn-guardar" onClick={handleSave}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar Reserva
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="edit-court-container">
        <div className="edit-court-card">
          {/* Información del Cliente */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información del Cliente</h3>
            <div className="edit-form-grid">
              <div className="edit-info-item">
                <span className="edit-info-label">Nombre Completo:</span>
                <span className="edit-info-value">{reservation.nombre}</span>
              </div>
              
              <div className="edit-info-item">
                <span className="edit-info-label">Teléfono:</span>
                <span className="edit-info-value">{reservation.telefono}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Email:</span>
                <span className="edit-info-value">{reservation.email}</span>
              </div>
            </div>
          </div>

          {/* Detalles de la Reserva */}
          <div className="edit-section">
            <h3 className="edit-section-title">Detalles de la Reserva</h3>
            <div className="edit-form-grid">
              <div className="edit-info-item">
                <span className="edit-info-label">Cancha:</span>
                <span className="edit-info-value">{reservation.cancha}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Tipo de Reserva:</span>
                <span className="edit-info-value">{reservation.tipoReserva}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Fecha:</span>
                <span className="edit-info-value">{reservation.fecha}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Horario:</span>
                <span className="edit-info-value">{reservation.horaInicio} - {reservation.horaFin}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Estado:</span>
                <span className={`status-badge ${
                  reservation.status === 'Activo' ? 'status-activo' :
                  reservation.status === 'Inactivo' ? 'status-inactivo' :
                  'status-por-revisar'
                }`}>
                  {reservation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Financiera</h3>
            <div className="edit-form-grid">
              <div className="edit-info-item">
                <span className="edit-info-label">Precio Total:</span>
                <span className="edit-info-value">${reservation.precioTotal.toLocaleString()}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Método de Pago:</span>
                <span className="edit-info-value">{reservation.metodoPago}</span>
              </div>
            </div>
          </div>

          {/* Notas Adicionales */}
          <div className="edit-section">
            <h3 className="edit-section-title">Notas y Observaciones</h3>
            <div className="edit-info-item">
              <p className="edit-description-text">{reservation.notas}</p>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información del Sistema</h3>
            <div className="edit-info-item">
              <span className="edit-info-label">Fecha de Creación:</span>
              <span className="edit-info-value">{reservation.fechaCreacion}</span>
            </div>
            <div className="edit-info-item">
              <span className="edit-info-label">ID de la Reserva:</span>
              <span className="edit-info-value">{reservation.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}