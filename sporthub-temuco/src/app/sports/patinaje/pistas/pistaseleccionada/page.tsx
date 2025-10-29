'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar'; 
import SearchBar from '@/components/SearchBar'; 
import LocationMap from '@/components/LocationMap'; 
import styles from './page.module.css';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { canchaService } from '../../../../../services/canchaService';
import { complejosService } from '../../../../../services/complejosService';

// ⛸️ DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@centropotinaje",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Excelente pista de hielo! La superficie está perfectamente mantenida y la temperatura es ideal para patinaje artístico."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buena pista de patinaje, vestuarios con calefacción y personal muy amable. Los patines de alquiler están en excelente estado."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "La mejor pista de patinaje de Temuco. Sistema de sonido excelente para rutinas y la iluminación es perfecta."
    }
  ]
};

// ⛸️ COMPONENTE PRINCIPAL CON SUSPENSE
function PatinajePistaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [pista, setPista] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ⛸️ OBTENER ID DE LA PISTA DESDE URL
  const pistaId = searchParams?.get('id') || searchParams?.get('pista');

  useEffect(() => {
    const loadPistaData = async () => {
      if (!pistaId) {
        setError('No se especificó ID de pista');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando pista ID:', pistaId);
        
        // ⛸️ LLAMADA A LA API PARA OBTENER LA PISTA (SIN FILTRO ESTRICTO)
        const pistaData = await canchaService.getCanchaById(parseInt(pistaId));
        console.log('✅ Pista cargada:', pistaData);

        // ⛸️ OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (pistaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', pistaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(pistaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // ⛸️ USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // ⛸️ USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
            if (complejoData.latitud && complejoData.longitud) {
              coordinates = {
                lat: parseFloat(complejoData.latitud),
                lng: parseFloat(complejoData.longitud)
              };
              console.log('🗺️ Coordenadas obtenidas del complejo:', coordinates);
            }
            
          } catch (complejoError: any) {
            console.error('⚠️ Error cargando complejo, usando datos estáticos:', complejoError.message);
            // Mantener valores de fallback
          }
        }

        // ⛸️ MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedPista = {
          id: pistaData.id,
          name: `${pistaData.nombre} (Adaptado para Patinaje)`,
          
          // ⛸️ USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // ⛸️ DESCRIPCIÓN ADAPTADA
          description: `${pistaData.nombre} - Instalación deportiva ${complejoData ? `en ${complejoData.nombre}` : ''} adaptada para actividades de patinaje. Perfecta para patinaje artístico, recreativo y hockey sobre hielo.`,
          
          // ⛸️ HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 08:00 a 22:00",
          
          // ⛸️ CAPACIDAD ESPECÍFICA PARA PATINAJE
          capacity: "20 patinadores simultáneos",
          
          // ⛸️ DATOS REALES DE LA API
          rating: pistaData.rating || 4.8,
          reviews: 76, // Estático por ahora
          priceFrom: pistaData.precioPorHora || 20000,
          
          // ⛸️ IMÁGENES ESPECÍFICAS DE PATINAJE
          images: [
            `/sports/patinaje/patinaje.png` // Solo una imagen por defecto
          ],
          
          // ⛸️ AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            pistaData.activa ? "Disponible" : "No disponible",
            pistaData.techada ? "Instalación Techada" : "Instalación Exterior",
            "Adaptado para Patinaje",
            "Superficie de Hielo",
            "Alquiler de Patines",
            "Vestuarios Climatizados"
          ],
          
          // ⛸️ CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // ⛸️ INFORMACIÓN ADICIONAL REAL
          establecimientoId: pistaData.establecimientoId,
          tipo: pistaData.tipo,
          techada: pistaData.techada,
          activa: pistaData.activa,
          
          // ⛸️ INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Complejo ${pistaData.establecimientoId}`
        };

        setPista(mappedPista);
        
      } catch (error: any) {
        console.error('❌ Error cargando pista:', error);
        setError(`Error cargando pista: ${error.message}`);
        
        // ⛸️ FALLBACK SIMPLE
        setPista({
          id: pistaId,
          name: `Instalación Deportiva #${pistaId} (Patinaje)`,
          location: "Av. Alemania 1234, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Instalación deportiva adaptada para patinaje - ID: ${pistaId}`,
          schedule: "Lunes a Domingo • 08:00 a 22:00",
          capacity: "20 patinadores simultáneos",
          rating: 4.8,
          reviews: 76,
          priceFrom: 20000,
          images: ["/sports/patinaje/patinaje.png"],
          amenities: ["Datos offline", "Adaptado para Patinaje", "Superficie de Hielo", "Vestuarios"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Centro de Patinaje"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadPistaData();
  }, [pistaId]);

  // ⛸️ RESTO DE FUNCIONES SIN CAMBIOS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToPistas = () => {
    router.push('/sports/patinaje/pistas');
  };

  const nextImage = () => {
    if (pista && pista.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % pista.images.length);
    }
  };

  const prevImage = () => {
    if (pista && pista.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + pista.images.length) % pista.images.length);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`${styles.star} ${i < Math.floor(rating) ? styles.starFilled : ''}`}
      >
        ⭐
      </span>
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleReserve = () => {
    router.push(`/sports/reservacancha?canchaId=${pista.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${pista?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${pista?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(pista?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con patinaje? Contáctanos al ${pista?.phone} o envía un email a patinaje@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de patinaje próximamente...`);
  };

  // ⛸️ LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="patinaje" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>⛸️</div>
          <p>Cargando información de la pista de patinaje...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!pista) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="patinaje" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información de la pista de patinaje</p>
          <button onClick={() => router.push('/sports/patinaje/pistas')}>
            Volver a pistas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="patinaje" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>⛸️</span>
            <h1 className={styles.headerTitle}>Patinaje</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar pistas de patinaje..."
            sport="patinaje"
            onSearch={(term) => router.push(`/sports/patinaje/pistas?search=${encodeURIComponent(term)}`)}
            />
            <button 
              {...buttonProps}
              onClick={handleUserButtonClick}
              className={styles.userButton}
            >
              <span>👤</span>
              <span>{buttonProps.text}</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbButton}
            onClick={handleBackToPistas}
          >
            <span>←</span>
            <span>Volver a pistas</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {pista.name}
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!pista.activa}
              style={{ 
                opacity: pista.activa ? 1 : 0.6,
                cursor: pista.activa ? 'pointer' : 'not-allowed'
              }}
            >
              ⛸️ {pista.activa ? 'Reservar' : 'No disponible'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{pista.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(pista.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{pista.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {pista.amenities.map((amenity: string, index: number) => (
                <button 
                  key={index}
                  className={`${styles.tab} ${activeTab === index ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {amenity}
                </button>
              ))}
          </div>

          {/* Description Section */}
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>Descripción de la Pista de Patinaje</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>⛸️</span>
              <p className={styles.descriptionText}>{pista.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{pista.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{pista.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación de la Pista</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={pista.coordinates.lat} 
                longitude={pista.coordinates.lng}
                address={pista.location}
                zoom={15}
                height="250px"
                sport="patinaje"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{pista.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section - SIMPLIFICADA */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos de la Pista de Patinaje</h3>
            <div className={styles.imageCarousel}>
              {pista.images.length > 1 && (
                <button className={styles.carouselButton} onClick={prevImage}>
                  ←
                </button>
              )}
              <div className={styles.imageContainer}>
                <Image 
                  src={pista.images[currentImageIndex] || "/sports/patinaje/patinaje.png"} 
                  alt={`${pista.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/patinaje/patinaje.png";
                  }}
                />
                {pista.images.length > 1 && (
                  <div className={styles.imageOverlay}>
                    <span className={styles.imageCounter}>
                      {currentImageIndex + 1} / {pista.images.length}
                    </span>
                  </div>
                )}
              </div>
              {pista.images.length > 1 && (
                <button className={styles.carouselButton} onClick={nextImage}>
                  →
                </button>
              )}
            </div>
            {pista.images.length > 1 && (
              <div className={styles.imageIndicators}>
                {pista.images.map((_: string, index: number) => (
                  <button
                    key={index}
                    className={`${styles.imageIndicator} ${index === currentImageIndex ? styles.imageIndicatorActive : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <h3 className={styles.sectionTitle}>Contacto Centro de Patinaje</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{pista.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{pista.instagram}</span>
              </div>
            </div>
            <div className={styles.contactButtons}>
              <button className={styles.contactButton} onClick={handleCall}>
                📞 Llamar
              </button>
              <button className={styles.contactButton} onClick={handleInstagram}>
                📱 Seguir
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <div className={styles.reviewsTitle}>
              <span className={styles.reviewsIcon}>⭐</span>
              <span>{pista.rating.toFixed(1)} • {pista.reviews} reseñas de patinaje</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {pista.reviewsList.map((review: any, index: number) => (
                <div key={index} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <div className={styles.userAvatar}>
                        {review.name.charAt(0)}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{review.name}</span>
                        <div className={styles.reviewStars}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Help Button */}
        <div className={styles.helpSection}>
          <button className={styles.helpButton} onClick={handleHelp}>
            ❓ Ayuda
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔥 COMPONENTE PRINCIPAL CON SUSPENSE (RESUELVE EL ERROR DEL BUILD)
export default function PatinajePistaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando pista de patinaje...</div>}>
      <PatinajePistaSeleccionadaContent />
    </Suspense>
  );
}