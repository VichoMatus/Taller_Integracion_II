'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { resenaService } from '@/services/resenaService';
import { Resena } from '@/types/resena';
import '../../dashboard.css';

export default function ViewResenaPage() {
  const router = useRouter();
  const params = useParams();
  const resenaId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [resena, setResena] = useState<Resena | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarResena = async () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando reseña ID:', resenaId);
        
        const data = await resenaService.obtenerResena(parseInt(resenaId));
        console.log('✅ Reseña cargada:', data);
        
        setResena(data);
      } catch (err: any) {
        console.error('❌ Error al cargar reseña:', err);
        
        // Mensaje amigable según el tipo de error
        let mensajeError = 'Error al cargar la reseña';
        
        if (err.message && err.message.includes('missing FROM-clause')) {
          mensajeError = '⚠️ El endpoint de FastAPI para obtener reseñas individuales no está completamente implementado. Por ahora, solo puedes ver reseñas desde la lista principal.';
        } else if (err.message && err.message.includes('no encontrada')) {
          mensajeError = `La reseña con ID ${resenaId} no fue encontrada.`;
        } else if (err.message) {
          mensajeError = err.message;
        }
        
        setError(mensajeError);
      } finally {
        setLoading(false);
      }
    };

    if (resenaId) {
      cargarResena();
    }
  }, [resenaId]);

  const getCalificacionEmoji = (calificacion: number) => {
    const emojis = ['😡', '😞', '😐', '😊', '🤩'];
    return emojis[calificacion - 1] || '❓';
  };

  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <p>Cargando reseña...</p>
        </div>
      </div>
    );
  }

  if (!resena) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <p>Reseña no encontrada</p>
          <button 
            className="btn-volver"
            onClick={() => router.push('/admin/resenas')}
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">
          Detalle de Reseña #{resena.id}
        </h1>
        
        <div className="admin-controls">
          <button 
            onClick={() => router.back()} 
            className="export-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="admin-table-container">
        {/* Calificación Grande */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
            {getCalificacionEmoji(resena.calificacion)}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937' }}>
            {resena.calificacion} / 5
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {resena.calificacion === 5 ? '¡Excelente!' :
             resena.calificacion === 4 ? 'Muy bueno' :
             resena.calificacion === 3 ? 'Bueno' :
             resena.calificacion === 2 ? 'Regular' : 'Malo'}
          </div>
        </div>

        {/* Información Detallada */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="detail-item">
            <label className="detail-label">ID de Reseña</label>
            <p className="detail-value">#{resena.id}</p>
          </div>

          <div className="detail-item">
            <label className="detail-label">Usuario</label>
            <p className="detail-value">Usuario #{resena.usuarioId}</p>
          </div>

          <div className="detail-item">
            <label className="detail-label">Destino</label>
            <p className="detail-value">
              {resena.canchaId ? (
                <span style={{ 
                  backgroundColor: '#dbeafe', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  color: '#1e40af'
                }}>
                  ⚽ Cancha #{resena.canchaId}
                </span>
              ) : resena.complejoId ? (
                <span style={{ 
                  backgroundColor: '#fee2e2', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  color: '#991b1b'
                }}>
                  📍 Complejo #{resena.complejoId}
                </span>
              ) : (
                'N/A'
              )}
            </p>
          </div>

          <div className="detail-item">
            <label className="detail-label">Fecha de Creación</label>
            <p className="detail-value">{formatFecha(resena.fechaCreacion)}</p>
          </div>

          {resena.fechaActualizacion && (
            <div className="detail-item">
              <label className="detail-label">Última Actualización</label>
              <p className="detail-value">{formatFecha(resena.fechaActualizacion)}</p>
            </div>
          )}
        </div>

        {/* Comentario */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Comentario
          </h3>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.75',
            color: '#374151',
            whiteSpace: 'pre-wrap'
          }}>
            {resena.comentario || 'Sin comentario'}
          </p>
        </div>
      </div>

      <style jsx>{`
        .detail-item {
          padding: 1rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .detail-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .detail-value {
          font-size: 1.125rem;
          color: #1f2937;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
