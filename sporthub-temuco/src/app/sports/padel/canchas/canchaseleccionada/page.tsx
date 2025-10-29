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

// 🎾 DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@clubpadelelite",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 2 días",
      comment: "Excelente cancha de pádel! El cristal templado está perfectamente mantenido y las paletas profesionales son de primera calidad."
    },
    {
      name: "Ana R.",
      rating: 5,
      date: "hace 5 días", 
      comment: "La mejor cancha de pádel de Temuco. Iluminación perfecta para jugar de noche y el personal muy profesional. Totalmente recomendada."
    },
    {
      name: "Roberto L.",
      rating: 4,
      date: "hace 1 semana",
      comment: "Muy buena experiencia jugando pádel. La cancha está en perfecto estado y los vestuarios son de lujo. Volveremos pronto."
    }
  ]
};

// 🎾 COMPONENTE PRINCIPAL CON SUSPENSE
function PadelCanchaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [cancha, setCancha] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🎾 OBTENER ID DE LA CANCHA DESDE URL
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
        
        // 🎾 LLAMADA A LA API PARA OBTENER LA CANCHA
        const canchaData = await canchaService.getCanchaById(parseInt(canchaId));
        console.log('✅ Cancha cargada:', canchaData);

        // 🎾 VERIFICAR QUE SEA UNA CANCHA DE PÁDEL
        if (!['padel', 'paddle', 'pádel'].includes(canchaData.tipo.toLowerCase())) {
          throw new Error(`Esta cancha es de ${canchaData.tipo}, no de pádel`);
        }

        // 🎾 NUEVO: OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (canchaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', canchaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(canchaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🎾 USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🎾 USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🎾 MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedCancha = {
          id: canchaData.id,
          name: canchaData.nombre,
          
          // 🎾 USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🎾 DESCRIPCIÓN SIMPLE CON DATOS REALES
          description: `${canchaData.nombre} - Cancha de ${canchaData.tipo}${complejoData ? ` en ${complejoData.nombre}` : ''} con cristal templado profesional y superficie de cesped sintético de alta calidad. Ideal para partidos de pádel recreacional y competitivo.`,
          
          // 🎾 HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 07:00 a 23:00",
          
          // 🎾 CAPACIDAD ESPECÍFICA PARA PÁDEL
          capacity: "4 jugadores (2 vs 2)",
          
          // 🎾 DATOS REALES DE LA API
          rating: canchaData.rating || 4.7,
          reviews: 124, // Estático por ahora
          priceFrom: canchaData.precioPorHora || 30000,
          
          // 🎾 IMÁGENES ESPECÍFICAS DE PÁDEL
          images: [
            `/sports/padel/canchas/Cancha1.png`,
            `/sports/padel/canchas/Cancha2.png`,
            `/sports/padel/canchas/Cancha3.png`,
            `/sports/padel/padel.png`
          ],
          
          // 🎾 AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            canchaData.activa ? "Disponible" : "No disponible",
            canchaData.techada ? "Cancha Techada" : "Cancha Exterior",
            "Cristal Templado",
            "Superficie Deportiva",
            "Iluminación LED",
            "Paletas Profesionales",
            "Vestuarios VIP"
          ],
          
          // 🎾 CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🎾 INFORMACIÓN ADICIONAL REAL
          establecimientoId: canchaData.establecimientoId,
          tipo: canchaData.tipo,
          techada: canchaData.techada,
          activa: canchaData.activa,
          
          // 🎾 INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Complejo ${canchaData.establecimientoId}`
        };

        setCancha(mappedCancha);
        
      } catch (error: any) {
        console.error('❌ Error cargando cancha:', error);
        setError(`Error cargando cancha: ${error.message}`);
        
        // 🎾 FALLBACK SIMPLE
        setCancha({
          id: canchaId,
          name: `Club Padel Elite #${canchaId}`,
          location: "Av. Alemania 1234, Temuco, Chile", // Fallback estático
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Cancha de Pádel #${canchaId} con cristal templado profesional - Datos no disponibles`,
          schedule: "Lunes a Domingo • 07:00 a 23:00",
          capacity: "4 jugadores (2vs2)",
          rating: 4.7,
          reviews: 124,
          priceFrom: 30000,
          images: [
            "/sports/padel/padel.png",
            "/sports/padel/padel.png",
            "/sports/padel/padel.png",
            "/sports/padel/padel.png"
          ],
          amenities: ["Datos offline", "Cristal Templado", "Paletas Profesionales", "Iluminación LED"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Club de Pádel"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadCanchaData();
  }, [canchaId]);

  // 🎾 RESTO DE FUNCIONES SIN CAMBIOS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToCanchas = () => {
    router.push('/sports/padel/canchas');
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
    alert(`¿Necesitas ayuda con pádel? Contáctanos al ${cancha?.phone} o envía un email a padel@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de pádel próximamente...`);
  };

  // 🎾 LOADING Y ERROR - SIN CAMBIOS
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="padel" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🎾</div>
          <p>Cargando información de la cancha de pádel...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!cancha) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="padel" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información de la cancha de pádel</p>
          <button onClick={() => router.push('/sports/padel/canchas')}>
            Volver a canchas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="padel" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🎾</span>
            <h1 className={styles.headerTitle}>Pádel</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar canchas de pádel..."
            sport="padel"
            onSearch={(term) => router.push(`/sports/padel/canchas?search=${encodeURIComponent(term)}`)}
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
              {cancha.name} - {cancha.tipo?.charAt(0).toUpperCase() + cancha.tipo?.slice(1) || 'Pádel'}
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
              🎾 {cancha.activa ? 'Reservar' : 'No disponible'}
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
            <h3 className={styles.sectionTitle}>Descripción de la Cancha de Pádel</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🎾</span>
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
            <h3 className={styles.sectionTitle}>Ubicación de la Cancha</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={cancha.coordinates.lat} 
                longitude={cancha.coordinates.lng}
                address={cancha.location}
                zoom={15}
                height="250px"
                sport="padel"
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
            <h3 className={styles.sectionTitle}>Fotos de la Cancha de Pádel</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={cancha.images[currentImageIndex] || "/sports/padel/padel.png"} 
                  alt={`${cancha.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/padel/padel.png";
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
          <h3 className={styles.sectionTitle}>Contacto Club de Pádel</h3>
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
          <div className={styles.reviewsHeader}>
            <div className={styles.reviewsTitle}>
              <span className={styles.reviewsIcon}>⭐</span>
              <span>{cancha.rating.toFixed(1)} • {cancha.reviews} reseñas de pádel</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {cancha.reviewsList.map((review: any, index: number) => (
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
export default function PadelCanchaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando cancha de pádel...</div>}>
      <PadelCanchaSeleccionadaContent />
    </Suspense>
  );
}