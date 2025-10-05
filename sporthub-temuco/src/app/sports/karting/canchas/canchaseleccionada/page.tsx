'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar';
import styles from './canchaseleccionada.module.css';

// Datos mock de la pista específica
const trackData = {
  id: 1,
  name: "Kartódromo Speedway Temuco",
  location: "Sector Industrial, Temuco",
  rating: 4.8,
  reviews: 124,
  price: "$15.000",
  images: [
    "/imagenes/sports/karting/karting1.jpg",
    "/imagenes/sports/karting/karting1-2.jpg",
    "/imagenes/sports/karting/karting1-3.jpg",
    "/imagenes/sports/karting/karting1-4.jpg"
  ],
  features: ["Pista Techada", "Karts Eléctricos", "Cronometraje Digital", "Vestuarios", "Estacionamiento", "Caféteria"],
  description: "La mejor experiencia de karting en Temuco. Pista techada de última generación con karts eléctricos de alto rendimiento y sistema de cronometraje profesional.",
  specs: {
    length: "420 metros",
    width: "8 metros",
    turns: "12 curvas",
    maxSpeed: "45 km/h",
    duration: "10 minutos",
    capacity: "12 karts simultáneos"
  },
  schedule: {
    weekdays: "10:00 - 22:00",
    weekend: "09:00 - 23:00"
  },
  contact: {
    phone: "+56 9 8765 4321",
    email: "speedway@karting.cl",
    website: "www.speedwaytemuco.cl"
  },
  reviewsList: [
    {
      name: "Carlos R.",
      rating: 5,
      date: "hace 1 día",
      comment: "¡Increíble experiencia! Los karts son súper rápidos y la pista está en perfectas condiciones. El personal es muy profesional."
    },
    {
      name: "María G.",
      rating: 5,
      date: "hace 3 días",
      comment: "Vine con amigos y nos divertimos mucho. La pista techada es genial porque no importa el clima. Recomiendo 100%."
    },
    {
      name: "Pedro M.",
      rating: 4,
      date: "hace 1 semana",
      comment: "Buena instalación y karts en buen estado. El cronometraje digital es una gran adición para competir seriamente."
    },
    {
      name: "Ana L.",
      rating: 5,
      date: "hace 2 semanas",
      comment: "Excelente lugar para cumpleaños. Los niños se divirtieron mucho y los precios son razonables."
    }
  ]
};

// Horarios disponibles mock
const availableSlots = [
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: false },
  { time: "11:30", available: true },
  { time: "12:00", available: true },
  { time: "12:30", available: false },
  { time: "13:00", available: true },
  { time: "13:30", available: true },
  { time: "14:00", available: true },
  { time: "14:30", available: false }
];

