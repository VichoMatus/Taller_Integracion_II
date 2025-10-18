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
  
  // 🏃 DATOS ESTÁTICOS PARA ATLETISMO
  const cancha = {
    id: 1,
    name: "Pista Atlética Central Temuco",
    location: "Complejo Deportivo Municipal, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@pistacentraltemuco",
    description: "Pista atlética profesional de 8 carriles con áreas completas de salto en largo, triple salto, salto en alto y lanzamiento de jabalina, disco y martillo. Instalaciones de primer nivel con cronometraje electrónico y graderías para espectadores.",
    schedule: "Lunes a Domingo • 06:00 a 22:00",
    capacity: "Hasta 50 atletas simultáneos",
    rating: 4.7,
    reviews: 89,
    priceFrom: 18000,
    images: [
      "/sports/atletismo/canchas/Cancha1.png",
      "/sports/atletismo/canchas/Cancha2.png"
    ],
    amenities: ["Pista de 8 Carriles", "Área de Saltos", "Zona Lanzamientos", "Cronometraje Electrónico", "Graderías", "Vestuarios", "Iluminación LED"],
    difficulty: "Todos los niveles",
    surface: "Sintética profesional",
    features: "Entrenadores certificados • Competiciones • Área de calentamiento",
    reviewsList: [
      {
        name: "Carlos M.",
        rating: 5,
        date: "hace 2 días",
        comment: "Excelente pista! La superficie es perfecta y el cronometraje muy preciso. Ideal para entrenamientos serios."
      },
      {
        name: "Ana T.",
        rating: 4,
        date: "hace 1 semana",
        comment: "Instalaciones de primer nivel. Las áreas de salto están muy bien equipadas y el personal es profesional."
      },
      {
        name: "Roberto L.",
        rating: 5,
        date: "hace 2 semanas",
        comment: "La iluminación es perfecta para partidos nocturnos. Césped en excelente condición."
      }
    ]
  };
  
  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setDataLoading(false), 1200);
    const handleUserButtonClick = () => {

      if (isAuthenticated) {

        router.push('/usuario/EditarPerfil');

      } else {

        router.push('/login');

      }

    };


    return () => clearTimeout(timer);
  }, []);

  const handleBackToCanchas = () => {
    router.push('/sports/atletismo/canchas');
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
    alert('¿Necesitas ayuda? Contáctanos al (45) 555-0000 o envía un email a ayuda@sporthub.cl');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña próximamente...');
  };

  if (dataLoading) {
    const handleUserButtonClick = () => {

      if (isAuthenticated) {

        router.push('/usuario/EditarPerfil');

      } else {

        router.push('/login');

      }

    };


    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="atletismo" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏃</div>
          <p>Cargando información de la pista atlética...</p>
        </div>
      </div>
    );
  }

  const handleUserButtonClick = () => {


    if (isAuthenticated) {


      router.push('/usuario/EditarPerfil');


    } else {


      router.push('/login');


    }


  };



  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏃</span>
            <h1 className={styles.headerTitle}>Pista Atlética</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar pistas de atletismo..."
            sport="atletismo"
            onSearch={(term) => router.push(`/sports/atletismo/canchas?search=${encodeURIComponent(term)}`)}
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
            <span>Volver a pistas</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{cancha.name} - Pista Atlética</h2>
            <button className={styles.reserveButton} onClick={handleReserve}>
              📅 Reservar
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
            <h3 className={styles.sectionTitle}>Descripción</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>✅</span>
              <p className={styles.descriptionText}>{cancha.description}</p>
            </div>
          </div>

          {/* Availability Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>Disponibilidad</h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🕒</span>
                <span className={styles.availabilityText}>{cancha.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>👥</span>
                <span className={styles.availabilityText}>{cancha.capacity}</span>
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
                latitude={cancha.coordinates.lat} 
                longitude={cancha.coordinates.lng}
                address={cancha.location}
                zoom={15}
                height="250px"
                sport="atletismo"
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
            <h3 className={styles.sectionTitle}>Imágenes de referencia</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={cancha.images[currentImageIndex] || "/sports/atletismo/canchas/Cancha1.png"} 
                  alt={`${cancha.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/atletismo/atletismo.png";
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
          <h3 className={styles.sectionTitle}>Contacto</h3>
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
              <span>{cancha.rating} • {cancha.reviews} reseñas</span>
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

