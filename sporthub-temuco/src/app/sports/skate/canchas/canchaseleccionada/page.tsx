'use client';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar'; 
import SearchBar from '@/components/SearchBar'; 
import ReviewModal from '@/components/ReviewModal';
import ReviewsList from '@/components/ReviewsList';
import styles from './page.module.css';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { canchaService } from '../../../../../services/canchaService';
import { complejosService } from '../../../../../services/complejosService';
import { resenaService } from '@/services/resenaService';
import type { Resena } from '@/types/resena';

// 🛹 DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@skateparktemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Increíble skatepark! Las rampas están en perfecto estado y el bowl es espectacular."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buen skatepark, buenas transiciones y ambiente genial. Personal muy amable."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "El mejor skatepark de la región. Ideal para todos los niveles, desde principiantes hasta pro."
    }
  ]
};

// 🛹 COMPONENTE PRINCIPAL CON SUSPENSE
function SkateParcSeleccionadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [skatepark, setSkatepark] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // 🆕 ESTADOS PARA RESEÑAS
  const [reviews, setReviews] = useState<Resena[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 🛹 OBTENER ID DEL SKATEPARK DESDE URL
  const skateparkId = searchParams?.get('id') || searchParams?.get('pista');

  useEffect(() => {
    const loadSkateparkData = async () => {
      if (!skateparkId) {
        setError('No se especificó ID de skatepark');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando skatepark ID:', skateparkId);
        
        // 🛹 LLAMADA A LA API PARA OBTENER EL SKATEPARK
        const skateparkData = await canchaService.getCanchaById(parseInt(skateparkId));
        console.log('✅ Skatepark cargado:', skateparkData);

        // 🛹 OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (skateparkData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', skateparkData.establecimientoId);
            complejoData = await complejosService.getComplejoById(skateparkData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🛹 USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🛹 USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🛹 MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedSkatepark = {
          id: skateparkData.id,
          name: skateparkData.nombre,
          
          // 🛹 USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🛹 DESCRIPCIÓN ESPECÍFICA PARA SKATE
          description: `${skateparkData.nombre} - Skatepark${complejoData ? ` en ${complejoData.nombre}` : ''}. Ideal para todos los niveles.`,
          
          // 🛹 HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 08:00 a 22:00",
          
          // 🛹 CAPACIDAD ESPECÍFICA PARA SKATE
          capacity: (() => {
            switch (skateparkData.tipo?.toLowerCase()) {
              case 'skate':
              case 'skatepark': 
                return "20 skaters - Bowl y Street";
              case 'skateboard':
              case 'vert': 
                return "15 skaters - Vert y Mini Ramp";
              default: 
                return "Consultar especificaciones";
            }
          })(),
          
          // 🛹 DATOS REALES DE LA API
          rating: skateparkData.rating || 4.6,
          reviews: 95, // Estático por ahora
          priceFrom: skateparkData.precioPorHora || 15000,
          
          // 🛹 IMÁGENES ESPECÍFICAS DE SKATE
          images: [
            `/sports/skate/pistas/Pista1.png`,
            `/sports/skate/pistas/Pista2.png`,
            `/sports/skate/pistas/Pista3.png`
          ],
          
          // 🛹 AMENIDADES ESPECÍFICAS DE SKATE
          amenities: [
            skateparkData.activa ? "Disponible" : "No disponible",
            skateparkData.techada ? "Skatepark cubierto" : "Skatepark exterior",
            "Bowl profesional",
            "Street course",
            "Rampas variadas",
            "Área de descanso"
          ],
          
          // 🛹 CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🛹 INFORMACIÓN ADICIONAL REAL
          establecimientoId: skateparkData.establecimientoId,
          tipo: skateparkData.tipo,
          techada: skateparkData.techada,
          activa: skateparkData.activa,
          
          // 🛹 INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Skatepark ${skateparkData.establecimientoId}`
        };

        setSkatepark(mappedSkatepark);
        
        // 🆕 CARGAR RESEÑAS DESPUÉS DE CARGAR EL SKATEPARK
        await loadReviews(parseInt(skateparkId));
        
      } catch (error: any) {
        console.error('❌ Error cargando skatepark:', error);
        setError(`Error cargando skatepark: ${error.message}`);
        
        // 🛹 FALLBACK SIMPLE
        setSkatepark({
          id: skateparkId,
          name: `Skatepark #${skateparkId}`,
          location: "Av. Alemania 1234, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Skatepark #${skateparkId} - Datos no disponibles`,
          schedule: "Lunes a Domingo • 08:00 a 22:00",
          capacity: "20 skaters - Bowl y Street",
          rating: 4.6,
          reviews: 95,
          priceFrom: 15000,
          images: [
            "/sports/skate/pistas/Pista1.png",
            "/sports/skate/pistas/Pista2.png",
            "/sports/skate/pistas/Pista3.png"
          ],
          amenities: ["Datos offline", "Bowl", "Street", "Rampas", "Mini Ramp"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Skatepark"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadSkateparkData();
  }, [skateparkId]);
  
  // 🆕 FUNCIÓN PARA CARGAR RESEÑAS
  const loadReviews = async (canchaId: number) => {
    try {
      setReviewsLoading(true);
      setReviewError(null);
      console.log('🔍 Cargando reseñas para skatepark ID:', canchaId);
      
      const resenasData = await resenaService.obtenerResenasPorCancha(canchaId);
      console.log('✅ Reseñas cargadas:', resenasData);
      setReviews(resenasData);
    } catch (error: any) {
      console.error('❌ Error cargando reseñas:', error);
      setReviewError(`Error cargando reseñas: ${error.message}`);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };
  
  // 🆕 FUNCIÓN PARA ENVIAR NUEVA RESEÑA
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para escribir una reseña');
      router.push('/login');
      return;
    }
    
    if (!skateparkId) {
      alert('Error: No se puede identificar el skatepark');
      return;
    }
    
    try {
      console.log('📝 Enviando reseña:', { rating, comment, skateparkId: parseInt(skateparkId) });
      
      await resenaService.crearResena({
        id_cancha: parseInt(skateparkId),
        calificacion: rating,
        comentario: comment.trim() || undefined
      });
      
      console.log('✅ Reseña enviada exitosamente');
      
      await loadReviews(parseInt(skateparkId));
      setShowReviewModal(false);
      alert('¡Reseña publicada exitosamente!');
    } catch (error: any) {
      console.error('❌ Error enviando reseña:', error);
      let errorMessage = error?.response?.data?.message || error?.message || 'Error al enviar la reseña';
      
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
  };

  // 🗺️ INICIALIZAR MAPA DE GOOGLE
  useEffect(() => {
    if (!skatepark || !skatepark.coordinates || isMapLoaded) return;
    
    const initMap = () => {
      const mapElement = document.getElementById('skate-map');
      if (!mapElement || typeof window === 'undefined' || !(window as any).google) return;
      
      const { google } = window as any;
      mapInstanceRef.current = new google.maps.Map(mapElement, {
        center: { lat: skatepark.coordinates.lat, lng: skatepark.coordinates.lng },
        zoom: 15,
      });
      
      markerRef.current = new google.maps.Marker({
        position: { lat: skatepark.coordinates.lat, lng: skatepark.coordinates.lng },
        map: mapInstanceRef.current,
        title: skatepark.name,
        animation: google.maps.Animation.DROP,
      });
      
      const infoWindowContent = `<h4>🛹 ${skatepark.name}</h4><p>📍 ${skatepark.location}</p><p>🏟️ ${skatepark.capacity}</p><p>💰 $${skatepark.priceFrom}/h</p><p>⭐ ${skatepark.rating}/5</p>`;
      const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });
      (markerRef.current as any).infoWindow = infoWindow;
      markerRef.current.addListener('click', () => {
        document.querySelectorAll('[role="dialog"]').forEach((w: any) => w.style.display = 'none');
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });
      infoWindow.open(mapInstanceRef.current, markerRef.current);
      setIsMapLoaded(true);
    };
    
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(initMap, 100);
      if (!document.querySelector(`script[src="${script.src}"]`)) document.head.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }
  }, [skatepark, isMapLoaded]);

  // �🛹 RESTO DE FUNCIONES ADAPTADAS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToPistas = () => {
    router.push('/sports/skate/canchas');
  };

  const nextImage = () => {
    if (skatepark && skatepark.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === skatepark.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (skatepark && skatepark.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? skatepark.images.length - 1 : prev - 1
      );
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
    router.push(`/sports/reservacancha?canchaId=${skatepark.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${skatepark?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${skatepark?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(skatepark?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con skate? Contáctanos al ${skatepark?.phone} o envía un email a skate@sporthub.cl`);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para escribir una reseña');
      router.push('/login');
      return;
    }
    setShowReviewModal(true);
  };

  // 🛹 LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="skate" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🛹</div>
          <p>Cargando información del skatepark...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!skatepark) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="skate" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información del skatepark</p>
          <button onClick={() => router.push('/sports/skate/canchas')}>
            Volver a skateparks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}></span>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar skateparks..."
            sport="skate"
            onSearch={(term) => router.push(`/sports/skate/canchas?search=${encodeURIComponent(term)}`)}
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
            <span>Volver a skateparks</span>
          </button>
        </div>

        {/* Skatepark Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {skatepark.name} - Skatepark
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!skatepark.activa}
              style={{ 
                opacity: skatepark.activa ? 1 : 0.6,
                cursor: skatepark.activa ? 'pointer' : 'not-allowed'
              }}
            >
              🛹 {skatepark.activa ? 'Reservar Sesión' : 'Cerrado'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{skatepark.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(skatepark.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{skatepark.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {skatepark.amenities.map((amenity: string, index: number) => (
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
            <h3 className={styles.sectionTitle}>Descripción del Skatepark</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🛹</span>
              <p className={styles.descriptionText}>{skatepark.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{skatepark.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🛹</span>
                <span className={styles.availabilityText}>{skatepark.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación del Skatepark</h3>
            <div className={styles.mapContainer}>
              <div id="skate-map" style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }} />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{skatepark.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Imágenes de referencia</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={skatepark.images[currentImageIndex] || "/sports/skate/pistas/Pista1.png"} 
                  alt={`${skatepark.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/skate/skate.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {skatepark.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {skatepark.images.map((_: string, index: number) => (
                <button
                  key={index}
                  className={`${styles.imageIndicator} ${index === currentImageIndex ? styles.imageIndicatorActive : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <h3 className={styles.sectionTitle}>Contacto Skatepark</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{skatepark.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{skatepark.instagram}</span>
              </div>
            </div>
            <div className={styles.contactButtons}>
              <button className={styles.contactButton} onClick={handleCall}>
                📞 Llamar
              </button>
              <button className={styles.contactButton} onClick={handleInstagram}>
                💬 Abrir
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <ReviewsList
            reviews={reviews}
            isLoading={reviewsLoading}
            onWriteReview={handleWriteReview}
            showWriteButton={true}
          />
          {reviewError && (
            <div style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
              ⚠️ {reviewError}
            </div>
          )}
        </div>

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
          canchaName={skatepark?.name || 'Skatepark'}
        />

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
export default function SkateParkSeleccionado() {
  return (
    <Suspense fallback={<div>Cargando skatepark...</div>}>
      <SkateParcSeleccionadoContent />
    </Suspense>
  );
}