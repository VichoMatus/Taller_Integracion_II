'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

import { useAuthStatus } from '@/hooks/useAuthStatus';
export default function CanchaSeleccionadaPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, buttonProps, refreshAuth } = useAuthStatus();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS DE PADEL - Adaptado completamente
  const cancha = {
    id: 1,
    name: "Padel Elite Center",
    location: "Av. Alemania 1234, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@padelelitecenter",
    description: "Cancha de padel profesional con paredes de cristal templado, superficie sintética de competición y sistema de iluminación LED de última generación. Incluye raquetas y pelotas.",
    schedule: "Lunes a Domingo • 07:00 a 23:00",
    capacity: "4 jugadores (2vs2)",
    rating: 4.7,
    reviews: 89,
    priceFrom: 35000,
    images: [
      "/sports/padel/canchas/Cancha1.png",
      "/sports/padel/canchas/Cancha2.png",
      "/sports/padel/canchas/Cancha3.png",
      "/sports/padel/padel.png"
    ],
    amenities: ["Paredes de Cristal", "Superficie Premium", "Raquetas Incluidas", "Vestuarios Premium", "Climatizada"],
    reviewsList: [
      {
        name: "María P.",
        rating: 5,
        date: "hace 2 días",
        comment: "Increíble cancha de padel! Las paredes de cristal están perfectas y la superficie es de primera calidad. Las raquetas incluidas son muy buenas."
      },
      {
        name: "Diego R.",
        rating: 5,
        date: "hace 5 días", 
        comment: "La mejor cancha de padel de Temuco. Climatizada, excelente iluminación y el personal muy profesional. Totalmente recomendada."
      },
      {
        name: "Francisca L.",
        rating: 4,
        date: "hace 1 semana",
        comment: "Muy buena experiencia jugando padel. La cancha está en perfecto estado y los vestuarios son premium. Volveremos pronto."
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
    router.push('/sports/reservacancha');
  };

  const handleCall = () => {
    window.open(`tel:${cancha.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${cancha.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(cancha.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda con padel? Contáctanos al (45) 555-0000 o envía un email a padel@sporthub.cl');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña de padel próximamente...');
  };

  if (dataLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="padel" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🎾</div>
          <p>Cargando información de la cancha de padel...</p>
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
            <h1 className={styles.headerTitle}>Padel</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar canchas de padel..."
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
            <h2 className={styles.courtTitle}>{cancha.name} - Cancha Padel</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              🎾 Reservar
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
              <span className={styles.detailIcon}>⭐</span>
              <span>{cancha.rating} • {cancha.reviews} reseñas</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {cancha.amenities.map((amenity, index) => (
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
            <h3 className={styles.sectionTitle}>
              <span>🏟️</span>
              Descripción de la Cancha de Padel
            </h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🎾</span>
              <p className={styles.descriptionText}>{cancha.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>
              <span>📅</span>
              Disponibilidad 
            </h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{cancha.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{cancha.capacity}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🎾</span>
                <span className={styles.availabilityText}>Raquetas y pelotas incluidas</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🌡️</span>
                <span className={styles.availabilityText}>Cancha climatizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>
              <span>📍</span>
              Ubicación de la Cancha
            </h3>
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
            <h3 className={styles.sectionTitle}>
              <span>📸</span>
              Imágenes de la Cancha
            </h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={cancha.images[currentImageIndex] || "/sports/padel/canchas/Cancha1.png"} 
                  alt={`${cancha.name} - Cancha de Padel - Imagen ${currentImageIndex + 1}`}
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
              {cancha.images.map((_, index) => (
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
          <h3 className={styles.sectionTitle}>
            <span>📱</span>
            Contacto Padel Elite Center
          </h3>
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
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Especialidad:</span>
                <span className={styles.contactValue}>Padel Profesional</span>
              </div>
            </div>
            <div className={styles.contactButtons}>
              <button className={styles.contactButton} onClick={handleCall}>
                📞 Llamar
              </button>
              <button className={styles.contactButton} onClick={handleInstagram}>
                💬 Instagram
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <div className={styles.reviewsTitle}>
              <span className={styles.reviewsIcon}>⭐</span>
              <span>{cancha.rating} • {cancha.reviews} reseñas </span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {cancha.reviewsList.map((review, index) => (
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