'use client';
import React from 'react';
import styles from './ReviewsList.module.css';
import { Resena } from '@/types/resena';

interface ReviewsListProps {
  reviews: Resena[];
  isLoading?: boolean;
  onWriteReview?: () => void;
  showWriteButton?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading = false,
  onWriteReview,
  showWriteButton = true
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < rating ? styles.starFilled : ''}`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.calificacion, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Reseñas</h2>
          {reviews.length > 0 && (
            <div className={styles.ratingInfo}>
              <span className={styles.averageRating}>
                ⭐ {getAverageRating()}
              </span>
              <span className={styles.reviewCount}>
                ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}
        </div>
        {showWriteButton && onWriteReview && (
          <button className={styles.writeButton} onClick={onWriteReview}>
            ✏️ Escribir reseña
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>Sin reseñas aún</h3>
          <p>Sé el primero en compartir tu experiencia en esta cancha</p>
          {showWriteButton && onWriteReview && (
            <button className={styles.writeButtonPrimary} onClick={onWriteReview}>
              Escribir la primera reseña
            </button>
          )}
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    <span>U</span>
                  </div>
                  <div className={styles.userDetails}>
                    <p className={styles.userName}>
                      Usuario {review.usuarioId}
                    </p>
                    <div className={styles.ratingStars}>
                      {renderStars(review.calificacion)}
                    </div>
                  </div>
                </div>
                <span className={styles.date}>
                  {formatDate(review.fechaCreacion)}
                </span>
              </div>
              <p className={styles.comment}>{review.comentario}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
