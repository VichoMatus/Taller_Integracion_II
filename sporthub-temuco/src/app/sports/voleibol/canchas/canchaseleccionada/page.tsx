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

// 🏐 DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@clubvoleiboltemuco",
  reviewsList: [
    {
      name: "María S.",
      rating: 5,
      date: "hace 2 días",
      comment: "Excelente cancha de voleibol! La red está perfectamente ajustada y el piso flotante es de calidad profesional."
    },
    {
      name: "Carlos R.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buena cancha de voleibol, vestuarios limpios y personal muy amable. La altura del techo es perfecta."
    },
    {
      name: "Ana L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "La mejor cancha de voleibol de Temuco. Superficie de madera en excelente condición y marcas reglamentarias."
    }
  ]
};

// 🏐 COMPONENTE PRINCIPAL CON SUSPENSE
function VoleibolCanchaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  // 🗺️ REFS PARA EL MAPA
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [cancha, setCancha] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // 🆕 ESTADOS PARA RESEÑAS
  const [reviews, setReviews] = useState<Resena[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 🏐 OBTENER ID DE LA CANCHA DESDE URL
  const canchaId = searchParams?.get('id') || searchParams?.get('cancha');

  useEffect(() => {
    const loadCanchaData = async () => {
      if (!canchaId) {
        setError('No se especificó ID de cancha');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando cancha ID:', canchaId);
        
        // 🏐 LLAMADA A LA API PARA OBTENER LA CANCHA
        const canchaData = await canchaService.getCanchaById(parseInt(canchaId));
        console.log('✅ Cancha cargada:', canchaData);

        // 🏐 VERIFICAR QUE SEA UNA CANCHA DE VOLEIBOL
        if (!['voleibol', 'volleyball', 'voley'].includes(canchaData.tipo.toLowerCase())) {
          throw new Error(`Esta cancha es de ${canchaData.tipo}, no de voleibol`);
        }

        // 🏐 OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (canchaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', canchaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(canchaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🏐 USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🏐 USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🏐 MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedCancha = {
          id: canchaData.id,
          name: canchaData.nombre,
          
          // 🏐 USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🏐 DESCRIPCIÓN SIMPLE CON DATOS REALES
          description: `${canchaData.nombre} - Cancha de ${canchaData.tipo}${complejoData ? ` en ${complejoData.nombre}` : ''} con red reglamentaria y superficie profesional. Ideal para partidos de voleibol recreacional y competitivo.`,
          
          // 🏐 HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 08:00 a 23:00",
          
          // 🏐 CAPACIDAD ESPECÍFICA PARA VOLEIBOL
          capacity: "12 jugadores (6 vs 6)",
          
          // 🏐 DATOS REALES DE LA API
          rating: canchaData.rating || 4.6,
          reviews: 98, // Estático por ahora
          priceFrom: canchaData.precioPorHora || 20000,
          
          // 🏐 IMÁGENES ESPECÍFICAS DE VOLEIBOL
          images: [
            `/sports/voleibol/canchas/Cancha1.png`,
            `/sports/voleibol/canchas/Cancha2.png`,
            `/sports/voleibol/canchas/Cancha3.png`,
            `/sports/voleibol/voleibol.png`
          ],
          
          // 🏐 AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            canchaData.activa ? "Disponible" : "No disponible",
            canchaData.techada ? "Cancha Techada" : "Cancha Exterior",
            "Red Profesional",
            "Piso Flotante",
            "Marcas Reglamentarias",
            "Iluminación LED",
            "Vestuarios VIP"
          ],
          
          // 🏐 CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🏐 INFORMACIÓN ADICIONAL REAL
          establecimientoId: canchaData.establecimientoId,
          tipo: canchaData.tipo,
          techada: canchaData.techada,
          activa: canchaData.activa,
          
          // 🏐 INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Complejo ${canchaData.establecimientoId}`
        };

        setCancha(mappedCancha);
        
        // 🆕 CARGAR RESEÑAS DESPUÉS DE CARGAR LA CANCHA
        await loadReviews(parseInt(canchaId));
        
      } catch (error: any) {
        console.error('❌ Error cargando cancha:', error);
        setError(`Error cargando cancha: ${error.message}`);
        
        // 🏐 FALLBACK SIMPLE
        setCancha({
          id: canchaId,
          name: `Club Voleibol Elite #${canchaId}`,
          location: "Av. Alemania 1234, Temuco, Chile", // Fallback estático
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Cancha de Voleibol #${canchaId} con red profesional - Datos no disponibles`,
          schedule: "Lunes a Domingo • 08:00 a 23:00",
          capacity: "12 jugadores (6vs6)",
          rating: 4.6,
          reviews: 98,
          priceFrom: 20000,
          images: [
            "/sports/voleibol/voleibol.png",
            "/sports/voleibol/voleibol.png",
            "/sports/voleibol/voleibol.png",
            "/sports/voleibol/voleibol.png"
          ],
          amenities: ["Datos offline", "Red Profesional", "Piso Flotante", "Iluminación LED"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Club de Voleibol"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadCanchaData();
  }, [canchaId]);
  
  // 🆕 FUNCIÓN PARA CARGAR RESEÑAS
  const loadReviews = async (canchaId: number) => {
    try {
      setReviewsLoading(true);
      setReviewError(null);
      console.log('🔍 Cargando reseñas para cancha ID:', canchaId);
      
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
    
    if (!canchaId) {
      alert('Error: No se puede identificar la cancha');
      return;
    }
    
    try {
      console.log('📝 Enviando reseña:', { rating, comment, canchaId: parseInt(canchaId) });
      
      await resenaService.crearResena({
        id_cancha: parseInt(canchaId),
        calificacion: rating,
        comentario: comment.trim() || undefined
      });
      
      console.log('✅ Reseña enviada exitosamente');
      
      await loadReviews(parseInt(canchaId));
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

  // 🗺️ EFECTO: Cargar Google Maps
  useEffect(() => {
    if (!cancha || !cancha.coordinates || isMapLoaded) return;

    const initMap = () => {
      const mapElement = document.getElementById('voleibol-map');
      if (!mapElement || !mapInstanceRef.current || typeof window === 'undefined' || !(window as any).google) {
        if (!(window as any).google) {
          setTimeout(() => initMap(), 500);
          return;
        }
      }

      if (mapElement && !mapInstanceRef.current && (window as any).google) {
        const { google } = window as any;
        mapInstanceRef.current = new google.maps.Map(mapElement, {
          center: cancha.coordinates,
          zoom: 15,
          styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] }]
        });
        
        markerRef.current = new google.maps.Marker({
          position: cancha.coordinates,
          map: mapInstanceRef.current,
          title: cancha.name,
          animation: google.maps.Animation.DROP,
        });

        const infoContent = `<div style="padding: 12px;"><h4 style="margin: 0 0 8px 0;">🏐 ${cancha.name}</h4><p style="margin: 4px 0;">📍 ${cancha.location}</p><p style="margin: 4px 0;">💰 $${cancha.priceFrom}/h</p><p style="margin: 4px 0;">⭐ ${cancha.rating}/5</p></div>`;
        const infoWindow = new google.maps.InfoWindow({ content: infoContent });
        markerRef.current.addListener('click', () => infoWindow.open(mapInstanceRef.current, markerRef.current));
        infoWindow.open(mapInstanceRef.current, markerRef.current);
        setIsMapLoaded(true);
      }
    };

    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => initMap();
    }

    return () => { if (markerRef.current) markerRef.current.setMap(null); };
  }, [cancha, isMapLoaded]);

  // 🏐 RESTO DE FUNCIONES SIN CAMBIOS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToCanchas = () => {
    router.push('/sports/voleibol/canchas');
  };

  const nextImage = () => {
    if (cancha && cancha.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === cancha.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (cancha && cancha.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? cancha.images.length - 1 : prev - 1
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
    router.push(`/sports/reservacancha?canchaId=${cancha.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${cancha?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${cancha?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(cancha?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con voleibol? Contáctanos al ${cancha?.phone} o envía un email a voleibol@sporthub.cl`);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para escribir una reseña');
      router.push('/login');
      return;
    }
    setShowReviewModal(true);
  };

  // 🏐 LOADING Y ERROR - SIN CAMBIOS
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="voleibol" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏐</div>
          <p>Cargando información de la cancha de voleibol...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!cancha) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="voleibol" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información de la cancha de voleibol</p>
          <button onClick={() => router.push('/sports/voleibol/canchas')}>
            Volver a canchas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="voleibol" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏐</span>
            <h1 className={styles.headerTitle}>Voleibol</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar canchas de voleibol..."
            sport="voleibol"
            onSearch={(term) => router.push(`/sports/voleibol/canchas?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToCanchas}
          >
            <span>←</span>
            <span>Volver a canchas</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {cancha.name} - {cancha.tipo?.charAt(0).toUpperCase() + cancha.tipo?.slice(1) || 'Voleibol'}
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!cancha.activa}
              style={{ 
                opacity: cancha.activa ? 1 : 0.6,
                cursor: cancha.activa ? 'pointer' : 'not-allowed'
              }}
            >
              🏐 {cancha.activa ? 'Reservar' : 'No disponible'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{cancha.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(cancha.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{cancha.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {cancha.amenities.map((amenity: string, index: number) => (
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
            <h3 className={styles.sectionTitle}>Descripción de la Cancha de Voleibol</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🏐</span>
              <p className={styles.descriptionText}>{cancha.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{cancha.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{cancha.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación</h3>
            <div className={styles.mapContainer} style={{ position: 'relative' }}>
              <div 
                id="voleibol-map"
                style={{ 
                  width: '100%', 
                  height: '400px',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }} 
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{cancha.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos de la Cancha de Voleibol</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={cancha.images[currentImageIndex] || "/sports/voleibol/voleibol.png"} 
                  alt={`${cancha.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/voleibol/voleibol.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {cancha.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {cancha.images.map((_: string, index: number) => (
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
          <h3 className={styles.sectionTitle}>Contacto Club de Voleibol</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{cancha.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{cancha.instagram}</span>
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
          canchaName={cancha?.name || 'Cancha de Voleibol'}
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
export default function VoleibolCanchaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando cancha de voleibol...</div>}>
      <VoleibolCanchaSeleccionadaContent />
    </Suspense>
  );
}