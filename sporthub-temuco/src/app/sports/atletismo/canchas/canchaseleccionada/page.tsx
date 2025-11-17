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

// 🏃‍♂️ DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@atletismotemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Excelente pista de atletismo! Superficie profesional y muy bien mantenida. Perfecta para entrenamientos."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buena pista, cronometraje preciso y 8 carriles en perfecto estado. Personal muy profesional."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "La mejor pista de atletismo de la región. Ideal para competencias y entrenamientos de alto nivel."
    }
  ]
};

// 🏃‍♂️ COMPONENTE PRINCIPAL CON SUSPENSE
function AtletismoPistaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  // 🗺️ REFS PARA EL MAPA
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [pista, setPista] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // 🆕 ESTADOS PARA RESEÑAS
  const [reviews, setReviews] = useState<Resena[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 🏃‍♂️ OBTENER ID DE LA PISTA DESDE URL
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
        
        // 🏃‍♂️ LLAMADA A LA API PARA OBTENER LA PISTA
        const pistaData = await canchaService.getCanchaById(parseInt(pistaId));
        console.log('✅ Pista cargada:', pistaData);

        // 🏃‍♂️ OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Estadio Municipal, Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (pistaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', pistaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(pistaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🏃‍♂️ USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🏃‍♂️ USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🏃‍♂️ MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedPista = {
          id: pistaData.id,
          name: pistaData.nombre,
          
          // 🏃‍♂️ USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🏃‍♂️ DESCRIPCIÓN ESPECÍFICA PARA ATLETISMO
          description: `${pistaData.nombre} - Pista de atletismo${complejoData ? ` en ${complejoData.nombre}` : ''}. Ideal para entrenamiento y competencias.`,
          
          // 🏃‍♂️ HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 06:00 a 21:00",
          
          // 🏃‍♂️ CAPACIDAD ESPECÍFICA PARA ATLETISMO
          capacity: (() => {
            switch (pistaData.tipo?.toLowerCase()) {
              case 'atletismo':
              case 'pista_atletica': 
                return "Pista de 400m - 8 carriles";
              case 'track':
              case 'running': 
                return "Pista de entrenamiento - 6 carriles";
              default: 
                return "Consultar especificaciones";
            }
          })(),
          
          // 🏃‍♂️ DATOS REALES DE LA API
          rating: pistaData.rating || 4.6,
          reviews: 95, // Estático por ahora
          priceFrom: pistaData.precioPorHora || 20000,
          
          // 🏃‍♂️ IMÁGENES ESPECÍFICAS DE ATLETISMO
          images: [
            `/sports/atletismo/pistas/Pista1.png`,
            `/sports/atletismo/pistas/Pista2.png`,
            `/sports/atletismo/pistas/Pista3.png`
          ],
          
          // 🏃‍♂️ AMENIDADES ESPECÍFICAS DE ATLETISMO
          amenities: [
            pistaData.activa ? "Disponible" : "No disponible",
            pistaData.techada ? "Pista cubierta" : "Pista exterior",
            "Cronometraje electrónico",
            "Área de calentamiento",
            "Zona de saltos",
            "Implementos disponibles"
          ],
          
          // 🏃‍♂️ CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🏃‍♂️ INFORMACIÓN ADICIONAL REAL
          establecimientoId: pistaData.establecimientoId,
          tipo: pistaData.tipo,
          techada: pistaData.techada,
          activa: pistaData.activa,
          
          // 🏃‍♂️ INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Centro de Atletismo ${pistaData.establecimientoId}`
        };

        setPista(mappedPista);
        
        // 🆕 CARGAR RESEÑAS DESPUÉS DE CARGAR LA PISTA
        await loadReviews(parseInt(pistaId));
        
      } catch (error: any) {
        console.error('❌ Error cargando pista:', error);
        setError(`Error cargando pista: ${error.message}`);
        
        // 🏃‍♂️ FALLBACK SIMPLE
        setPista({
          id: pistaId,
          name: `Pista de Atletismo #${pistaId}`,
          location: "Estadio Municipal, Av. Alemania 1234, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Pista de Atletismo #${pistaId} - Datos no disponibles`,
          schedule: "Lunes a Domingo • 06:00 a 21:00",
          capacity: "Pista de 400m - 8 carriles",
          rating: 4.6,
          reviews: 95,
          priceFrom: 20000,
          images: [
            "/sports/atletismo/pistas/Pista1.png",
            "/sports/atletismo/pistas/Pista2.png",
            "/sports/atletismo/pistas/Pista3.png"
          ],
          amenities: ["Datos offline", "Pista de tartán", "Cronometraje", "8 carriles", "Zona de saltos"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Centro de Atletismo"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadPistaData();
  }, [pistaId]);
  
  // 🆕 FUNCIÓN PARA CARGAR RESEÑAS
  const loadReviews = async (canchaId: number) => {
    try {
      setReviewsLoading(true);
      setReviewError(null);
      console.log('🔍 Cargando reseñas para pista ID:', canchaId);
      
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
    
    if (!pistaId) {
      alert('Error: No se puede identificar la pista');
      return;
    }
    
    try {
      console.log('📝 Enviando reseña:', { rating, comment, pistaId: parseInt(pistaId) });
      
      await resenaService.crearResena({
        id_cancha: parseInt(pistaId),
        calificacion: rating,
        comentario: comment.trim() || undefined
      });
      
      console.log('✅ Reseña enviada exitosamente');
      
      await loadReviews(parseInt(pistaId));
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

  // 🗺️ EFECTO: Cargar Google Maps cuando la pista está disponible
  useEffect(() => {
    if (!pista || !pista.coordinates || isMapLoaded) return;

    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current && typeof window !== 'undefined' && (window as any).google) {
        const { google } = window as any;
        
        console.log('🗺️ [CanchaSeleccionada] Inicializando mapa de Google Maps');
        console.log('📍 Coordenadas:', pista.coordinates);
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: pista.coordinates,
          zoom: 15,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        
        // 🔴 CREAR MARCADOR PARA LA PISTA
        markerRef.current = new google.maps.Marker({
          position: pista.coordinates,
          map: mapInstanceRef.current,
          title: pista.name,
          animation: google.maps.Animation.DROP,
        });

        // 📋 CREAR INFOWINDOW
        const infoContent = `
          <div style="padding: 12px; max-width: 250px;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">🏃‍♂️ ${pista.name}</h4>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${pista.location}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">🏟️ ${pista.capacity}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">💰 Desde ${pista.priceFrom}/h</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">⭐ ${pista.rating}/5 (${pista.reviews} reseñas)</p>
          </div>
        `;

        infoWindowRef.current = new google.maps.InfoWindow({
          content: infoContent,
        });

        markerRef.current.addListener('click', () => {
          infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        });

        // Abrir InfoWindow automáticamente
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        
        setIsMapLoaded(true);
        console.log('✅ [CanchaSeleccionada] Mapa inicializado correctamente');
      }
    };

    // Si ya hay una instancia de google cargada
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }

    // Insertar el script de Google Maps si no existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      console.log('📦 [CanchaSeleccionada] Cargando script de Google Maps...');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        console.log('✅ [CanchaSeleccionada] Script de Google Maps cargado');
        initMap();
      };
    } else {
      existingScript.addEventListener('load', initMap);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [pista, isMapLoaded]);

  // 🏃‍♂️ RESTO DE FUNCIONES ADAPTADAS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToPistas = () => {
    router.push('/sports/atletismo/canchas');
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
    alert(`¿Necesitas ayuda con atletismo? Contáctanos al ${pista?.phone} o envía un email a atletismo@sporthub.cl`);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para escribir una reseña');
      router.push('/login');
      return;
    }
    setShowReviewModal(true);
  };

  // 🏃‍♂️ LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="atletismo" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏃‍♂️</div>
          <p>Cargando información de la pista...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!pista) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="atletismo" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información de la pista</p>
          <button onClick={() => router.push('/sports/atletismo/canchas')}>
            Volver a pistas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏃‍♂️</span>
            <h1 className={styles.headerTitle}>Atletismo</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar pistas de atletismo..."
            sport="atletismo"
            onSearch={(term) => router.push(`/sports/atletismo/canchas?search=${encodeURIComponent(term)}`)}
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

        {/* Track Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {pista.name} - Atletismo
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
              🏃‍♂️ {pista.activa ? 'Reservar Pista' : 'Pista Cerrada'}
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
              <span className={styles.detailIcon}>🏟️</span>
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
            <h3 className={styles.sectionTitle}>Descripción de la Pista</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🏃‍♂️</span>
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
                <span className={styles.availabilityIcon}>🏃‍♂️</span>
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
            <div className={styles.mapContainer} style={{ position: 'relative' }}>
              <div 
                ref={mapRef}
                style={{ 
                  width: '100%', 
                  height: '400px',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }} 
              />
              {!isMapLoaded && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 5,
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                    <p style={{ color: '#666', fontSize: '16px' }}>Cargando mapa...</p>
                  </div>
                </div>
              )}
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
            <h3 className={styles.sectionTitle}>Fotos de la Pista</h3>
            <div className={styles.imageCarousel}>
              {pista.images.length > 1 && (
                <button className={styles.carouselButton} onClick={prevImage}>
                  ←
                </button>
              )}
              <div className={styles.imageContainer}>
                <Image 
                  src={pista.images[currentImageIndex] || "/sports/atletismo/pistas/Pista1.png"} 
                  alt={`${pista.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/atletismo/atletismo.png";
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
          <h3 className={styles.sectionTitle}>Contacto Club de Atletismo</h3>
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
          canchaName={pista?.name || 'Pista de Atletismo'}
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
export default function AtletismoPistaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando pista de atletismo...</div>}>
      <AtletismoPistaSeleccionadaContent />
    </Suspense>
  );
}