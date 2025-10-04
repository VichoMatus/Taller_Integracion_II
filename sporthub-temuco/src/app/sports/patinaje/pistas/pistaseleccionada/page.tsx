'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

export default function PistaSeleccionadaPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS DE PATINAJE - Adaptado completamente
  const pista = {
    id: 1,
    name: "Patinaje Elite Center",
    location: "Av. Alemania 1234, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@patinajeelitecenter",
    description: "Pista de patinaje profesional con superficie de resina premium y sistema de iluminación LED de última generación. Incluye patines y protecciones de alta calidad.",
    schedule: "Lunes a Domingo • 07:00 a 23:00",
    capacity: "20 patinadores",
    rating: 4.8,
    reviews: 156,
    priceFrom: 28000,
    images: [
      "/sports/patinaje/canchas/Pista1.png",
      "/sports/patinaje/canchas/Pista2.png",
      "/sports/patinaje/canchas/Pista3.png",
      "/sports/patinaje/patinaje.png"
    ],
    amenities: ["Superficie Resina", "Iluminación Premium", "Patines Incluidos", "Vestuarios VIP", "Zona Descanso"],
    reviewsList: [
      {
        name: "María G.",
        rating: 5,
        date: "hace 2 días",
        comment: "Increíble pista de patinaje! La superficie de resina es perfecta para patinar y los patines incluidos son de muy buena calidad."
      },
      {
        name: "Carlos L.",
        rating: 5,
        date: "hace 5 días", 
        comment: "La mejor pista de patinaje de Temuco. Climatizada, excelente iluminación y el personal muy profesional. Totalmente recomendada."
      },
      {
        name: "Ana P.",
        rating: 4,
        date: "hace 1 semana",
        comment: "Muy buena experiencia patinando. La pista está en perfecto estado y los vestuarios son premium. Volveremos pronto."
      }
    ]
  };
  
  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToPistas = () => {
    router.push('/sports/patinaje/canchas');
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
    router.push('/sports/reservacancha');
  };

  const handleCall = () => {
    window.open(`tel:${pista.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${pista.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(pista.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda con patinaje? Contáctanos al (45) 555-0000 o envía un email a patinaje@sporthub.cl');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña de patinaje próximamente...');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="patinaje" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>⛸️</div>
          <p>Cargando información de la pista de patinaje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="patinaje" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>⛸️</span>
            <h1 className={styles.headerTitle}>Patinaje - {pista.name}</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar pistas de patinaje..."
            sport="patinaje"
            onSearch={(term) => router.push(`/sports/patinaje/canchas?search=${encodeURIComponent(term)}`)}
            />
            <button className={styles.userButton}>
              <span>👤</span>
              <span>Usuario</span>
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

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{pista.name} - Pista Patinaje</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              ⛸️ Reservar
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
              <span className={styles.detailIcon}>⭐</span>
              <span>{pista.rating} • {pista.reviews} reseñas</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {pista.amenities.map((amenity, index) => (
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
              Descripción de la Pista de Patinaje
            </h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>⛸️</span>
              <p className={styles.descriptionText}>{pista.description}</p>
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
                <span className={styles.availabilityText}>{pista.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{pista.capacity}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>⛸️</span>
                <span className={styles.availabilityText}>Patines y protecciones incluidas</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>💡</span>
                <span className={styles.availabilityText}>Iluminación profesional</span>
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
              Ubicación de la Pista
            </h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={pista.coordinates.lat} 
                longitude={pista.coordinates.lng}
                address={pista.location}
                zoom={15}
                height="250px"
                sport="patinaje"
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
            <h3 className={styles.sectionTitle}>
              <span>📸</span>
              Imágenes de la Pista
            </h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={pista.images[currentImageIndex] || "/sports/patinaje/canchas/Pista1.png"} 
                  alt={`${pista.name} - Pista de Patinaje - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/patinaje/patinaje.png";
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
              {pista.images.map((_, index) => (
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
            Contacto Patinaje Elite Center
          </h3>
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
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Especialidad:</span>
                <span className={styles.contactValue}>Patinaje Profesional</span>
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
              <span>{pista.rating} • {pista.reviews} reseñas </span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {pista.reviewsList.map((review, index) => (
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