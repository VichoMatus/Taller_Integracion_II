'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../dashboard.css';

interface Review {
  id: string;
  cancha: string;
  usuario: string;
  comentario: string;
  fecha: string;
  estado: 'Activo' | 'Inactivo' | 'Reportada';
}

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Datos de ejemplo (deben coincidir con la página principal)
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
    }
  ];

  // Encontrar la reseña por ID
  const review = reviews.find(r => r.id === id);

  if (!review) {
    return (
      <div className="admin-page-layout">
        <div className="admin-header">
          <h1 className="admin-title">Reseña no encontrada</h1>
        </div>
        <div className="admin-content">
          <p>No se pudo encontrar la reseña solicitada.</p>
          <button 
            className="btn-primary" 
            onClick={() => router.back()}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'star-filled' : 'star-empty'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="admin-page-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-main">
          <button 
            className="btn-back"
            onClick={() => router.back()}
            title="Volver a la lista"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="admin-title">Detalle de Reseña</h1>
        </div>
        <div className="admin-header-actions">
          <span className={`status-badge ${
            review.estado === 'Activo' ? 'status-activo' :
            review.estado === 'Inactivo' ? 'status-inactivo' :
            'status-reportada'
          }`}>
            {review.estado}
          </span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="admin-content">
        <div className="review-detail-container">
          
          {/* Información del Usuario */}
          <div className="review-detail-section">
            <h2 className="review-detail-section-title">Información del Usuario</h2>
            <div className="review-detail-grid">
              <div className="review-detail-item">
                <span className="review-detail-label">Usuario</span>
                <span className="review-detail-value">{review.usuario}</span>
              </div>
              <div className="review-detail-item">
                <span className="review-detail-label">Cancha</span>
                <span className="review-detail-value">{review.cancha}</span>
              </div>
              <div className="review-detail-item">
                <span className="review-detail-label">Fecha</span>
                <span className="review-detail-value">{review.fecha}</span>
              </div>
            </div>
          </div>

          {/* Comentario Completo */}
          <div className="review-detail-section">
            <h2 className="review-detail-section-title">Comentario Completo</h2>
            <div className="review-comment-full">
              {review.comentario}
            </div>
          </div>

          {/* Acciones */}
          <div className="review-detail-section">
            <h2 className="review-detail-section-title">Acciones de Moderación</h2>
            <div className="review-detail-actions">
              <button className="btn-action-detail btn-aprobar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aprobar Reseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}