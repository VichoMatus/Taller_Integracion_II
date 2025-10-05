'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

export default function PiscinaSeleccionadaPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS DE NATACIÓN - Adaptado completamente
  const piscina = {
    id: 1,
    name: "Natación Elite Center",
    location: "Av. Alemania 1234, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@natacionelitecenter",
    description: "Piscina olímpica profesional con sistema de filtración de última generación y tratamiento de agua con ozono. Incluye carriles demarcados y equipos de natación profesionales.",
    schedule: "Lunes a Domingo • 06:00 a 22:00",
    capacity: "8 carriles simultáneos",
    rating: 4.9,
    reviews: 187,
    priceFrom: 35000,
    images: [
      "/sports/natacion/piscinas/Piscina1.png",
      "/sports/natacion/piscinas/Piscina2.png",
      "/sports/natacion/piscinas/Piscina3.png",
      "/sports/natacion/natacion.png"
    ],
    amenities: ["Piscina Olímpica", "Sistema Ozono", "Vestuarios Premium", "Zona Calentamiento", "Instructor Profesional"],
    reviewsList: [
      {
        name: "Laura M.",
        rating: 5,
        date: "hace 2 días",
        comment: "Excelente piscina de natación! El agua está perfectamente tratada y los carriles están bien demarcados. Ideal para entrenamiento profesional."
      },
      {
        name: "Diego R.",
        rating: 5,
        date: "hace 5 días", 
        comment: "La mejor piscina de natación de Temuco. Sistema de filtración de primera y vestuarios impecables. Totalmente recomendada."
      },
      {
        name: "Carolina L.",
        rating: 4,
        date: "hace 1 semana",
        comment: "Muy buena experiencia nadando. La piscina está en perfectas condiciones y la temperatura del agua es ideal. Volveremos pronto."
      }
    ]
  };
  
  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToPiscinas = () => {
    router.push('/sports/natacion/piletas');
  };

  const nextImage = () => {
    if (piscina && piscina.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === piscina.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (piscina && piscina.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? piscina.images.length - 1 : prev - 1
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
    window.open(`tel:${piscina.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${piscina.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(piscina.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda con natación? Contáctanos al (45) 555-0000 o envía un email a natacion@sporthub.cl');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña de natación próximamente...');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="natacion" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏊‍♂️</div>
          <p>Cargando información de la piscina de natación...</p>
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
            placeholder="Buscar piscinas de natación..."
            sport="natacion"
            onSearch={(term) => router.push(`/sports/natacion/piletas?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToPiscinas}
          >
            <span>←</span>
            <span>Volver a piscinas</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{piscina.name} - Piscina Natación</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              🏊‍♂️ Reservar
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{piscina.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(piscina.priceFrom)}/h</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>⭐</span>
              <span>{piscina.rating} • {piscina.reviews} reseñas</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {piscina.amenities.map((amenity, index) => (
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
              <span>🏊‍♂️</span>
              Descripción de la Piscina de Natación
            </h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🏊‍♂️</span>
              <p className={styles.descriptionText}>{piscina.description}</p>
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
                <span className={styles.availabilityText}>{piscina.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{piscina.capacity}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🏊‍♂️</span>
                <span className={styles.availabilityText}>Equipos de natación incluidos</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>💧</span>
                <span className={styles.availabilityText}>Tratamiento con ozono</span>
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
              Ubicación de la Piscina
            </h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={piscina.coordinates.lat} 
                longitude={piscina.coordinates.lng}
                address={piscina.location}
                zoom={15}
                height="250px"
                sport="natacion"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{piscina.location}</p>
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
              Imágenes de la Piscina
            </h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={piscina.images[currentImageIndex] || "/sports/natacion/piscinas/Piscina1.png"} 
                  alt={`${piscina.name} - Piscina de Natación - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/natacion/natacion.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {piscina.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {piscina.images.map((_, index) => (
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
            Contacto Natación Elite Center
          </h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{piscina.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{piscina.instagram}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Especialidad:</span>
                <span className={styles.contactValue}>Natación Profesional</span>
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
              <span>{piscina.rating} • {piscina.reviews} reseñas </span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {piscina.reviewsList.map((review, index) => (
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