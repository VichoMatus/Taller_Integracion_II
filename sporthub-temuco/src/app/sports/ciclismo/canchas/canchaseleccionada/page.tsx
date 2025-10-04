'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar';
import SearchBar from '../../../../../components/SearchBar';
import styles from './page.module.css';

export default function CanchaSeleccionadaPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [cyclists, setCyclists] = useState('1');

  // Datos de ejemplo de la ruta seleccionada
  const rutaData = {
    name: "Ciclismo - Sendero Bosque",
    address: "Parque Nacional, Zona Norte",
    rating: 4.7,
    reviews: 156,
    price: 15,
    images: [
      "/sports/ciclismo/rutas/Ruta1.png",
      "/sports/ciclismo/rutas/Ruta1-2.jpg",
      "/sports/ciclismo/rutas/Ruta1-3.jpg"
    ],
    description: "Hermosa ruta de ciclismo de montaña que te lleva a través de senderos naturales con vistas panorámicas espectaculares. Ideal para ciclistas con experiencia media que buscan una aventura en contacto con la naturaleza.",
    features: [
      "Sendero natural de 15km",
      "Dificultad media",
      "Vistas panorámicas",
      "Estacionamiento gratuito",
      "Área de descanso",
      "Guía opcional disponible"
    ],
    rules: [
      "Uso obligatorio de casco",
      "Bicicleta en buen estado",
      "Respetar señalización",
      "No salir del sendero marcado",
      "Llevar agua suficiente",
      "Horario: 6:00 AM - 6:00 PM"
    ],
    difficulty: "Media",
    distance: "15 km",
    estimatedTime: "2-3 horas",
    terrain: "Sendero natural",
    reviewsList: [
      {
        name: "Miguel T.",
        rating: 5,
        date: "hace 2 días",
        comment: "¡Increíble ruta! Las vistas son espectaculares y el sendero está muy bien mantenido. Perfecto para una salida de fin de semana."
      },
      {
        name: "Carolina S.",
        rating: 5,
        date: "hace 4 días",
        comment: "Ruta desafiante pero hermosa. Los guías son muy profesionales y se preocupan por la seguridad. Recomiendo totalmente."
      },
      {
        name: "Diego P.",
        rating: 4,
        date: "hace 1 semana",
        comment: "Buena experiencia general. El terreno es variado y las vistas compensan el esfuerzo. Solo sugiero llevar más agua de la necesaria."
      },
      {
        name: "Valentina R.",
        rating: 5,
        date: "hace 2 semanas",
        comment: "Una de las mejores rutas de ciclismo que he hecho. La naturaleza es impresionante y el nivel de dificultad está bien balanceado."
      }
    ]
  };

  const availableTimes = [
    "06:00", "07:00", "08:00", "09:00", "10:00",
    "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00"
  ];

  const handleReservation = () => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }
    
    console.log('Reserva:', {
      ruta: rutaData.name,
      fecha: selectedDate,
      hora: selectedTime,
      duracion: duration,
      ciclistas: cyclists,
      precio: rutaData.price * parseInt(duration) * parseInt(cyclists)
    });
    
    alert('¡Reserva realizada con éxito!');
  };

  const totalPrice = rutaData.price * parseInt(duration) * parseInt(cyclists);

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
      <Sidebar userRole="usuario" sport="ciclismo" />
      
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>🚴</div>
            <h1 className={styles.headerTitle}>Ciclismo</h1>
          </div>
          <div className={styles.headerRight}>
           <SearchBar
            placeholder="Buscar rutas de ciclismo..."
            sport="ciclismo"
            onSearch={(term: string) => router.push(`/sports/ciclismo/canchas?search=${encodeURIComponent(term)}`)}
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
            onClick={() => router.push('/sports/ciclismo/canchas')}
          >
            <span>←</span>
            <span>Volver a rutas</span>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.leftSection}>
            <div className={styles.imageGallery}>
              <img 
                src={rutaData.images[0]} 
                alt={rutaData.name}
                className={styles.mainImage}
              />
              <div className={styles.thumbnails}>
                {rutaData.images.slice(1).map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`Vista ${index + 2}`}
                    className={styles.thumbnail}
                  />
                ))}
              </div>
            </div>

            <div className={styles.infoCard}>
              <h1 className={styles.rutaTitle}>{rutaData.name}</h1>
              <div className={styles.location}>
                <span className={styles.locationIcon}>📍</span>
                {rutaData.address}
              </div>
              
              <div className={styles.rating}>
                <span className={styles.stars}>
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className={i < Math.floor(rutaData.rating) ? styles.starFilled : styles.starEmpty}>
                      ⭐
                    </span>
                  ))}
                </span>
                <span className={styles.ratingNumber}>{rutaData.rating}</span>
                <span className={styles.reviewCount}>({rutaData.reviews} reseñas)</span>
              </div>

              <div className={styles.quickStats}>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>🚴‍♂️</span>
                  <span className={styles.statLabel}>Dificultad</span>
                  <span className={styles.statValue}>{rutaData.difficulty}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>📏</span>
                  <span className={styles.statLabel}>Distancia</span>
                  <span className={styles.statValue}>{rutaData.distance}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>⏱️</span>
                  <span className={styles.statLabel}>Tiempo estimado</span>
                  <span className={styles.statValue}>{rutaData.estimatedTime}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>🌄</span>
                  <span className={styles.statLabel}>Terreno</span>
                  <span className={styles.statValue}>{rutaData.terrain}</span>
                </div>
              </div>

              <div className={styles.description}>
                <h3>Descripción</h3>
                <p>{rutaData.description}</p>
              </div>

              <div className={styles.features}>
                <h3>Características</h3>
                <ul>
                  {rutaData.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.rules}>
                <h3>Normas y recomendaciones</h3>
                <ul>
                  {rutaData.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <div className={styles.reviewsTitle}>
                  <span className={styles.reviewsIcon}>⭐</span>
                  <span>{rutaData.rating} • {rutaData.reviews} reseñas</span>
                </div>
                <button className={styles.writeReviewButton} onClick={handleWriteReview}>
                  ✏️ Escribir reseña
                </button>
              </div>

              <div className={styles.reviewsList}>
                {rutaData.reviewsList.map((review, index) => (
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
          </div>

          <div className={styles.rightSection}>
            <div className={styles.reservationCard}>
              <div className={styles.priceHeader}>
                <span className={styles.price}>${rutaData.price}</span>
                <span className={styles.priceUnit}>por hora / ciclista</span>
              </div>

              <div className={styles.reservationForm}>
                <div className={styles.formGroup}>
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Hora de inicio</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Seleccionar hora</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duración (horas)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={styles.select}
                    >
                      <option value="1">1 hora</option>
                      <option value="2">2 horas</option>
                      <option value="3">3 horas</option>
                      <option value="4">4 horas</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ciclistas</label>
                    <select
                      value={cyclists}
                      onChange={(e) => setCyclists(e.target.value)}
                      className={styles.select}
                    >
                      {Array.from({length: 6}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} ciclista{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.breakdownRow}>
                    <span>${rutaData.price} x {duration} hora{parseInt(duration) > 1 ? 's' : ''} x {cyclists} ciclista{parseInt(cyclists) > 1 ? 's' : ''}</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className={styles.breakdownTotal}>
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <button 
                  className={styles.reserveButton}
                  onClick={handleReservation}
                >
                  Reservar ruta
                </button>

                <div className={styles.contact}>
                  <p>¿Necesitas ayuda?</p>
                  <button className={styles.contactButton}>
                    💬 Contactar
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.mapCard}>
              <h3>Ubicación</h3>
              <div className={styles.mapPlaceholder}>
                <div className={styles.mapIcon}>🗺️</div>
                <p>Mapa interactivo<br />próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}