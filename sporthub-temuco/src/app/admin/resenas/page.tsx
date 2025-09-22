'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../dashboard.css';

interface Review {
  id: string;
  cancha: string;
  usuario: string;
  comentario: string;
  fecha: string;
  estado: 'Activo' | 'Inactivo' | 'Reportada';
}

export default function ResenasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Datos de ejemplo basados en la imagen
  const reviews: Review[] = [
    { 
      id: '1', 
      cancha: 'Cancha Central', 
      usuario: 'Miguel Chamo', 
      comentario: 'Hola soy miguel y soy lindo', 
      fecha: 'Hoy, 19:03', 
      estado: 'Activo' 
    },
    { 
      id: '2', 
      cancha: 'Cancha Central', 
      usuario: 'Miguel Chamo', 
      comentario: 'Hola soy miguel y patapico es bonito', 
      fecha: '28-08-2025', 
      estado: 'Inactivo' 
    },
    { 
      id: '3', 
      cancha: 'Cancha Central', 
      usuario: 'Miguel Chamo', 
      comentario: 'Hola soy miguel y soy lindo para la venta. Esta es una reseña mucho más larga que necesita ser truncada en la tabla pero se puede leer completa en el modal. Aquí puedo escribir todo lo que quiera sobre mi experiencia en la cancha.', 
      fecha: 'Ayer, 16:45', 
      estado: 'Reportada' 
    },
    { 
      id: '4', 
      cancha: 'Cancha Central', 
      usuario: 'Miguel Chamo', 
      comentario: 'Hola soy miguel y soy lindo', 
      fecha: 'Hoy, 11:35', 
      estado: 'Activo' 
    },
    { 
      id: '5', 
      cancha: 'Cancha Norte', 
      usuario: 'Ana García', 
      comentario: 'Excelente cancha, muy bien mantenida. Las instalaciones están en perfecto estado y el césped se ve muy bien cuidado. Definitivamente volvería a reservar aquí.', 
      fecha: 'Hoy, 08:20', 
      estado: 'Activo' 
    },
    { 
      id: '6', 
      cancha: 'Cancha Sur', 
      usuario: 'Carlos López', 
      comentario: 'Necesita mejoras en la iluminación, especialmente en las esquinas donde se ve muy oscuro durante la noche.', 
      fecha: '25-08-2025', 
      estado: 'Reportada' 
    },
  ];

  // Función para navegar al detalle de la reseña
  const viewReviewDetail = (reviewId: string) => {
    router.push(`/admin/resenas/${reviewId}`);
  };

  // Función para navegar a las reseñas del usuario
  const viewUserReviews = (userName: string) => {
    router.push(`/admin/resenas/usuario/${encodeURIComponent(userName)}`);
  };

  // Filtrar reseñas basado en búsqueda
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.cancha.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comentario.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Reseñas</h1>
        
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
            Crear Reseña Manual
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Reseñas</h2>
          
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
            
            {/* Botón Buscar adicional como en la imagen */}
            <button className="btn-buscar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
        
        {/* Tabla Principal */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cancha</th>
                <th>Usuario</th>
                <th>Comentario</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <div className="admin-cell-title">{review.cancha}</div>
                  </td>
                  <td>
                    <button 
                      className="admin-user-link"
                      onClick={() => viewUserReviews(review.usuario)}
                      title={`Ver todas las reseñas de ${review.usuario}`}
                    >
                      {review.usuario}
                    </button>
                  </td>
                  <td>
                    <div className="admin-cell-comment">
                      {review.comentario.length > 40 
                        ? `${review.comentario.substring(0, 40)}...` 
                        : review.comentario}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell-text">{review.fecha}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      review.estado === 'Activo' ? 'status-activo' :
                      review.estado === 'Inactivo' ? 'status-inactivo' :
                      'status-reportada'
                    }`}>
                      {review.estado}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-container">
                      {/* Botón Ver/Leer - Abre modal */}
                      <button 
                        className="btn-action btn-ver" 
                        title="Ver comentario completo"
                        onClick={() => viewReviewDetail(review.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Botón Aprobar/Check */}
                      <button className="btn-action btn-aprobar" title="Aprobar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            mostrando {startIndex + 1} de {Math.min(startIndex + itemsPerPage, filteredReviews.length)} reseñas
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