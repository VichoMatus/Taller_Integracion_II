'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

export default function EstadioSeleccionadoPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS - Estadio de Fútbol Americano
  const estadio = {
    id: 1,
    name: "Estadio Azteca - Principal",
    location: "Av. Alemania 1234, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@estadioazteca",
    description: "Estadio profesional para fútbol americano con medidas oficiales, césped natural de primera calidad y equipamiento completo para partidos y entrenamientos.",
    schedule: "Lunes a Domingo • 08:00 a 23:00",
    capacity: "22 jugadores (11vs11) + árbitros",
    rating: 4.8,
    reviews: 245,
    priceFrom: 85000,
    images: [
      "/sports/futbol-americano/canchas/Estadio1.png",
      "/sports/futbol-americano/canchas/Estadio2.png",
      "/sports/futbol-americano/futbol-americano.png"
    ],
    amenities: ["Gradas", "Vestuarios Profesionales", "Iluminación Nocturna", "Estacionamiento"],
    reviewsList: [
      {
        name: "Carlos R.",
        rating: 5,
        date: "hace 2 días",
        comment: "Excelente estadio, el césped está impecable y las instalaciones son de primera. Perfecto para partidos oficiales."
      },
      {
        name: "Ana M.",
        rating: 4,
        date: "hace 1 semana", 
        comment: "Muy buenas instalaciones, los vestuarios están limpios y el personal es muy amable."
      },
      {
        name: "Miguel T.",
        rating: 5,
        date: "hace 2 semanas",
        comment: "La iluminación nocturna es excelente, jugamos hasta tarde sin problemas. Volveremos seguro."
      }
    ]
  };
  
  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToEstadios = () => {
    router.push('/sports/futbol-americano/estadios');
  };

  const nextImage = () => {
    if (estadio && estadio.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === estadio.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (estadio && estadio.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? estadio.images.length - 1 : prev - 1
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
    router.push('/sports/reservaestadio');
  };

  const handleCall = () => {
    window.open(`tel:${estadio.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${estadio.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(estadio.location);
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
        <Sidebar userRole="usuario" sport="futbol-americano" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏈</div>
          <p>Cargando información del estadio...</p>
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
            <h1 className={styles.headerTitle}>Fútbol Americano - {estadio.name}</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar estadios de fútbol americano..."
            sport="futbol-americano"
            onSearch={(term) => router.push(`/sports/futbol-americano/estadios?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToEstadios}
          >
            <span>←</span>
            <span>Volver a estadios</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{estadio.name} - Estadio Fútbol Americano</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              📅 Reservar
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
          </div>

          <div className={styles.courtTabs}>
            {estadio.amenities.map((amenity, index) => (
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
            <h3 className={styles.sectionTitle}>Ubicación</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={estadio.coordinates.lat} 
                longitude={estadio.coordinates.lng}
                address={estadio.location}
                zoom={15}
                height="250px"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{estadio.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>Imágenes del estadio</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={estadio.images[currentImageIndex] || "/sports/futbol-americano/canchas/Estadio1.png"} 
                  alt={`${estadio.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/futbol-americano/canchas/Estadio1.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {estadio.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {estadio.images.map((_, index) => (
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
              <span>{estadio.rating} • {estadio.reviews} reseñas</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {estadio.reviewsList.map((review, index) => (
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