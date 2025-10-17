'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

import { useAuthStatus } from '@/hooks/useAuthStatus';
export default function RutaSeleccionadaPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS PARA ENDURO
  const ruta = {
    id: 1,
    name: "Ruta Montaña Extremo",
    location: "Cordillera Central, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@enduroextrem",
    description: "Ruta desafiante para expertos con terrenos rocosos, descensos técnicos y vistas panorámicas espectaculares. Incluye guía certificado y equipo de seguridad.",
    schedule: "Lunes a Domingo • 06:00 a 20:00",
    capacity: "Grupos de 5-8 riders",
    rating: 4.8,
    reviews: 95,
    priceFrom: 35000,
    images: [
      "/sports/enduro/rutas/rutaseleccionada/rutaSelec1.png",
      "/sports/enduro/rutas/rutaseleccionada/rutaSelec2.png",
      "/sports/enduro/rutas/rutaseleccionada/rutaSelec3.png"
    ],
    amenities: ["Guía Certificado", "Equipo Seguridad", "Terreno Rocoso", "Vistas Panorámicas"],
    difficulty: "Alta",
    distance: "15km",
    elevation: "800m",
    duration: "3-4 horas",
    reviewsList: [
      {
        name: "Carlos M.",
        rating: 5,
        date: "hace 2 días",
        comment: "Increíble experiencia! Los guías son profesionales y el terreno es desafiante pero seguro."
      },
      {
        name: "Ana T.",
        rating: 4,
        date: "hace 1 semana", 
        comment: "Vistas espectaculares y rutas bien marcadas. Perfecto para riders con experiencia."
      },
      {
        name: "Diego R.",
        rating: 5,
        date: "hace 2 semanas",
        comment: "El equipo de seguridad es de primera calidad. Volveré sin duda!"
      }
    ]
  };
  
  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setDataLoading(false), 1200);
    

    return () => clearTimeout(timer);
  }, []);
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      router.push('/usuario/EditarPerfil');
    } else {
      router.push('/login');
    }
  };

  const handleBackToRutas = () => {
    router.push('/sports/enduro/rutas');
  };

  const nextImage = () => {
    if (ruta && ruta.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === ruta.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (ruta && ruta.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? ruta.images.length - 1 : prev - 1
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
    router.push('/sports/enduro/rutas/reservar');
  };

  const handleCall = () => {
    window.open(`tel:${ruta.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${ruta.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(ruta.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda? Contáctanos al (45) 555-0000 o envía un email a ayuda@sporthub.cl');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña próximamente...');
  };

  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="enduro" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏍️</div>
          <p>Cargando información de la ruta...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="enduro" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏍️</span>
            <h1 className={styles.headerTitle}>Enduro</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar canchas de enduro..."
            sport="enduro"
            onSearch={(term) => router.push(`/sports/enduro/rutas?search=${encodeURIComponent(term)}`)}
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

        {/* Ruta Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{ruta.name}</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              📅 Reservar
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{ruta.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(ruta.priceFrom)}/persona</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📏</span>
              <span>Dificultad: {ruta.difficulty}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {ruta.amenities.map((amenity, index) => (
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
            <h3 className={styles.sectionTitle}>Descripción</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>✅</span>
              <p className={styles.descriptionText}>{ruta.description}</p>
            </div>
          </div>

          {/* Route Details Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Detalles de la Ruta</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{ruta.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{ruta.capacity}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>📏</span>
                <span className={styles.availabilityText}>Distancia: {ruta.distance}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>⛰️</span>
                <span className={styles.availabilityText}>Desnivel: {ruta.elevation}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>⏱️</span>
                <span className={styles.availabilityText}>Duración: {ruta.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>Ubicación</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={ruta.coordinates.lat} 
                longitude={ruta.coordinates.lng}
                address={ruta.location}
                zoom={12}
                height="250px"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{ruta.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Imágenes de la ruta</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={ruta.images[currentImageIndex] || "/sports/enduro/enduro.png"} 
                  alt={`${ruta.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/enduro/enduro.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {ruta.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {ruta.images.map((_, index) => (
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
          <h3 className={styles.sectionTitle}>Contacto</h3>
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
                💬 Abrir
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <div className={styles.reviewsTitle}>
              <span className={styles.reviewsIcon}>⭐</span>
              <span>{ruta.rating} • {ruta.reviews} reseñas</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {ruta.reviewsList.map((review, index) => (
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