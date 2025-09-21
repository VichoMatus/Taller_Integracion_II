'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../dashboard.css';

interface Court {
  id: string;
  name: string;
  location: string;
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  lastAccess: string;
  description: string;
  capacity: number;
  price: number;
  amenities: string[];
  contactInfo: string;
  operatingHours: string;
}

export default function EditCourtPage() {
  const router = useRouter();
  const params = useParams();
  const courtId = params.id as string;

  // Datos de ejemplo para la cancha
  const getCourtData = (id: string): Court | null => {
    const courtsData: { [key: string]: Court } = {
      '1': {
        id: '1',
        name: 'Cancha Central',
        location: 'Av. Principal 123',
        status: 'Activo',
        lastAccess: 'Hoy, 19:03',
        description: 'Cancha principal de fútbol con césped sintético de última generación.',
        capacity: 22,
        price: 25000,
        amenities: ['Césped sintético', 'Iluminación LED', 'Vestuarios'],
        contactInfo: 'Administrador: Juan Pérez - Teléfono: +56 9 1234 5678',
        operatingHours: 'Lunes a Domingo: 08:00 - 22:00'
      },
      '2': {
        id: '2',
        name: 'Cancha Norte',
        location: 'Av. Norte 456',
        status: 'Inactivo',
        lastAccess: '28-08-2025',
        description: 'Cancha de básquetbol techada con piso de madera.',
        capacity: 10,
        price: 18000,
        amenities: ['Piso de madera', 'Canastas reglamentarias', 'Vestuarios'],
        contactInfo: 'Administrador: María González - Teléfono: +56 9 8765 4321',
        operatingHours: 'Lunes a Viernes: 09:00 - 21:00'
      },
      '3': {
        id: '3',
        name: 'Cancha Sur',
        location: 'Av. Sur 789',
        status: 'Por revisar',
        lastAccess: 'Ayer, 16:45',
        description: 'Cancha multiuso para tenis y pádel.',
        capacity: 4,
        price: 15000,
        amenities: ['Superficie de arcilla', 'Red profesional', 'Iluminación'],
        contactInfo: 'Administrador: Carlos Rodríguez - Teléfono: +56 9 5555 6666',
        operatingHours: 'Lunes a Domingo: 07:00 - 20:00'
      }
    };
    return courtsData[id] || null;
  };

  const court = getCourtData(courtId);

  const goBack = () => {
    router.push('/admin/canchas');
  };

  const handleSave = () => {
    console.log('Guardando cambios para cancha:', courtId);
    router.push('/admin/canchas');
  };

  if (!court) {
    return (
      <div className="admin-page-layout">
        <div className="error-container">
          <h2>Cancha no encontrada</h2>
          <p>No se pudo encontrar la información de la cancha solicitada.</p>
          <button onClick={goBack} className="btn-volver">
            Volver a Canchas
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
          <h1 className="admin-page-title">Información de Cancha</h1>
        </div>
        
        <div className="admin-header-buttons">
          <button className="btn-guardar" onClick={handleSave}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar Cancha
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="edit-court-container">
        <div className="edit-court-card">
          {/* Información Básica */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información Básica</h3>
            <div className="edit-form-grid">
              <div className="edit-info-item">
                <span className="edit-info-label">Nombre:</span>
                <span className="edit-info-value">{court.name}</span>
              </div>
              
              <div className="edit-info-item">
                <span className="edit-info-label">Ubicación:</span>
                <span className="edit-info-value">{court.location}</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Capacidad:</span>
                <span className="edit-info-value">{court.capacity} personas</span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Precio por hora:</span>
                <span className="edit-info-value">${court.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Estado y Operación */}
          <div className="edit-section">
            <h3 className="edit-section-title">Estado y Operación</h3>
            <div className="edit-form-grid">
              <div className="edit-info-item">
                <span className="edit-info-label">Estado:</span>
                <span className={`status-badge ${
                  court.status === 'Activo' ? 'status-activo' :
                  court.status === 'Inactivo' ? 'status-inactivo' :
                  'status-por-revisar'
                }`}>
                  {court.status}
                </span>
              </div>

              <div className="edit-info-item">
                <span className="edit-info-label">Horarios de Operación:</span>
                <span className="edit-info-value">{court.operatingHours}</span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="edit-section">
            <h3 className="edit-section-title">Descripción</h3>
            <div className="edit-info-item">
              <p className="edit-description-text">{court.description}</p>
            </div>
          </div>

          {/* Servicios y Comodidades */}
          <div className="edit-section">
            <h3 className="edit-section-title">Servicios y Comodidades</h3>
            <div className="amenities-container">
              {court.amenities.map((amenity: string, index: number) => (
                <span key={index} className="amenity-tag-readonly">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información de Contacto</h3>
            <div className="edit-info-item">
              <p className="edit-contact-text">{court.contactInfo}</p>
            </div>
          </div>

          {/* Información de Acceso */}
          <div className="edit-section">
            <h3 className="edit-section-title">Información de Acceso</h3>
            <div className="edit-info-item">
              <span className="edit-info-label">Último acceso:</span>
              <span className="edit-info-value">{court.lastAccess}</span>
            </div>
            <div className="edit-info-item">
              <span className="edit-info-label">ID de la cancha:</span>
              <span className="edit-info-value">{court.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}