export default function CanchaSeleccionadaPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % trackData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + trackData.images.length) % trackData.images.length);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }
    setShowBookingForm(true);
  };

  const calculateTotal = () => {
    const basePrice = parseInt(trackData.price.replace(/[^\d]/g, ''));
    return basePrice * participants;
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

  const handleWriteReview = () => {
    alert('Función de escribir reseña próximamente...');
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar sport="karting" userRole="usuario" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🏎️</div>
            <h1 className={styles.headerTitle}>Karting</h1>
          </div>
          <div className={styles.headerRight}>
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
            onClick={() => router.push('/sports/karting/canchas')}
          >
            <span>←</span>
            <span>Volver a pistas</span>
          </button>
        </div>

        <div className={styles.contentGrid}>
          {/* Left Column - Images and Details */}
          <div className={styles.leftColumn}>
            {/* Image Gallery */}
            <section className={styles.imageSection}>
              <div className={styles.imageGallery}>
                <div className={styles.mainImage}>
                  <img 
                    src={trackData.images[currentImageIndex]} 
                    alt={trackData.name}
                    className={styles.trackImage}
                  />
                  <button 
                    onClick={prevImage}
                    className={`${styles.imageNav} ${styles.prevButton}`}
                  >
                    ‹
                  </button>
                  <button 
                    onClick={nextImage}
                    className={`${styles.imageNav} ${styles.nextButton}`}
                  >
                    ›
                  </button>
                </div>
                <div className={styles.imageThumbnails}>
                  {trackData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`${styles.thumbnail} ${currentImageIndex === index ? styles.activeThumbnail : ''}`}
                    >
                      <img src={image} alt={`Vista ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Description */}
            <section className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Descripción</h2>
              <p className={styles.description}>{trackData.description}</p>
            </section>

            {/* Specifications */}
            <section className={styles.specsSection}>
              <h2 className={styles.sectionTitle}>Especificaciones de la Pista</h2>
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Longitud:</span>
                  <span className={styles.specValue}>{trackData.specs.length}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Ancho:</span>
                  <span className={styles.specValue}>{trackData.specs.width}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Curvas:</span>
                  <span className={styles.specValue}>{trackData.specs.turns}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Velocidad Máx:</span>
                  <span className={styles.specValue}>{trackData.specs.maxSpeed}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Duración:</span>
                  <span className={styles.specValue}>{trackData.specs.duration}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Capacidad:</span>
                  <span className={styles.specValue}>{trackData.specs.capacity}</span>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className={styles.featuresSection}>
              <h2 className={styles.sectionTitle}>Características</h2>
              <div className={styles.featuresList}>
                {trackData.features.map((feature, index) => (
                  <span key={index} className={styles.featureTag}>
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <div className={styles.reviewsTitle}>
                  <span className={styles.reviewsIcon}>⭐</span>
                  <span>{trackData.rating} • {trackData.reviews} reseñas</span>
                </div>
                <button className={styles.writeReviewButton} onClick={handleWriteReview}>
                  ✏️ Escribir reseña
                </button>
              </div>

              <div className={styles.reviewsList}>
                {trackData.reviewsList.map((review, index) => (
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
            </section>
          </div>

          {/* Right Column - Booking */}
          <div className={styles.rightColumn}>
            <div className={styles.bookingCard}>
              <div className={styles.priceSection}>
                <div className={styles.price}>
                  <span className={styles.priceAmount}>{trackData.price}</span>
                  <span className={styles.priceUnit}>por persona</span>
                </div>
              </div>

              <div className={styles.bookingForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha:</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={styles.formInput}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora:</label>
                  <div className={styles.timeSlots}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        className={`${styles.timeSlot} ${
                          slot.available ? styles.available : styles.unavailable
                        } ${selectedTime === slot.time ? styles.selected : ''}`}
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Participantes:</label>
                  <div className={styles.participantSelector}>
                    <button 
                      onClick={() => setParticipants(Math.max(1, participants - 1))}
                      className={styles.participantButton}
                    >
                      -
                    </button>
                    <span className={styles.participantCount}>{participants}</span>
                    <button 
                      onClick={() => setParticipants(Math.min(12, participants + 1))}
                      className={styles.participantButton}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.totalSection}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total:</span>
                    <span className={styles.totalAmount}>${calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  className={styles.bookingButton}
                  disabled={!selectedDate || !selectedTime}
                >
                  🏎️ Reservar Ahora
                </button>
              </div>

              <div className={styles.contactInfo}>
                <h3 className={styles.contactTitle}>Información de Contacto</h3>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  <span>{trackData.contact.phone}</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>✉️</span>
                  <span>{trackData.contact.email}</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>🌐</span>
                  <span>{trackData.contact.website}</span>
                </div>
              </div>

              <div className={styles.scheduleInfo}>
                <h3 className={styles.scheduleTitle}>Horarios</h3>
                <div className={styles.scheduleItem}>
                  <span>Lunes - Viernes:</span>
                  <span>{trackData.schedule.weekdays}</span>
                </div>
                <div className={styles.scheduleItem}>
                  <span>Sábado - Domingo:</span>
                  <span>{trackData.schedule.weekend}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        {showBookingForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>🏁 Reserva Confirmada</h2>
              <div className={styles.confirmationDetails}>
                <p><strong>Pista:</strong> {trackData.name}</p>
                <p><strong>Fecha:</strong> {selectedDate}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                <p><strong>Participantes:</strong> {participants}</p>
                <p><strong>Total:</strong> ${calculateTotal().toLocaleString()}</p>
              </div>
              <div className={styles.modalButtons}>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className={styles.modalButton}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}