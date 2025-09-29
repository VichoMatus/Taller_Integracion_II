import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './stylesCourtCards/BasquetbolCanchasCard.module.css';
import tenisStyles from './stylesCourtCards/TenisCanchasCard.module.css'; // Nueva importación

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
  sport = 'basquetbol',
  onClick,
}) => {
  const router = useRouter();
  
  // 🔥 Función para obtener estilos según deporte
  const getSportStyles = () => {
    switch (sport) {
      case 'tenis':
        return tenisStyles;
      case 'basquetbol':
      default:
        return styles;
    }
  };

  const sportStyles = getSportStyles();
  
  // 🔥 Limitar a máximo 4 tags
  const displayTags = tags.slice(0, 4);
  
  // 🔥 Función para manejar navegación específica por deporte
  const handleInternalClick = () => {
    if (onClick) {
      onClick();
    } else {
      switch (sport) {
        case 'basquetbol':
          router.push('/sports/basquetbol/canchas/canchaseleccionada');
          break;
          
        case 'futbol':
          const futbolParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            reviews: reviews.toString().replace(' reseñas', ''),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/futbol/canchas/canchaseleccionada?${futbolParams.toString()}`);
          break;
          
        case 'tenis':
          const tenisParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            reviews: reviews.toString().replace(' reseñas', ''),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/tenis/canchas/canchaseleccionada?${tenisParams.toString()}`);
          break;
          
        case 'voleibol':
          const voleibolParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            reviews: reviews.toString().replace(' reseñas', ''),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/voleibol/canchas/canchaseleccionada?${voleibolParams.toString()}`);
          break;
          
        case 'padel':
          const padelParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            reviews: reviews.toString().replace(' reseñas', ''),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/padel/canchas/canchaseleccionada?${padelParams.toString()}`);
          break;
          
        default:
          console.log('Deporte no configurado:', sport);
          router.push('/sports/basquetbol/canchas/canchaseleccionada');
      }
    }
  };
  
  return (
    <div className={`${sportStyles.courtCard} ${sport ? sportStyles[`courtCard${sport.charAt(0).toUpperCase() + sport.slice(1)}`] : ''}`}>
      <Image
        src={imageUrl}
        alt={name}
        className={sportStyles.cardImage}
        width={300}
        height={200}
      />
      
      <div className={sportStyles.cardContent}>
        <div className={sportStyles.cardHeader}>
          <div className={sportStyles.cardTitleSection}>
            <h3 className={sportStyles.cardTitle}>{name}</h3>
            <p className={sportStyles.cardAddress}>{address}</p>
          </div>
          
          <div className={sportStyles.ratingBadge}>
            <svg className={sportStyles.starIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.287-3.967z"/>
            </svg>
            <span className={sportStyles.ratingNumber}>{rating}</span>
            <span className={sportStyles.ratingReviews}>({reviews} reseñas)</span>
          </div>
        </div>

        <div className={sportStyles.tagsContainer}>
          {displayTags.map((tag, index) => (
            <span key={index} className={sportStyles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <p className={sportStyles.description}>
          {description}
        </p>

        <div className={sportStyles.cardFooter}>
          <div className={sportStyles.priceSection}>
            <span className={sportStyles.price}>${price}/h</span>
            <span className={sportStyles.nextTime}>Próximo: {nextAvailable}</span>
          </div>
          
          <button onClick={handleInternalClick} className={sportStyles.actionButton}>
            Ir a cancha →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;