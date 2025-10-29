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

// 🏊‍♂️ DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@clubnataciontemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Excelente pileta olímpica! El agua está perfectamente climatizada y muy limpia. Las instalaciones son de primera calidad."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buena pileta, vestuarios limpios y personal amable. El sistema de filtrado mantiene el agua cristalina."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "La iluminación subacuática es perfecta para natación nocturna. Carriles bien marcados y profundidad ideal."
    }
  ]
};

// 🏊‍♂️ COMPONENTE PRINCIPAL CON SUSPENSE
function NatacionPiletaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [pileta, setPileta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🏊‍♂️ OBTENER ID DE LA PILETA DESDE URL
  const piletaId = searchParams?.get('id') || searchParams?.get('pileta');

  useEffect(() => {
    const loadPiletaData = async () => {
      if (!piletaId) {
        setError('No se especificó ID de pileta');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando pileta ID:', piletaId);
        
        // 🏊‍♂️ LLAMADA A LA API PARA OBTENER LA PILETA
        const piletaData = await canchaService.getCanchaById(parseInt(piletaId));
        console.log('✅ Pileta cargada:', piletaData);

        // 🏊‍♂️ VERIFICAR QUE SEA UNA PILETA DE NATACIÓN
        if (!['natacion', 'swimming', 'pileta', 'piscina'].includes(piletaData.tipo.toLowerCase())) {
          throw new Error(`Esta instalación es de ${piletaData.tipo}, no de natación`);
        }

        // 🏊‍♂️ OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (piletaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', piletaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(piletaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🏊‍♂️ USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🏊‍♂️ USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🏊‍♂️ MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedPileta = {
          id: piletaData.id,
          name: piletaData.nombre,
          
          // 🏊‍♂️ USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🏊‍♂️ DESCRIPCIÓN SIMPLE CON DATOS REALES
          description: `${piletaData.nombre} - Pileta de ${piletaData.tipo}${complejoData ? ` en ${complejoData.nombre}` : ''} con agua climatizada y sistema de filtrado profesional. Ideal para natación recreativa, entrenamiento y competencias.`,
          
          // 🏊‍♂️ HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 06:00 a 22:00",
          
          // 🏊‍♂️ CAPACIDAD ESPECÍFICA PARA NATACIÓN
          capacity: (() => {
            switch (piletaData.tipo?.toLowerCase()) {
              case 'natacion':
              case 'swimming': 
                return "50 nadadores (8 carriles)";
              case 'pileta olimpica': 
                return "80 nadadores (10 carriles)";
              case 'pileta recreativa': 
                return "30 nadadores (6 carriles)";
              default: 
                return "Consultar capacidad";
            }
          })(),
          
          // 🏊‍♂️ DATOS REALES DE LA API
          rating: piletaData.rating || 4.6,
          reviews: 84, // Estático por ahora
          priceFrom: piletaData.precioPorHora || 15000,
          
          // 🏊‍♂️ IMÁGENES ESPECÍFICAS DE NATACIÓN
          images: [
            `/sports/natacion/piletas/Pileta1.png`,
            `/sports/natacion/piletas/Pileta2.png`,
            `/sports/natacion/piletas/Pileta3.png`,
            `/sports/natacion/natacion.png`
          ],
          
          // 🏊‍♂️ AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            piletaData.activa ? "Disponible" : "No disponible",
            piletaData.techada ? "Pileta Techada" : "Pileta Exterior",
            "Agua Climatizada",
            "Carriles Profesionales",
            "Sistema de Filtrado",
            "Iluminación LED",
            "Vestuarios VIP"
          ],
          
          // 🏊‍♂️ CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🏊‍♂️ INFORMACIÓN ADICIONAL REAL
          establecimientoId: piletaData.establecimientoId,
          tipo: piletaData.tipo,
          techada: piletaData.techada,
          activa: piletaData.activa,
          
          // 🏊‍♂️ INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Complejo ${piletaData.establecimientoId}`
        };

        setPileta(mappedPileta);
        
      } catch (error: any) {
        console.error('❌ Error cargando pileta:', error);
        setError(`Error cargando pileta: ${error.message}`);
        
        // 🏊‍♂️ FALLBACK SIMPLE
        setPileta({
          id: piletaId,
          name: `Club Natación Temuco #${piletaId}`,
          location: "Av. Alemania 1234, Temuco, Chile", // Fallback estático
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Pileta de Natación #${piletaId} con agua climatizada - Datos no disponibles`,
          schedule: "Lunes a Domingo • 06:00 a 22:00",
          capacity: "50 nadadores (8 carriles)",
          rating: 4.6,
          reviews: 84,
          priceFrom: 15000,
          images: [
            "/sports/natacion/natacion.png",
            "/sports/natacion/natacion.png",
            "/sports/natacion/natacion.png"
          ],
          amenities: ["Datos offline", "Agua Climatizada", "Carriles Profesionales", "Iluminación LED"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Club de Natación"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadPiletaData();
  }, [piletaId]);

  // 🏊‍♂️ RESTO DE FUNCIONES SIN CAMBIOS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToPiletas = () => {
    router.push('/sports/natacion/piletas');
  };

  const nextImage = () => {
    if (pileta && pileta.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === pileta.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (pileta && pileta.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? pileta.images.length - 1 : prev - 1
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
    router.push(`/sports/reservacancha?canchaId=${pileta.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${pileta?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${pileta?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(pileta?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con natación? Contáctanos al ${pileta?.phone} o envía un email a natacion@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de natación próximamente...`);
  };

  // 🏊‍♂️ LOADING Y ERROR - SIN CAMBIOS
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="natacion" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏊‍♂️</div>
          <p>Cargando información de la pileta de natación...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!pileta) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="natacion" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información de la pileta de natación</p>
          <button onClick={() => router.push('/sports/natacion/piletas')}>
            Volver a piletas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="natacion" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏊‍♂️</span>
            <h1 className={styles.headerTitle}>Natación</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar piletas de natación..."
            sport="natacion"
            onSearch={(term) => router.push(`/sports/natacion/piletas?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToPiletas}
          >
            <span>←</span>
            <span>Volver a piletas</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {pileta.name} - {pileta.tipo?.charAt(0).toUpperCase() + pileta.tipo?.slice(1) || 'Natación'}
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!pileta.activa}
              style={{ 
                opacity: pileta.activa ? 1 : 0.6,
                cursor: pileta.activa ? 'pointer' : 'not-allowed'
              }}
            >
              🏊‍♂️ {pileta.activa ? 'Reservar' : 'No disponible'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{pileta.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(pileta.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{pileta.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {pileta.amenities.map((amenity: string, index: number) => (
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
            <h3 className={styles.sectionTitle}>Descripción de la Pileta</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🏊‍♂️</span>
              <p className={styles.descriptionText}>{pileta.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{pileta.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{pileta.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación de la Pileta</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={pileta.coordinates.lat} 
                longitude={pileta.coordinates.lng}
                address={pileta.location}
                zoom={15}
                height="250px"
                sport="natacion"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{pileta.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos de la Pileta</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={pileta.images[currentImageIndex] || "/sports/natacion/natacion.png"} 
                  alt={`${pileta.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/natacion/natacion.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {pileta.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {pileta.images.map((_: string, index: number) => (
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
          <h3 className={styles.sectionTitle}>Contacto Club de Natación</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{pileta.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{pileta.instagram}</span>
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
              <span>{pileta.rating.toFixed(1)} • {pileta.reviews} reseñas de natación</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {pileta.reviewsList.map((review: any, index: number) => (
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
export default function NatacionPiletaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando pileta de natación...</div>}>
      <NatacionPiletaSeleccionadaContent />
    </Suspense>
  );
}