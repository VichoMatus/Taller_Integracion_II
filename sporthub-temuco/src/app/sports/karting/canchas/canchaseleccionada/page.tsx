'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar'; 
import SearchBar from '@/components/SearchBar'; 
import LocationMap from '@/components/LocationMap'; 
import styles from './canchaseleccionada.module.css';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { canchaService } from '../../../../../services/canchaService';
import { complejosService } from '../../../../../services/complejosService';

// 🏁 DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@kartingtemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "¡Increíble experiencia de karting! La pista está en perfecto estado y los karts muy bien mantenidos."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Muy buena pista de karting, cronómetro preciso y personal muy profesional. Volveré pronto."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "El mejor kartódromo de la región. Circuito técnico y desafiante, ideal para competir."
    }
  ]
};

// 🏁 COMPONENTE PRINCIPAL CON SUSPENSE
function KartingPistaSeleccionadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [pista, setPista] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🏁 OBTENER ID DE LA PISTA DESDE URL
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
        
        // 🏁 LLAMADA A LA API PARA OBTENER LA PISTA
        const pistaData = await canchaService.getCanchaById(parseInt(pistaId));
        console.log('✅ Pista cargada:', pistaData);

        // 🏁 OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (pistaData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', pistaData.establecimientoId);
            complejoData = await complejosService.getComplejoById(pistaData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🏁 USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🏁 USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🏁 MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedPista = {
          id: pistaData.id,
          name: pistaData.nombre,
          
          // 🏁 USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🏁 DESCRIPCIÓN ESPECÍFICA PARA KARTING
          description: `${pistaData.nombre} - Kartódromo${complejoData ? ` en ${complejoData.nombre}` : ''}. Experiencia de carreras única.`,
          
          // 🏁 HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 10:00 a 22:00",
          
          // 🏁 CAPACIDAD ESPECÍFICA PARA KARTING
          capacity: (() => {
            switch (pistaData.tipo?.toLowerCase()) {
              case 'karting':
              case 'kart': 
                return "12 karts - Sesiones de 10 min";
              case 'automovilismo':
              case 'racing': 
                return "8 karts profesionales - 15 min";
              default: 
                return "Consultar especificaciones";
            }
          })(),
          
          // 🏁 DATOS REALES DE LA API
          rating: pistaData.rating || 4.7,
          reviews: 156, // Estático por ahora
          priceFrom: pistaData.precioPorHora || 45000,
          
          // 🏁 IMÁGENES ESPECÍFICAS DE KARTING
          images: [
            `/sports/karting/pistas/Pista1.png`,
            `/sports/karting/pistas/Pista2.png`,
            `/sports/karting/pistas/Pista3.png`
          ],
          
          // 🏁 AMENIDADES ESPECÍFICAS DE KARTING
          amenities: [
            pistaData.activa ? "Disponible" : "No disponible",
            pistaData.techada ? "Pista cubierta" : "Pista exterior",
            "Cronómetro digital",
            "Karts mantenidos",
            "Cascos incluidos",
            "Área de espera"
          ],
          
          // 🏁 CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🏁 INFORMACIÓN ADICIONAL REAL
          establecimientoId: pistaData.establecimientoId,
          tipo: pistaData.tipo,
          techada: pistaData.techada,
          activa: pistaData.activa,
          
          // 🏁 INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Kartódromo ${pistaData.establecimientoId}`
        };

        setPista(mappedPista);
        
      } catch (error: any) {
        console.error('❌ Error cargando pista:', error);
        setError(`Error cargando pista: ${error.message}`);
        
        // 🏁 FALLBACK SIMPLE
        setPista({
          id: pistaId,
          name: `Kartódromo #${pistaId}`,
          location: "Av. Alemania 1234, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Kartódromo #${pistaId} - Datos no disponibles`,
          schedule: "Lunes a Domingo • 10:00 a 22:00",
          capacity: "12 karts - Sesiones de 10 min",
          rating: 4.7,
          reviews: 156,
          priceFrom: 45000,
          images: [
            "/sports/karting/pistas/Pista1.png",
            "/sports/karting/pistas/Pista2.png",
            "/sports/karting/pistas/Pista3.png"
          ],
          amenities: ["Datos offline", "Cronómetro", "Karts", "Cascos", "Seguridad"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Kartódromo"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadPistaData();
  }, [pistaId]);

  // 🏁 RESTO DE FUNCIONES ADAPTADAS
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToPistas = () => {
    router.push('/sports/karting/canchas');
  };

  const nextImage = () => {
    if (pista && pista.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === pista.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (pista && pista.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? pista.images.length - 1 : prev - 1
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
    alert(`¿Necesitas ayuda con karting? Contáctanos al ${pista?.phone} o envía un email a karting@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de karting próximamente...`);
  };

  // 🏁 LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="karting" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏁</div>
          <p>Cargando información del kartódromo...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!pista) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="karting" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información del kartódromo</p>
          <button onClick={() => router.push('/sports/karting/canchas')}>
            Volver a kartódromos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="karting" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏁</span>
            <h1 className={styles.headerTitle}>Karting</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar kartódromos..."
            sport="karting"
            onSearch={(term) => router.push(`/sports/karting/canchas?search=${encodeURIComponent(term)}`)}
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
            <span>Volver a kartódromos</span>
          </button>
        </div>

        {/* Track Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {pista.name} - Karting
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
              🏁 {pista.activa ? 'Reservar Sesión' : 'Pista Cerrada'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{pista.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(pista.priceFrom)}/sesión</span>
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
            <h3 className={styles.sectionTitle}>Descripción del Kartódromo</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🏁</span>
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
                <span className={styles.availabilityIcon}>🏁</span>
                <span className={styles.availabilityText}>{pista.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación del Kartódromo</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={pista.coordinates.lat} 
                longitude={pista.coordinates.lng}
                address={pista.location}
                zoom={15}
                height="250px"
                sport="karting"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{pista.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos del Kartódromo</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={pista.images[currentImageIndex] || "/sports/karting/pistas/Pista1.png"} 
                  alt={`${pista.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/karting/karting.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {pista.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {pista.images.map((_: string, index: number) => (
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
          <h3 className={styles.sectionTitle}>Contacto Kartódromo</h3>
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
              <span>{pista.rating.toFixed(1)} • {pista.reviews} reseñas de karting</span>
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
export default function KartingPistaSeleccionada() {
  return (
    <Suspense fallback={<div>Cargando kartódromo...</div>}>
      <KartingPistaSeleccionadaContent />
    </Suspense>
  );
}