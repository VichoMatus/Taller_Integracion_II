'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../dashboard.css';

interface Reservation {
  id: string;
  nombre: string;
  cancha: string;
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  fecha: string;
}

export default function ReservasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Función para navegar a editar reserva
  const editReservation = (reservationId: string) => {
    router.push(`/admin/reservas/${reservationId}`);
  };

  // Datos de ejemplo basados en la imagen
  const reservations: Reservation[] = [
    { id: '1', nombre: 'Miguel Chamo', cancha: 'Cancha Central', status: 'Activo', fecha: 'Hoy, 19:03' },
    { id: '2', nombre: 'Miguel Chamo', cancha: 'Cancha Central', status: 'Inactivo', fecha: '28-08-2025' },
    { id: '3', nombre: 'Miguel Chamo', cancha: 'Cancha Central', status: 'Por revisar', fecha: 'Ayer, 16:45' },
    { id: '4', nombre: 'Miguel Chamo', cancha: 'Cancha Central', status: 'Activo', fecha: 'Hoy, 11:35' },
    { id: '5', nombre: 'Ana García', cancha: 'Cancha Norte', status: 'Activo', fecha: 'Hoy, 08:20' },
    { id: '6', nombre: 'Carlos López', cancha: 'Cancha Sur', status: 'Inactivo', fecha: '25-08-2025' },
  ];

  // Filtrar reservas basado en búsqueda
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.cancha.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Reservas</h1>
        
        <div className="admin-controls">
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Reserva Manual
          </button>
        </div>
      </div>      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Reservas</h2>
          
          <div className="admin-search-filter">
            {/* Búsqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtro */}
            <button className="btn-filtrar">
              Filtrar
            </button>
          </div>
        </div>
        
        {/* Tabla Principal */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cancha</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <div className="admin-cell-title">{reservation.nombre}</div>
                  </td>
                  <td>
                    <div className="admin-cell-subtitle">{reservation.cancha}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      reservation.status === 'Activo' ? 'status-activo' :
                      reservation.status === 'Inactivo' ? 'status-inactivo' :
                      'status-por-revisar'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-cell-text">{reservation.fecha}</div>
                  </td>
                  <td>
                    <div className="admin-actions-container">
                      {/* Botón Editar */}
                      <button 
                        className="btn-action btn-editar" 
                        title="Editar"
                        onClick={() => editReservation(reservation.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Botón Aprobar/Check */}
                      <button className="btn-action btn-aprobar" title="Aprobar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      
                      {/* Botón Eliminar */}
                      <button className="btn-action btn-eliminar" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="admin-pagination-container">
          <div className="admin-pagination-info">
            mostrando {startIndex + 1} de {Math.min(startIndex + itemsPerPage, filteredReservations.length)} reservas
          </div>
          
          <div className="admin-pagination-controls">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-pagination"
            >
              Anterior
            </button>
            
            <div className="admin-pagination-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`btn-pagination ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-pagination"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}