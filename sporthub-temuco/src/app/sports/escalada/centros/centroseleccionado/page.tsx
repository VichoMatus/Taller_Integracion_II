'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

export default function CentroSeleccionadoPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS DE ESCALADA - Sin parámetros URL
  const centro = {
    id: 1,
    name: "Escalada Vertical Centro",
    location: "Av. Alemania 1234, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@escaladaverticaltemuco",
    description: "Centro de escalada indoor con rutas de diferentes niveles, boulder y alquiler de equipos completo. Muros de hasta 15 metros con certificación internacional.",
    schedule: "Lunes a Domingo • 07:00 a 22:00",
    capacity: "25 escaladores simultáneos",
    rating: 4.7,
    reviews: 89,
    priceFrom: 18000,
    images: [
      "/sports/escalada/centros/Centro1.png",
      "/sports/escalada/centros/Centro2.png",
      "/sports/escalada/escalada.png"
    ],
    amenities: ["Equipos Incluidos", "Boulder", "Instructores", "Zona Entrenamiento"],
    reviewsList: [
      {
        name: "María E.",
        rating: 5,
        date: "hace 2 días",
        comment: "Excelentes rutas de escalada para todos los niveles. Los instructores son muy profesionales y el equipo está en perfecto estado."
      },
      {
        name: "Diego R.",
        rating: 5,
        date: "hace 5 días", 
        comment: "Increíble centro de boulder. Las rutas están muy bien diseñadas y el ambiente es genial para entrenar."
      },
      {
        name: "Camila S.",
        rating: 4,
        date: "hace 1 semana",
        comment: "Muy buen centro de escalada. Las paredes son altas y desafiantes. Volveré definitivamente para mejorar mi técnica."
      }
    ]
  };
  
  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToCentros = () => {
    router.push('/sports/escalada/centros');
  };

  const nextImage = () => {
    if (centro && centro.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === centro.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (centro && centro.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? centro.images.length - 1 : prev - 1
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
    router.push('/sports/reservacentro');
  };

  const handleCall = () => {
    window.open(`tel:${centro.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${centro.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(centro.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda? Contáctanos al (45) 555-0000 o envía un email a ayuda@sporthub.cl');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña próximamente...');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="escalada" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🧗‍♂️</div>
          <p>Cargando información del centro de escalada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="escalada" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🧗‍♂️</span>
            <h1 className={styles.headerTitle}>Escalada - {centro.name}</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar centros de escalada..."
            sport="escalada"
            onSearch={(term) => router.push(`/sports/escalada/centros?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToCentros}
          >
            <span>←</span>
            <span>Volver a centros</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{centro.name} - Centro Escalada</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              🧗‍♀️ Reservar sesión
            </button>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{centro.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(centro.priceFrom)}/sesión</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {centro.amenities.map((amenity, index) => (
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
            <h3 className={styles.sectionTitle}>🏔️ Descripción del centro</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>🧗‍♂️</span>
              <p className={styles.descriptionText}>{centro.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>🕐 Horarios y capacidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{centro.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{centro.capacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>📍 Ubicación</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={centro.coordinates.lat} 
                longitude={centro.coordinates.lng}
                address={centro.location}
                zoom={15}
                height="250px"
                sport="escalada"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{centro.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>📸 Imágenes del centro</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={centro.images[currentImageIndex] || "/sports/escalada/centros/Centro1.png"} 
                  alt={`${centro.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/escalada/escalada.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {centro.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {centro.images.map((_, index) => (
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
          <h3 className={styles.sectionTitle}>📞 Contacto</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{centro.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{centro.instagram}</span>
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
              <span>{centro.rating} • {centro.reviews} reseñas</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {centro.reviewsList.map((review, index) => (
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