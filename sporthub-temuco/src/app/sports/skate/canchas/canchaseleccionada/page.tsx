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
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 DATOS ESTÁTICOS PARA SKATE
  const cancha = {
    id: 1,
    name: "Skate Plaza Central",
    location: "Plaza de Armas, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@skateplazatemuco",
    description: "Skatepark urbano con bowl profesional, rampas quarter pipe, zona street completa y área de flatground. Espacio ideal para skaters de todos los niveles con iluminación nocturna y zona de descanso. ¡Ven a registrar tu presencia y únete a la comunidad!",
    schedule: "Lunes a Domingo • 06:00 a 22:00",
    capacity: "Hasta 50 skaters simultáneos",
    rating: 4.7,
    reviews: 89,
    priceFrom: 0, // Gratis para skate
    images: [
      "/sports/skate/canchas/Skate1.svg",
      "/sports/skate/canchas/Skate2.svg"
    ],
    amenities: ["Bowl Profesional", "Rampas Quarter Pipe", "Zona Street", "Área Flatground", "Iluminación Nocturna", "Zona de Descanso"],
    difficulty: "Todos los niveles",
    surface: "Concreto pulido",
    features: "Música ambiental • WiFi gratuito • Tienda skate",
    reviewsList: [
      {
        name: "Alex R.",
        rating: 5,
        date: "hace 1 día",
        comment: "Excelente spot para practicar! El bowl está perfecto y siempre hay buena onda entre los skaters."
      },
      {
        name: "Sofi M.",
        rating: 4,
        date: "hace 3 días",
        comment: "Me encanta venir aquí después del colegio. Las rampas están bien cuidadas y hay buena iluminación."
      },
      {
        name: "Tomi G.",
        rating: 5,
        date: "hace 1 semana",
        comment: "La mejor plaza de skate de la zona. Siempre limpio y con buena música. ¡Recomendado!"
      }
    ]
  };

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setDataLoading(false), 1200);
    

    return () => clearTimeout(timer);
  }, []);

  const handleBackToCanchas = () => {
    router.push('/sports/skate/canchas');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (term: string) => {
    router.push(`/sports/skate/canchas?search=${encodeURIComponent(term)}`);
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
    return price === 0 ? "Gratis" : new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleRegisterPresence = () => {
    // Para skate, en lugar de reservar, registramos presencia
    alert('¡Presencia registrada! Bienvenido al skatepark. Disfruta tu sesión.');
    // Aquí iría la lógica para registrar presencia en el sistema
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
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="skate" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🛹</div>
          <p>Cargando información del skatepark...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />

      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🛹</div>
            <h1 className={styles.headerTitle}>Skate</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="Nombre del skatepark o ubicación..."
            sport="skate"
            />
            <button className={styles.userButton} onClick={() => router.push('/usuario/perfil')}>
              <span>👤</span>
              <span>usuario</span>
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
            <span>Volver a skateparks</span>
          </button>
        </div>

        {/* Court Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{cancha.name}</h2>
            <button className={styles.reserveButton} onClick={handleRegisterPresence}>
              � Registrar Presencia
            </button>
          </div>

          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{cancha.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>{formatPrice(cancha.priceFrom)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>🎯</span>
              <span>Dificultad: {cancha.difficulty}</span>
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
            <h3 className={styles.sectionTitle}>Información del Skatepark</h3>
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
                <span className={styles.availabilityIcon}>🏗️</span>
                <span className={styles.availabilityText}>Superficie: {cancha.surface}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🎵</span>
                <span className={styles.availabilityText}>{cancha.features}</span>
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
            <h3 className={styles.sectionTitle}>Imágenes del skatepark</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image
                  src={cancha.images[currentImageIndex] || "/sports/skate/canchas/Skate1.svg"}
                  alt={`${cancha.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/skate/canchas/Skate1.svg";
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
