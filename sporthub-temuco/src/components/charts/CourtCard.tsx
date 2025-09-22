import React from 'react';
import styles from './stylesCourtCards/BasquetbolCanchasCard.module.css';

interface CourtCardProps {
  imageUrl: string;
  name: string;
  address: string;
  rating: number;
  reviews: string | number;
  tags: string[];
  description: string;
  price: string;
  nextAvailable: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel';
  onClick?: () => void;
}

const CourtCard: React.FC<CourtCardProps> = ({
  imageUrl,
  name,
  address,
  rating,
  reviews,
  tags,
  description,
  price,
  nextAvailable,
  onClick,
}) => {
  // 🔥 Limitar a máximo 4 tags
  const displayTags = tags.slice(0, 4);
  
  return (
    <div className={styles.courtCard}>
      <img
        src={imageUrl}
        alt={name}
        className={styles.cardImage}
      />
      
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleSection}>
            <h3 className={styles.cardTitle}>{name}</h3>
            <p className={styles.cardAddress}>{address}</p>
          </div>
          
          <div className={styles.ratingBadge}>
            <svg className={styles.starIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.287-3.967z"/>
            </svg>
            <span className={styles.ratingNumber}>{rating}</span>
            <span className={styles.ratingReviews}>({reviews} reseñas)</span>
          </div>
        </div>

        <div className={styles.tagsContainer}>
          {displayTags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <p className={styles.description}>
          {description}
        </p>

        <div className={styles.cardFooter}>
          <div className={styles.priceSection}>
            <span className={styles.price}>${price}/h</span>
            <span className={styles.nextTime}>Próximo: {nextAvailable}</span>
          </div>
          
          <button onClick={onClick} className={styles.actionButton}>
            Ir a cancha →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;