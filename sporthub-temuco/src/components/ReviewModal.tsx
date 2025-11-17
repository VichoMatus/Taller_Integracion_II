'use client';
import React, { useState, FormEvent } from 'react';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  canchaName?: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  canchaName = 'esta cancha'
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }
    
    if (comment.length > 500) {
      setError('El comentario no puede superar los 500 caracteres');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(rating, comment);
      
      // Resetear formulario
      setRating(0);
      setComment('');
      setHoverRating(0);
    } catch (err: any) {
      // Extraer mensaje de error correctamente
      let errorMessage = err?.response?.data?.message || err?.message || 'Error al enviar la reseña';
      
      // Convertir a string si es un objeto
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage);
      }
      
      // Mostrar mensajes amigables según el tipo de error
      if (errorMessage.includes('reserva confirmada') || errorMessage.includes('reseñar si tienes')) {
        setError('Para dejar una reseña, primero debes tener una reserva confirmada en esta cancha.');
      } else if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
        setError('Ya has dejado una reseña en esta cancha. Solo puedes dejar una reseña por cancha.');
      } else if (errorMessage.includes('UniqueViolation')) {
        setError('Ya has dejado una reseña en esta cancha. Solo puedes dejar una reseña por cancha.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`${styles.star} ${
          (hoverRating || rating) >= star ? styles.starFilled : ''
        }`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
      >
        ★
      </button>
    ));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Escribir Reseña</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>¿Cómo calificarías {canchaName}?</label>
            <div className={styles.starsContainer}>
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className={styles.ratingText}>
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment">Tu opinión</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia (opcional)"
              className={styles.textarea}
              rows={4}
              maxLength={500}
            />
            <small className={styles.charCount}>
              {comment.length}/500 caracteres
            </small>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
