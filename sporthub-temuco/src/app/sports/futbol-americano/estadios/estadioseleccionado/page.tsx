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

// 🏈 DATOS ESTÁTICOS PARA CAMPOS NO DISPONIBLES EN LA API
const staticContactData = {
  phone: "(45) 555-1234",
  instagram: "@futbolamericanotemuco",
  reviewsList: [
    {
      name: "Carlos M.",
      rating: 5,
      date: "hace 3 días",
      comment: "Increíble estadio de fútbol americano! Los postes de gol están perfectos y el campo tiene las medidas reglamentarias. Experiencia única."
    },
    {
      name: "Ana G.",
      rating: 4,
      date: "hace 1 semana", 
      comment: "Excelente estadio, vestuarios amplios y personal muy profesional. Las yardas están perfectamente marcadas."
    },
    {
      name: "Roberto L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "El mejor estadio de fútbol americano de la región. Superficie artificial de primera calidad y iluminación espectacular."
    }
  ]
};

// 🏈 COMPONENTE PRINCIPAL CON SUSPENSE
function FutbolAmericanoEstadioSeleccionadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [estadio, setEstadio] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🏈 OBTENER ID DEL ESTADIO DESDE URL
  const estadioId = searchParams?.get('id') || searchParams?.get('estadio');

  useEffect(() => {
    const loadEstadioData = async () => {
      if (!estadioId) {
        setError('No se especificó ID de estadio');
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);
        
        console.log('🔍 Cargando estadio ID:', estadioId);
        
        // 🏈 LLAMADA A LA API PARA OBTENER EL ESTADIO (SIN FILTRO ESTRICTO)
        const estadioData = await canchaService.getCanchaById(parseInt(estadioId));
        console.log('✅ Estadio cargado:', estadioData);

        // 🏈 OBTENER DATOS DEL COMPLEJO
        let complejoData = null;
        let locationInfo = "Av. Alemania 1234, Temuco, Chile"; // Fallback estático
        let coordinates = { lat: -38.7359, lng: -72.5904 }; // Fallback estático

        if (estadioData.establecimientoId) {
          try {
            console.log('🔍 Cargando complejo ID:', estadioData.establecimientoId);
            complejoData = await complejosService.getComplejoById(estadioData.establecimientoId);
            console.log('✅ Complejo cargado:', complejoData);
            
            // 🏈 USAR DIRECCIÓN REAL DEL COMPLEJO
            if (complejoData.direccion) {
              locationInfo = complejoData.direccion;
              console.log('📍 Dirección obtenida del complejo:', locationInfo);
            }
            
            // 🏈 USAR COORDENADAS DEL COMPLEJO SI ESTÁN DISPONIBLES
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

        // 🏈 MAPEAR DATOS DE LA API CON INFORMACIÓN DEL COMPLEJO
        const mappedEstadio = {
          id: estadioData.id,
          name: `${estadioData.nombre} (Adaptado para Fútbol Americano)`,
          
          // 🏈 USAR UBICACIÓN REAL DEL COMPLEJO
          location: locationInfo,
          coordinates: coordinates,
          
          // 🏈 DESCRIPCIÓN ADAPTADA
          description: `${estadioData.nombre} - Estadio deportivo ${complejoData ? `en ${complejoData.nombre}` : ''} adaptado para fútbol americano. Perfecto para partidos y entrenamientos profesionales.`,
          
          // 🏈 HORARIOS - USAR DEL COMPLEJO SI ESTÁ DISPONIBLE
          schedule: complejoData?.horarioAtencion || "Lunes a Domingo • 08:00 a 22:00",
          
          // 🏈 CAPACIDAD ESPECÍFICA PARA FÚTBOL AMERICANO
          capacity: "22 jugadores (11 vs 11)",
          
          // 🏈 DATOS REALES DE LA API
          rating: estadioData.rating || 4.8,
          reviews: 89, // Estático por ahora
          priceFrom: estadioData.precioPorHora || 45000,
          
          // 🏈 IMÁGENES ESPECÍFICAS DE FÚTBOL AMERICANO
          images: [
            `/sports/futbol-americano/futbol-americano.png` // Solo una imagen por defecto
          ],
          
          // 🏈 AMENIDADES BÁSICAS CON DATOS REALES
          amenities: [
            estadioData.activa ? "Estadio Disponible" : "Estadio Cerrado",
            estadioData.techada ? "Estadio Techado" : "Estadio al Aire Libre",
            "Adaptado para Fútbol Americano",
            "Postes de Gol Reglamentarios",
            "Campo de 100 Yardas",
            "Vestuarios Profesionales"
          ],
          
          // 🏈 CONTACTO ESTÁTICO (hasta implementar en complejo)
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          reviewsList: staticContactData.reviewsList,

          // 🏈 INFORMACIÓN ADICIONAL REAL
          establecimientoId: estadioData.establecimientoId,
          tipo: estadioData.tipo,
          techada: estadioData.techada,
          activa: estadioData.activa,
          
          // 🏈 INFORMACIÓN DEL COMPLEJO
          complejoNombre: complejoData?.nombre || `Complejo ${estadioData.establecimientoId}`
        };

        setEstadio(mappedEstadio);
        
      } catch (error: any) {
        console.error('❌ Error cargando estadio:', error);
        setError(`Error cargando estadio: ${error.message}`);
        
        // 🏈 FALLBACK SIMPLE
        setEstadio({
          id: estadioId,
          name: `Estadio #${estadioId} (Fútbol Americano)`,
          location: "Av. Alemania 1234, Temuco, Chile",
          coordinates: { lat: -38.7359, lng: -72.5904 },
          phone: staticContactData.phone,
          instagram: staticContactData.instagram,
          description: `Estadio adaptado para fútbol americano - ID: ${estadioId}`,
          schedule: "Lunes a Domingo • 08:00 a 22:00",
          capacity: "22 jugadores (11 vs 11)",
          rating: 4.8,
          reviews: 89,
          priceFrom: 45000,
          images: ["/sports/futbol-americano/futbol-americano.png"],
          amenities: ["Datos offline", "Adaptado para Fútbol Americano", "Postes de Gol", "Vestuarios"],
          reviewsList: staticContactData.reviewsList,
          activa: true,
          complejoNombre: "Estadio Deportivo"
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadEstadioData();
  }, [estadioId]);

  // 🏈 RESTO DE FUNCIONES
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToEstadios = () => {
    router.push('/sports/futbol-americano/estadios');
  };

  const nextImage = () => {
    if (estadio && estadio.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % estadio.images.length);
    }
  };

  const prevImage = () => {
    if (estadio && estadio.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + estadio.images.length) % estadio.images.length);
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
    router.push(`/sports/reservacancha?canchaId=${estadio.id}`);
  };

  const handleCall = () => {
    window.open(`tel:${estadio?.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${estadio?.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(estadio?.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert(`¿Necesitas ayuda con fútbol americano? Contáctanos al ${estadio?.phone} o envía un email a futbolamericano@sporthub.cl`);
  };

  const handleWriteReview = () => {
    alert(`Función de escribir reseña de fútbol americano próximamente...`);
  };

  // 🏈 LOADING Y ERROR
  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol-americano" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏈</div>
          <p>Cargando información del estadio de fútbol americano...</p>
          {error && <p style={{color: 'red', marginTop: '10px'}}>⚠️ {error}</p>}
        </div>
      </div>
    );
  }

  if (!estadio) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="futbol-americano" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>❌</div>
          <p>No se pudo cargar la información del estadio</p>
          <button onClick={() => router.push('/sports/futbol-americano/estadios')}>
            Volver a estadios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="futbol-americano" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏈</span>
            <h1 className={styles.headerTitle}>Fútbol Americano</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar estadios de fútbol americano..."
            sport="futbol-americano"
            onSearch={(term) => router.push(`/sports/futbol-americano/estadios?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToEstadios}
          >
            <span>←</span>
            <span>Volver a estadios</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>
              {estadio.name}
            </h2>
            <button 
              className={styles.reserveButton} 
              onClick={handleReserve}
              disabled={!estadio.activa}
              style={{ 
                opacity: estadio.activa ? 1 : 0.6,
                cursor: estadio.activa ? 'pointer' : 'not-allowed'
              }}
            >
              🏈 {estadio.activa ? 'Reservar Estadio' : 'Estadio Cerrado'}
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{estadio.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(estadio.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              <span>{estadio.complejoNombre}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {estadio.amenities.map((amenity: string, index: number) => (
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
            <h3 className={styles.sectionTitle}>Descripción del Estadio</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🏈</span>
              <p className={styles.descriptionText}>{estadio.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{estadio.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{estadio.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación del Estadio</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={estadio.coordinates.lat} 
                longitude={estadio.coordinates.lng}
                address={estadio.location}
                zoom={15}
                height="250px"
                sport="futbol-americano"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{estadio.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section - SIMPLIFICADA */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Fotos del Estadio</h3>
            <div className={styles.imageCarousel}>
              {estadio.images.length > 1 && (
                <button className={styles.carouselButton} onClick={prevImage}>
                  ←
                </button>
              )}
              <div className={styles.imageContainer}>
                <Image 
                  src={estadio.images[currentImageIndex] || "/sports/futbol-americano/futbol-americano.png"} 
                  alt={`${estadio.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/futbol-americano/futbol-americano.png";
                  }}
                />
                {estadio.images.length > 1 && (
                  <div className={styles.imageOverlay}>
                    <span className={styles.imageCounter}>
                      {currentImageIndex + 1} / {estadio.images.length}
                    </span>
                  </div>
                )}
              </div>
              {estadio.images.length > 1 && (
                <button className={styles.carouselButton} onClick={nextImage}>
                  →
                </button>
              )}
            </div>
            {estadio.images.length > 1 && (
              <div className={styles.imageIndicators}>
                {estadio.images.map((_: string, index: number) => (
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
          <h3 className={styles.sectionTitle}>Contacto Club de Fútbol Americano</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{estadio.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{estadio.instagram}</span>
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
              <span>{estadio.rating.toFixed(1)} • {estadio.reviews} reseñas de fútbol americano</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {estadio.reviewsList.map((review: any, index: number) => (
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
export default function FutbolAmericanoEstadioSeleccionado() {
  return (
    <Suspense fallback={<div>Cargando estadio de fútbol americano...</div>}>
      <FutbolAmericanoEstadioSeleccionadoContent />
    </Suspense>
  );
}