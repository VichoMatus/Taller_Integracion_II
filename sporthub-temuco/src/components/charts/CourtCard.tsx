import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './stylesCourtCards/BasquetbolCanchasCard.module.css';
import enduroStyles from './stylesCourtCards/EnduroRutasCard.module.css';
import futbolAmericanoStyles from './stylesCourtCards/FutbolAmericanoEstadioCard.module.css';

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
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'enduro' | 'rugby' | 'futbol-americano' | 'mountain-bike' | undefined;
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
  sport = 'basquetbol', // Valor por defecto
  onClick,
}) => {
  const router = useRouter();
  
  // 🔥 Seleccionar estilos según el deporte
  const currentStyles = 
    sport === 'enduro' ? enduroStyles :
    sport === 'futbol-americano' ? futbolAmericanoStyles :
    styles;
  
  // 🔥 Limitar a máximo 4 tags
  const displayTags = tags.slice(0, 4);
  
  // 🔥 Función para manejar navegación específica por deporte
  const handleInternalClick = () => {
    if (onClick) {
      // Si viene onClick como prop, úsalo (para casos especiales)
      onClick();
    } else {
      // Navegación automática según el deporte
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
          
        case 'enduro': // 🔥 Nuevo caso para Enduro
          router.push('/sports/enduro/rutas/rutaseleccionada');
          break;

        case 'futbol-americano':
          const futbolAmericanoParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            reviews: reviews.toString().replace(' reseñas', ''),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/futbol-americano/estadios/estadioseleccionado?${futbolAmericanoParams.toString()}`);
          break;
          
        default:
          console.log('Deporte no configurado:', sport);
          // Fallback a basquetbol
          router.push('/sports/basquetbol/canchas/canchaseleccionada');
      }
    }
  };
  
  return (
    <div className={currentStyles.courtCard}>
      <Image
        src={imageUrl}
        alt={name}
        className={currentStyles.cardImage}
        width={300}
        height={200}
      />
      
      <div className={currentStyles.cardContent}>
        <div className={currentStyles.cardHeader}>
          <div className={currentStyles.cardTitleSection}>
            <h3 className={currentStyles.cardTitle}>{name}</h3>
            <p className={currentStyles.cardAddress}>{address}</p>
          </div>
          
          <div className={currentStyles.ratingBadge}>
            <svg className={currentStyles.starIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.287-3.967z"/>
            </svg>
            <span className={currentStyles.ratingNumber}>{rating}</span>
            <span className={currentStyles.ratingReviews}>({reviews} reseñas)</span>
          </div>
        </div>

        <div className={currentStyles.tagsContainer}>
          {displayTags.map((tag, index) => (
            <span key={index} className={currentStyles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <p className={currentStyles.description}>
          {description}
        </p>

        <div className={currentStyles.cardFooter}>
          <div className={currentStyles.priceSection}>
            <span className={currentStyles.price}>${price}/h</span>
            <span className={currentStyles.nextTime}>Próximo: {nextAvailable}</span>
          </div>
          
          <button onClick={handleInternalClick} className={currentStyles.actionButton}>
            {sport === 'enduro' ? 'Ir a ruta →' : 
             sport === 'futbol-americano' ? 'Ir a estadio →' : 'Ir a cancha →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;