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

// 🧗‍♂️ DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@centroescaladatemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Excelente centro de escalada! Los muros están en perfecto estado y tienen rutas para todos los niveles."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buen rocódromo, vestuarios limpios y personal muy amable. Las rutas de boulder son fantásticas."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "El mejor centro de escalada de Temuco. Equipamiento de primera y rutas bien marcadas por dificultad."
    }
  ]
};

// 🧗‍♂️ COMPONENTE PRINCIPAL CON SUSPENSE
function EscaladaCentroSeleccionadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [centro, setCentro] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🧗‍♂️ OBTENER ID DEL CENTRO DESDE URL
  const centroId = searchParams?.get('id') || searchParams?.get('centro');

  useEffect(() => {
    const loadCentroData = async () => {
      if (!centroId) {
        setError('No se especificó ID de centro');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando centro ID:', centroId);
        
        // 🧗‍♂️ LLAMADA A LA API PARA OBTENER EL CENTRO (SIN FILTRO ESTRICTO)
        const centroData = await canchaService.getCanchaById(parseInt(centroId));
        console.log('✅ Centro cargado:', centroData);

        // 🧗‍♂️ OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (centroData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', centroData.establecimientoId);
            complejoData = await complejosService.getComplejoById(centroData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🧗‍♂️ USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🧗‍♂️ USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🧗‍♂️ MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedCentro = {
          id: centroData.id,
          name: `${centroData.nombre} (Adaptado para Escalada)`,
          
          // 🧗‍♂️ USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🧗‍♂️ DESCRIPCIÓN ADAPTADA
          description: `${centroData.nombre} - Instalación deportiva ${complejoData ? `en ${complejoData.nombre}` : ''} adaptada para actividades de escalada. Perfecta para entrenamientos y práctica de climbing.`,
          
          // 🧗‍♂️ HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 09:00 a 22:00",
          
          // 🧗‍♂️ CAPACIDAD ESPECÍFICA PARA ESCALADA
          capacity: "20 escaladores simultáneos",
          
          // 🧗‍♂️ DATOS REALES DE LA API
          rating: centroData.rating || 4.7,
          reviews: 67, // Estático por ahora
          priceFrom: centroData.precioPorHora || 18000,
          
          // 🧗‍♂️ IMÁGENES ESPECÍFICAS DE ESCALADA
          images: [
            `/sports/escalada/escalada.png` // Solo una imagen por defecto
          ],
          
          // 🧗‍♂️ AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            centroData.activa ? "Disponible" : "No disponible",
            centroData.techada ? "Instalación Techada" : "Instalación Exterior",
            "Adaptado para Escalada",
            "Muros de Diferentes Niveles",
            "Equipamiento de Seguridad",
            "Vestuarios Disponibles"
          ],
          
          // 🧗‍♂️ CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🧗‍♂️ INFORMACIÓN ADICIONAL REAL
          establecimientoId: centroData.establecimientoId,
          tipo: centroData.tipo,
          techada: centroData.techada,
          activa: centroData.activa,
          
          // 🧗‍♂️ INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Complejo ${centroData.establecimientoId}`
        };

        setCentro(mappedCentro);
        
      } catch (error: any) {
        console.error('❌ Error cargando centro:', error);
        setError(`Error cargando centro: ${error.message}`);
        
        // 🧗‍♂️ FALLBACK SIMPLE
        setCentro({
          id: centroId,
          name: `Instalación Deportiva #${centroId} (Escalada)`,
          location: "Av. Alemania 1234, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Instalación deportiva adaptada para escalada - ID: ${centroId}`,
          schedule: "Lunes a Domingo • 09:00 a 22:00",
          capacity: "20 escaladores simultáneos",
          rating: 4.7,
          reviews: 67,
          priceFrom: 18000,
          images: ["/sports/escalada/escalada.png"],
          amenities: ["Datos offline", "Adaptado para Escalada", "Muros Variados", "Vestuarios"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Centro de Escalada"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadCentroData();
  }, [centroId]);

  // 🧗‍♂️ RESTO DE FUNCIONES SIN CAMBIOS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToCentros = () => {
    router.push('/sports/escalada/centros');
  };

  const nextImage = () => {
    if (centro && centro.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % centro.images.length);
    }
  };

  const prevImage = () => {
    if (centro && centro.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + centro.images.length) % centro.images.length);
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
    router.push(`/sports/reservacancha?canchaId=${centro.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${centro?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${centro?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(centro?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con escalada? Contáctanos al ${centro?.phone} o envía un email a escalada@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de escalada próximamente...`);
  };

  // 🧗‍♂️ LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="escalada" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🧗‍♂️</div>
          <p>Cargando información del centro de escalada...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!centro) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="escalada" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información del centro de escalada</p>
          <button onClick={() => router.push('/sports/escalada/centros')}>
            Volver a centros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="escalada" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🧗‍♂️</span>
            <h1 className={styles.headerTitle}>Escalada</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar centros de escalada..."
            sport="escalada"
            onSearch={(term) => router.push(`/sports/escalada/centros?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToCentros}
          >
            <span>←</span>
            <span>Volver a centros</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {centro.name}
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!centro.activa}
              style={{ 
                opacity: centro.activa ? 1 : 0.6,
                cursor: centro.activa ? 'pointer' : 'not-allowed'
              }}
            >
              🧗‍♂️ {centro.activa ? 'Reservar' : 'No disponible'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{centro.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(centro.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{centro.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {centro.amenities.map((amenity: string, index: number) => (
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
            <h3 className={styles.sectionTitle}>Descripción del Centro de Escalada</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🧗‍♂️</span>
              <p className={styles.descriptionText}>{centro.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{centro.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{centro.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación del Centro</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={centro.coordinates.lat} 
                longitude={centro.coordinates.lng}
                address={centro.location}
                zoom={15}
                height="250px"
                sport="escalada"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{centro.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section - SIMPLIFICADA */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos del Centro</h3>
            <div className={styles.imageCarousel}>
              {centro.images.length > 1 && (
                <button className={styles.carouselButton} onClick={prevImage}>
                  ←
                </button>
              )}
              <div className={styles.imageContainer}>
                <Image 
                  src={centro.images[currentImageIndex] || "/sports/escalada/escalada.png"} 
                  alt={`${centro.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/escalada/escalada.png";
                  }}
                />
                {centro.images.length > 1 && (
                  <div className={styles.imageOverlay}>
                    <span className={styles.imageCounter}>
                      {currentImageIndex + 1} / {centro.images.length}
                    </span>
                  </div>
                )}
              </div>
              {centro.images.length > 1 && (
                <button className={styles.carouselButton} onClick={nextImage}>
                  →
                </button>
              )}
            </div>
            {centro.images.length > 1 && (
              <div className={styles.imageIndicators}>
                {centro.images.map((_: string, index: number) => (
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
          <h3 className={styles.sectionTitle}>Contacto Centro de Escalada</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{centro.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{centro.instagram}</span>
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
              <span>{centro.rating.toFixed(1)} • {centro.reviews} reseñas de escalada</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {centro.reviewsList.map((review: any, index: number) => (
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
export default function EscaladaCentroSeleccionado() {
  return (
    <Suspense fallback={<div>Cargando centro de escalada...</div>}>
      <EscaladaCentroSeleccionadoContent />
    </Suspense>
  );
}