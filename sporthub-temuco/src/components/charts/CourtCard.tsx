import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 🔥 IMPORTAR TODOS LOS ESTILOS DE LOS DEPORTES
import basquetbolStyles from './stylesCourtCards/BasquetbolCanchasCard.module.css';
import futbolStyles from './stylesCourtCards/FutbolCanchasCard.module.css';
import tenisStyles from './stylesCourtCards/TenisCanchasCard.module.css';
import voleibolStyles from './stylesCourtCards/VoleibolCanchasCard.module.css';
import padelStyles from './stylesCourtCards/PadelCanchasCard.module.css';
import crossfitentrenamientofuncionalStyles from './stylesCourtCards/CrossfitEntrenamientoFuncionalCanchasCard.module.css';
import natacionStyles from './stylesCourtCards/NatacionCanchasCard.module.css';
import patinajeStyles from './stylesCourtCards/PatinajeCanchasCard.module.css';

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
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje';
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
  
  // 🔥 FUNCIÓN PARA SELECCIONAR ESTILOS SEGÚN EL DEPORTE
  const getSportStyles = () => {
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        return futbolStyles;
      case 'tenis':
        return tenisStyles;
      case 'voleibol':
        return voleibolStyles;
      case 'padel':
        return padelStyles;
      case 'crossfitentrenamientofuncional':
        return crossfitentrenamientofuncionalStyles;
      case 'natacion':
        return natacionStyles;
      case 'patinaje':
        return patinajeStyles;
      default:
        console.warn(`Estilo no encontrado para el deporte: ${sport}. Usando basquetbol como fallback.`);
        return basquetbolStyles; // Fallback a basquetbol
    }
  };

  // 🔥 OBTENER LOS ESTILOS APROPIADOS
  const styles = getSportStyles();
  
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
          router.push('/sports/futbol/canchas/canchaseleccionada');
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
          router.push('/sports/padel/canchas/canchaseleccionada');
          break;
        case 'crossfitentrenamientofuncional':
          router.push('/sports/crossfitentrenamientofuncional/gimnasios/gimnasioseleccionado');
          break;
        case 'natacion':
          router.push('/sports/natacion/piletas/piletaseleccionada');
          break;
        case 'patinaje':
          router.push('/sports/patinaje/pistas/pistaseleccionada');
          break;
        default:
          console.log('Deporte no configurado:', sport);
          router.push('/sports/basquetbol/canchas/canchaseleccionada');
      }
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER EMOJI DEL DEPORTE
  const getSportEmoji = () => {
    switch (sport) {
      case 'basquetbol':
        return '🏀';
      case 'futbol':
        return '⚽';
      case 'tenis':
        return '🎾';
      case 'voleibol':
        return '🏐';
      case 'padel':
        return '🏓';
      case 'natacion':
        return '🏊‍♂️';
      case 'patinaje':
        return '⛸️';
      default:
        return '🏀';
    }
  };

  // 🔥 FUNCIÓN PARA MANEJAR ERRORES DE IMAGEN
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className={styles.courtCard} data-sport={sport}>
      {/* 🔥 CONTENEDOR DE IMAGEN CON FALLBACK */}
      <div className={`${styles.imageContainer} ${imageError ? styles.fallback : ''}`}>
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            className={styles.cardImage}
            width={300}
            height={200}
            onError={handleImageError}
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '48px',
            height: '100%'
          }}>
            {getSportEmoji()}
          </div>
        )}
      </div>
      
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
          
          <button onClick={handleInternalClick} className={styles.actionButton}>
            Ir a cancha →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;