'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../../dashboard.css';

interface Review {
  id: string;
  cancha: string;
  usuario: string;
  comentario: string;
  fecha: string;
  estado: 'Activo' | 'Inactivo' | 'Reportada';
}

export default function UserReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const nombreUsuario = decodeURIComponent(params.nombre as string);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Datos de ejemplo (deben coincidir con la página principal)
  const allReviews: Review[] = [
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
    }
  ];

  // Filtrar reseñas del usuario específico
  const userReviews = allReviews.filter(review => review.usuario === nombreUsuario);

  // Función para navegar al detalle de la reseña
  const viewReviewDetail = (reviewId: string) => {
    router.push(`/admin/resenas/${reviewId}`);
  };

  // Calcular paginación
  const totalPages = Math.ceil(userReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = userReviews.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="admin-page-layout">
      {/* Header Mejorado */}
      <div className="user-reviews-header">
        <div className="admin-header-main">
          <button 
            className="btn-back"
            onClick={() => router.back()}
            title="Volver a la lista de reseñas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="user-reviews-title">Reseñas de: {nombreUsuario}</h1>
            <p className="user-reviews-subtitle">
              {userReviews.length} reseña{userReviews.length !== 1 ? 's' : ''} encontrada{userReviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="admin-header-actions">
          <button className="btn-export">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar reseñas
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="admin-content">
        {userReviews.length === 0 ? (
          <div className="admin-empty-state">
            <p>No se encontraron reseñas para el usuario &quot;{nombreUsuario}&quot;</p>
            <button 
              className="btn-primary" 
              onClick={() => router.back()}
            >
              Volver a la lista
            </button>
          </div>
        ) : (
          <>
            {/* Filtros rápidos */}
            <div className="admin-filters">
              <button className="filter-btn active">
                Todas ({userReviews.length})
              </button>
              <button className="filter-btn">
                Activas ({userReviews.filter(r => r.estado === 'Activo').length})
              </button>
              <button className="filter-btn">
                Inactivas ({userReviews.filter(r => r.estado === 'Inactivo').length})
              </button>
              <button className="filter-btn">
                Reportadas ({userReviews.filter(r => r.estado === 'Reportada').length})
              </button>
            </div>

            {/* Tabla de Reseñas Mejorada */}
            <div className="user-reviews-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cancha</th>
                    <th>Comentario</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReviews.map((review) => (
                    <tr key={review.id}>
                      <td data-label="Cancha">
                        <div className="admin-cell-text">{review.cancha}</div>
                      </td>
                      <td data-label="Comentario">
                        <div className="admin-cell-comment">
                          {review.comentario.length > 40 
                            ? `${review.comentario.substring(0, 40)}...` 
                            : review.comentario}
                        </div>
                      </td>
                      <td data-label="Fecha">
                        <div className="admin-cell-text">{review.fecha}</div>
                      </td>
                      <td data-label="Estado">
                        <span className={`status-badge ${
                          review.estado === 'Activo' ? 'status-activo' :
                          review.estado === 'Inactivo' ? 'status-inactivo' :
                          'status-reportada'
                        }`}>
                          {review.estado}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="admin-actions-container">
                          {/* Botón Ver/Leer - Abre página de detalle */}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Mejorada */}
            <div className="user-reviews-pagination">
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, userReviews.length)} de {userReviews.length} reseñas
                </div>
                <div className="admin-pagination-controls">
                  <button 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="btn-pagination"
                  >
                    Anterior
                  </button>
                  <span className="pagination-current">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="btn-pagination"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}