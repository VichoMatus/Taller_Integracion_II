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

// 🚵‍♂️ DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@mtbtemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Increíble ruta de mountain bike! Senderos desafiantes y paisajes espectaculares. Perfecto para riders de nivel intermedio."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Excelente ruta, bien marcada y con niveles de dificultad variados. Personal muy profesional y equipamiento de primera."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "La mejor experiencia de MTB en la región. Senderos técnicos y vistas increíbles de la cordillera."
    }
  ]
};

// 🚵‍♂️ COMPONENTE PRINCIPAL CON SUSPENSE
function MountainBikeRutaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [ruta, setRuta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🚵‍♂️ OBTENER ID DE LA RUTA DESDE URL
  const rutaId = searchParams?.get('id') || searchParams?.get('ruta');

  useEffect(() => {
    const loadRutaData = async () => {
      if (!rutaId) {
        setError('No se especificó ID de ruta');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando ruta ID:', rutaId);
        
        // 🚵‍♂️ LLAMADA A LA API PARA OBTENER LA RUTA (SIN FILTRO ESTRICTO)
        const rutaData = await canchaService.getCanchaById(parseInt(rutaId));
        console.log('✅ Ruta cargada:', rutaData);

        // 🚵‍♂️ OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Cordillera de Nahuelbuta, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (rutaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', rutaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(rutaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🚵‍♂️ USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🚵‍♂️ USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🚵‍♂️ MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedRuta = {
          id: rutaData.id,
          name: `${rutaData.nombre} (Adaptado para Mountain Bike)`,
          
          // 🚵‍♂️ USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🚵‍♂️ DESCRIPCIÓN ADAPTADA
          description: `${rutaData.nombre} - Ruta de mountain bike ${complejoData ? `en ${complejoData.nombre}` : ''} adaptada para ciclismo de montaña. Perfecta para riders aventureros y amantes de la naturaleza.`,
          
          // 🚵‍♂️ HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 07:00 a 18:00",
          
          // 🚵‍♂️ CAPACIDAD ESPECÍFICA PARA MOUNTAIN BIKE
          capacity: "12 ciclistas por grupo",
          
          // 🚵‍♂️ DATOS REALES DE LA API
          rating: rutaData.rating || 4.8,
          reviews: 67, // Estático por ahora
          priceFrom: rutaData.precioPorHora || 25000,
          
          // 🚵‍♂️ IMÁGENES ESPECÍFICAS DE MOUNTAIN BIKE
          images: [
            `/sports/mountain-bike/mountain-bike.png` // Solo una imagen por defecto
          ],
          
          // 🚵‍♂️ AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            rutaData.activa ? "Ruta Disponible" : "Ruta Cerrada",
            rutaData.techada ? "Senderos Cubiertos" : "Senderos Naturales",
            "Adaptado para MTB",
            "Señalización Profesional",
            "Guías Especializados",
            "Equipo de Seguridad"
          ],
          
          // 🚵‍♂️ CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🚵‍♂️ INFORMACIÓN ADICIONAL REAL
          establecimientoId: rutaData.establecimientoId,
          tipo: rutaData.tipo,
          techada: rutaData.techada,
          activa: rutaData.activa,
          
          // 🚵‍♂️ INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Base MTB ${rutaData.establecimientoId}`
        };

        setRuta(mappedRuta);
        
      } catch (error: any) {
        console.error('❌ Error cargando ruta:', error);
        setError(`Error cargando ruta: ${error.message}`);
        
        // 🚵‍♂️ FALLBACK SIMPLE
        setRuta({
          id: rutaId,
          name: `Ruta MTB #${rutaId} (Mountain Bike)`,
          location: "Cordillera de Nahuelbuta, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Ruta de mountain bike adaptada para ciclismo de montaña - ID: ${rutaId}`,
          schedule: "Lunes a Domingo • 07:00 a 18:00",
          capacity: "12 ciclistas por grupo",
          rating: 4.8,
          reviews: 67,
          priceFrom: 25000,
          images: ["/sports/mountain-bike/mountain-bike.png"],
          amenities: ["Datos offline", "Adaptado para MTB", "Senderos Naturales", "Guías"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Base de Mountain Bike"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadRutaData();
  }, [rutaId]);

  // 🚵‍♂️ RESTO DE FUNCIONES
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToRutas = () => {
    router.push('/sports/mountain-bike/rutas');
  };

  const nextImage = () => {
    if (ruta && ruta.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % ruta.images.length);
    }
  };

  const prevImage = () => {
    if (ruta && ruta.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + ruta.images.length) % ruta.images.length);
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
    router.push(`/sports/reservacancha?canchaId=${ruta.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${ruta?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${ruta?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(ruta?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con mountain bike? Contáctanos al ${ruta?.phone} o envía un email a mtb@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de mountain bike próximamente...`);
  };

  // 🚵‍♂️ LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="mountain-bike" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🚵‍♂️</div>
          <p>Cargando información de la ruta de mountain bike...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!ruta) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="mountain-bike" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información de la ruta</p>
          <button onClick={() => router.push('/sports/mountain-bike/rutas')}>
            Volver a rutas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="mountain-bike" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🚵‍♂️</span>
            <h1 className={styles.headerTitle}>Mountain Bike</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar rutas de mountain bike..."
            sport="mountain-bike"
            onSearch={(term) => router.push(`/sports/mountain-bike/rutas?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToRutas}
          >
            <span>←</span>
            <span>Volver a rutas</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {ruta.name}
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!ruta.activa}
              style={{ 
                opacity: ruta.activa ? 1 : 0.6,
                cursor: ruta.activa ? 'pointer' : 'not-allowed'
              }}
            >
              🚵‍♂️ {ruta.activa ? 'Reservar Ruta' : 'Ruta Cerrada'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{ruta.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(ruta.priceFrom)}/día</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{ruta.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {ruta.amenities.map((amenity: string, index: number) => (
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
            <h3 className={styles.sectionTitle}>Descripción de la Ruta</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🚵‍♂️</span>
              <p className={styles.descriptionText}>{ruta.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{ruta.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{ruta.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación de la Ruta</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={ruta.coordinates.lat} 
                longitude={ruta.coordinates.lng}
                address={ruta.location}
                zoom={15}
                height="250px"
                sport="mountain-bike"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{ruta.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section - SIMPLIFICADA */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos de la Ruta</h3>
            <div className={styles.imageCarousel}>
              {ruta.images.length > 1 && (
                <button className={styles.carouselButton} onClick={prevImage}>
                  ←
                </button>
              )}
              <div className={styles.imageContainer}>
                <Image 
                  src={ruta.images[currentImageIndex] || "/sports/mountain-bike/mountain-bike.png"} 
                  alt={`${ruta.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/mountain-bike/mountain-bike.png";
                  }}
                />
                {ruta.images.length > 1 && (
                  <div className={styles.imageOverlay}>
                    <span className={styles.imageCounter}>
                      {currentImageIndex + 1} / {ruta.images.length}
                    </span>
                  </div>
                )}
              </div>
              {ruta.images.length > 1 && (
                <button className={styles.carouselButton} onClick={nextImage}>
                  →
                </button>
              )}
            </div>
            {ruta.images.length > 1 && (
              <div className={styles.imageIndicators}>
                {ruta.images.map((_: string, index: number) => (
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
          <h3 className={styles.sectionTitle}>Contacto Base de Mountain Bike</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{ruta.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{ruta.instagram}</span>
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
              <span>{ruta.rating.toFixed(1)} • {ruta.reviews} reseñas de MTB</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {ruta.reviewsList.map((review: any, index: number) => (
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
export default function MountainBikeRutaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando ruta de mountain bike...</div>}>
      <MountainBikeRutaSeleccionadaContent />
    </Suspense>
  );
}