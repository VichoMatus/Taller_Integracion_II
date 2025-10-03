'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar'; 
import SearchBar from '../../../../../components/SearchBar'; 
import LocationMap from '../../../../../components/LocationMap'; 
import styles from './page.module.css';

export default function GimnasioSeleccionadoPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // 🔥 DATOS ESTÁTICOS DE CROSSFIT Y ENTRENAMIENTO FUNCIONAL
  const gimnasio = {
    id: 1,
    name: "CrossFit Iron Box",
    location: "Av. Alemania 1456, Centro, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-9876",
    instagram: "@crossfitironbox",
    description: "Box de CrossFit completamente equipado con rigs profesionales, kettlebells, barras olímpicas, plataformas de halterofilia y entrenadores certificados Level 2. Ofrecemos clases grupales, entrenamiento personalizado y programas de competencia.",
    schedule: "Lunes a Viernes • 05:30 a 22:00 | Sábados • 07:00 a 20:00 | Domingos • 08:00 a 18:00",
    capacity: "Clases de 12-15 atletas máximo",
    rating: 4.8,
    reviews: 187,
    priceFrom: 18000,
    images: [
      "/sports/crossfit/gimnasios/Gym1.png",
      "/sports/crossfit/gimnasios/Gym2.png",
      "/sports/crossfit/crossfit.png"
    ],
    amenities: ["Rigs Profesionales", "Barras Olímpicas", "Kettlebells Certificadas", "Coaching Level 2", "Zona de Movilidad", "Vestidores Premium"],
    reviewsList: [
      {
        name: "María P.",
        rating: 5,
        date: "hace 2 días",
        comment: "El mejor box de Temuco! Los coaches están súper preparados y el equipamiento es de primera. Las clases son desafiantes pero adaptadas a todos los niveles."
      },
      {
        name: "Diego R.",
        rating: 5,
        date: "hace 1 semana", 
        comment: "Llevo 6 meses entrenando aquí y los resultados han sido increíbles. Excelente comunidad, equipos top y programación variada."
      },
      {
        name: "Carla M.",
        rating: 4,
        date: "hace 2 semanas",
        comment: "Gran ambiente de entrenamiento. Los WODs están bien estructurados y siempre hay escalamientos. La zona de movilidad es perfecta para el warm-up."
      }
    ],
    workoutTypes: [
      "WOD del Día", 
      "Strength Training", 
      "EMOM/AMRAP", 
      "Hero WODs", 
      "Open Box", 
      "Personal Training"
    ],
    equipment: [
      "Rigs de CrossFit", 
      "Barras Olímpicas Rogue", 
      "Kettlebells 8-32kg", 
      "Pull-up Bars", 
      "Rowing Machines", 
      "Assault Bikes", 
      "Plataformas de Halterofilia",
      "Medicine Balls",
      "Battle Ropes",
      "Box Jumps"
    ]
  };
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToGimnasios = () => {
    router.push('/sports/crossfitentrenamientofuncional/gimnasios');
  };

  const nextImage = () => {
    if (gimnasio && gimnasio.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === gimnasio.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (gimnasio && gimnasio.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? gimnasio.images.length - 1 : prev - 1
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
    router.push('/sports/reservagimnasio');
  };

  const handleCall = () => {
    window.open(`tel:${gimnasio.phone}`, '_self');
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${gimnasio.instagram.replace('@', '')}`, '_blank');
  };

  const handleDirections = () => {
    const query = encodeURIComponent(gimnasio.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleHelp = () => {
    alert('¿Necesitas ayuda con tu entrenamiento? Contáctanos al (45) 555-0000 o envía un email a ayuda@sporthub.cl. También ofrecemos asesoría nutricional!');
  };

  const handleWriteReview = () => {
    alert('Función de escribir reseña próximamente...');
  };

  const handleTrialClass = () => {
    alert('¡Excelente! Contacta al gimnasio para agendar tu clase de prueba gratuita. Incluye intro a movimientos básicos y WOD adaptado.');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}>🏋️‍♂️</div>
          <p>Cargando información del gimnasio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="crossfitentrenamientofuncional" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🏋️‍♂️</span>
            <h1 className={styles.headerTitle}>CrossFit - {gimnasio.name}</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar boxes de CrossFit..."
            sport="crossfitentrenamientofuncional"
            onSearch={(term) => router.push(`/sports/crossfitentrenamientofuncional/gimnasios?search=${encodeURIComponent(term)}`)}
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
            onClick={handleBackToGimnasios}
          >
            <span>←</span>
            <span>Volver a gimnasios</span>
          </button>
        </div>

        {/* Gym Info Card */}
        <div className={styles.courtInfoCard}>
          <div className={styles.courtHeader}>
            <h2 className={styles.courtTitle}>{gimnasio.name} - Box de CrossFit</h2>
            <div style={{display: 'flex', gap: '12px'}}>
              <button className={styles.reserveButton} onClick={handleReserve}>
                💪 Reservar
              </button>
              <button className={styles.reserveButton} onClick={handleTrialClass} style={{background: 'linear-gradient(135deg, #272829 0%, #61677A 100%)'}}>
                🎯 Clase Prueba
              </button>
            </div>
          </div>
          
          <div className={styles.courtDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>📍</span>
              <span>{gimnasio.location}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>💰</span>
              <span>Desde {formatPrice(gimnasio.priceFrom)}/clase</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>👥</span>
              <span>{gimnasio.capacity}</span>
            </div>
          </div>

          <div className={styles.courtTabs}>
            {gimnasio.amenities.map((amenity, index) => (
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
            <h3 className={styles.sectionTitle}>🏋️‍♀️ Sobre el Gimnasio</h3>
            <div className={styles.descriptionCard}>
              <span className={styles.descriptionIcon}>✅</span>
              <p className={styles.descriptionText}>{gimnasio.description}</p>
            </div>
          </div>

          {/* Workout Types Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>💪 Tipos de Entrenamiento</h3>
            <div className={styles.availabilityCard}>
              {gimnasio.workoutTypes.map((workout, index) => (
                <div key={index} className={styles.availabilityItem}>
                  <span className={styles.availabilityIcon}>🔥</span>
                  <span className={styles.availabilityText}>{workout}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>🏋️ Equipamiento Disponible</h3>
            <div className={styles.availabilityCard}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px'}}>
                {gimnasio.equipment.map((item, index) => (
                  <div key={index} className={styles.availabilityItem}>
                    <span className={styles.availabilityIcon}>⚡</span>
                    <span className={styles.availabilityText}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className={styles.availabilitySection}>
            <h3 className={styles.sectionTitle}>🕒 Horarios </h3>
            <div className={styles.availabilityCard}>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>📅</span>
                <span className={styles.availabilityText}>{gimnasio.schedule}</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>⏰</span>
                <span className={styles.availabilityText}>Clases cada hora | WOD del día publicado a las 20:00</span>
              </div>
              <div className={styles.availabilityItem}>
                <span className={styles.availabilityIcon}>🎯</span>
                <span className={styles.availabilityText}>Open Gym disponible 24/7 para miembros premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location and Images Container */}
        <div className={styles.locationImagesContainer}>
          {/* Location Section */}
          <div className={styles.locationSection}>
            <h3 className={styles.sectionTitle}>📍 Ubicación del Gimnasio</h3>
            <div className={styles.mapContainer}>
              <LocationMap 
                latitude={gimnasio.coordinates.lat} 
                longitude={gimnasio.coordinates.lng}
                address={gimnasio.location}
                zoom={15}
                height="250px"
                sport="crossfitentrenamientofuncional"
              />
              <div className={styles.locationInfo}>
                <p className={styles.locationAddress}>{gimnasio.location}</p>
                <button className={styles.directionsButton} onClick={handleDirections}>
                  🧭 Cómo llegar al gimnasio
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.imagesSection}>
            <h3 className={styles.sectionTitle}>📸 Galería del Gimnasio</h3>
            <div className={styles.imageCarousel}>
              <button className={styles.carouselButton} onClick={prevImage}>
                ←
              </button>
              <div className={styles.imageContainer}>
                <Image 
                  src={gimnasio.images[currentImageIndex] || "/sports/crossfitentrenamientofuncional/gimnasios/Gimnasio1.png"} 
                  alt={`${gimnasio.name} - Imagen ${currentImageIndex + 1}`}
                  className={styles.courtImage}
                  width={600}
                  height={400}
                  onError={(e: any) => {
                    e.target.src = "/sports/crossfitentrenamientofuncional/crossfitentrenamientofuncional.png";
                  }}
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {gimnasio.images.length}
                  </span>
                </div>
              </div>
              <button className={styles.carouselButton} onClick={nextImage}>
                →
              </button>
            </div>
            <div className={styles.imageIndicators}>
              {gimnasio.images.map((_, index) => (
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
          <h3 className={styles.sectionTitle}>📞 Contacto y Redes</h3>
          <div className={styles.contactCard}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Teléfono:</span>
                <span className={styles.contactValue}>{gimnasio.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram:</span>
                <span className={styles.contactValue}>{gimnasio.instagram}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>WODs:</span>
                <span className={styles.contactValue}>Publicados diariamente en redes</span>
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
              <span>{gimnasio.rating} • {gimnasio.reviews} reseñas del gimnasio</span>
            </div>
            <button className={styles.writeReviewButton} onClick={handleWriteReview}>
              ✏️ Escribir reseña
            </button>
          </div>

          <div className={styles.reviewsList}>
            {gimnasio.reviewsList.map((review, index) => (
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