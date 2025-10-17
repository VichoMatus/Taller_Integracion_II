import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './stylesCourtCards/BasquetbolCanchasCard.module.css';
import enduroStyles from './stylesCourtCards/EnduroRutasCard.module.css';
import futbolAmericanoStyles from './stylesCourtCards/FutbolAmericanoEstadioCard.module.css';
import rugbyStyles from './stylesCourtCards/RugbyCanchasCard.module.css';
import mountainBikeStyles from './stylesCourtCards/MountainBikeRutasCard.module.css';
import basquetStyles from './stylesCourtCards/BasquetbolCanchasCard.module.css';
import atletismoStyles from './stylesCourtCards/AtletismoCanchasCard.module.css';
import skateStyles from './stylesCourtCards/SkateCanchasCard.module.css';
import ciclismoStyles from './stylesCourtCards/CiclismoCanchasCard.module.css';
import kartingStyles from './stylesCourtCards/KartingCanchasCard.module.css';
import { mountAtletismoLoader, unmountAtletismoLoader } from '@/components/ui/AtletismoNavLoader';
import { mountSkateLoader, unmountSkateLoader } from '@/components/ui/SkateNavLoader';

// 🔥 IMPORTAR TODOS LOS ESTILOS DE LOS DEPORTES
import basquetbolStyles from './stylesCourtCards/BasquetbolCanchasCard.module.css';
import futbolStyles from './stylesCourtCards/FutbolCanchasCard.module.css';
import tenisStyles from './stylesCourtCards/TenisCanchasCard.module.css';
import voleibolStyles from './stylesCourtCards/VoleibolCanchasCard.module.css';
import padelStyles from './stylesCourtCards/PadelCanchasCard.module.css';
import crossfitentrenamientofuncionalStyles from './stylesCourtCards/CrossfitEntrenamientoFuncionalCanchasCard.module.css';
import natacionStyles from './stylesCourtCards/NatacionCanchasCard.module.css';
import patinajeStyles from './stylesCourtCards/PatinajeCanchasCard.module.css';
import escaladaStyles from './stylesCourtCards/EscaladaCanchasCard.module.css';

interface CourtCardProps {
  imageUrl: string;
  name: string;
  address: string;
  rating: number;
  tags: string[];
  description: string;
  price: string;
  nextAvailable: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'enduro' | 'rugby' | 'futbol-americano' | 'mountain-bike' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje' | 'escalada' | 'atletismo' | 'skate' | 'ciclismo' | 'karting';
  onClick?: () => void;
}

const CourtCard: React.FC<CourtCardProps> = ({
  imageUrl,
  name,
  address,
  rating,
  tags,
  description,
  price,
  nextAvailable,
  sport = 'basquetbol',
  onClick,
}) => {
  const router = useRouter();
  
  // 🔥 ESTADOS PARA MANEJO DE IMÁGENES
  const [imageError, setImageError] = React.useState(false);
  const [currentImageUrl, setCurrentImageUrl] = React.useState(imageUrl);
  
  // 🔥 FUNCIÓN PARA OBTENER IMAGEN POR DEFECTO DEL DEPORTE
  const getDefaultSportImage = () => {
    switch (sport) {
      case 'basquetbol':
        return '/sports/basquetbol/Basquet.png';
      case 'futbol':
        return '/sports/futbol/futbol.png';
      case 'tenis':
        return '/sports/tenis/tenis.png';
      case 'voleibol':
        return '/sports/voleibol/voleibol.png';
      case 'padel':
        return '/sports/padel/padel.png';
      case 'natacion':
        return '/sports/natacion/natacion.png';
      case 'patinaje':
        return '/sports/patinaje/patinaje.png';
      case 'atletismo':
        return '/sports/atletismo/atletismo.png';
      case 'escalada':
        return '/sports/escalada/escalada.png';
      case 'crossfitentrenamientofuncional':
        return '/sports/crossfitentrenamientofuncional/crossfitentrenamientofuncional.png';
      case 'enduro':
        return '/sports/enduro/enduro.png';
      case 'rugby':
        return '/sports/rugby/rugby.png';
      case 'futbol-americano':
        return '/sports/futbol-americano/futbol-americano.png';
      case 'mountain-bike':
        return '/sports/mountain-bike/mountain-bike.png';
      case 'skate':
        return '/sports/skate/skate.png';
      case 'ciclismo':
        return '/sports/ciclismo/ciclismo.png';
      case 'karting':
        return '/sports/karting/karting.png';
      default:
        return '/sports/basquetbol/Basquet.png';
    }
  };

  // 🔥 FUNCIÓN PARA MANEJAR ERRORES DE IMAGEN
  const handleImageError = () => {
    console.log(`⚠️ Error cargando imagen: ${currentImageUrl}`);
    
    // Si la imagen actual no es la por defecto, cambiar a la por defecto
    const defaultImage = getDefaultSportImage();
    if (currentImageUrl !== defaultImage) {
      console.log(`🔄 Cambiando a imagen por defecto: ${defaultImage}`);
      setCurrentImageUrl(defaultImage);
      setImageError(false); // Resetear el error para intentar con la nueva imagen
    } else {
      // Si ya estamos usando la imagen por defecto y falló, mostrar emoji
      console.log(`❌ Imagen por defecto también falló, mostrando emoji`);
      setImageError(true);
    }
  };

  // 🔥 RESETEAR ESTADO CUANDO CAMBIA EL imageUrl PROP
  React.useEffect(() => {
    setCurrentImageUrl(imageUrl);
    setImageError(false);
  }, [imageUrl]);
  
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
      case 'escalada':
        return escaladaStyles;
      case 'atletismo':
        return atletismoStyles;
      case 'skate':
        return skateStyles;
      case 'ciclismo':
        return ciclismoStyles;
      case 'karting':
        return kartingStyles;
      case 'enduro':
        return enduroStyles;
      case 'futbol-americano':
        return futbolAmericanoStyles;
      case 'rugby':
        return rugbyStyles;
      case 'mountain-bike':
        return mountainBikeStyles;
      default:
        console.warn(`Estilo no encontrado para el deporte: ${sport}. Usando basquetbol como fallback.`);
        return basquetbolStyles; // Fallback a basquetbol
    }
  };

  // 🔥 OBTENER LOS ESTILOS APROPIADOS
  const currentStyles = getSportStyles();
  
  // 🔥 Limitar a máximo 4 tags
  const displayTags = tags.slice(0, 4);
  
  // 🔥 Función para manejar navegación específica por deporte
  const handleInternalClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navegación automática según el deporte
      const showAtletismoLoaderAndNavigate = (path: string) => {
        try {
          mountAtletismoLoader();
        } catch (e) {
          // ignore
        }

        // Short delay so the overlay is visible before navigation
        setTimeout(() => {
          router.push(path);
        }, 180);

        // Ensure overlay removed after a reasonable time
        setTimeout(() => {
          try { unmountAtletismoLoader(); } catch (e) { /* ignore */ }
        }, 1600);
      };

      switch (sport) {
        case 'basquetbol':
          router.push('/sports/basquetbol/canchas/canchaseleccionada');
          break;
        case 'atletismo':
          // show a transient Atletismo-themed loader and then navigate
          showAtletismoLoaderAndNavigate('/sports/atletismo/canchas/canchaseleccionada');
          break;
        case 'skate':
          // show transient Skate-themed loader and then navigate
          try { mountSkateLoader(); } catch (e) { /* ignore */ }
          setTimeout(() => { router.push('/sports/skate/canchas/canchaseleccionada'); }, 180);
          setTimeout(() => { try { unmountSkateLoader(); } catch (e) { /* ignore */ } }, 1600);
          break;
        case 'ciclismo':
          router.push('/sports/ciclismo/canchas/canchaseleccionada');
          break;
        case 'karting':
          router.push('/sports/karting/canchas/canchaseleccionada');
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
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/voleibol/canchas/canchaseleccionada?${voleibolParams.toString()}`);
          break;
          
        case 'padel':
          router.push('/sports/padel/canchas/canchaseleccionada');
          break;
          
        case 'enduro':
          router.push('/sports/enduro/rutas/rutaseleccionada');
          break;

        case 'futbol-americano':
          const futbolAmericanoParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/futbol-americano/estadios/estadioseleccionado?${futbolAmericanoParams.toString()}`);
          break;

        case 'rugby':
          const rugbyParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/rugby/canchas/canchaseleccionada?${rugbyParams.toString()}`);
          break;

        case 'mountain-bike':
          const mountainBikeParams = new URLSearchParams({
            id: Date.now().toString(),
            name: name,
            location: address,
            description: description,
            rating: rating.toString(),
            priceFrom: (parseInt(price) * 1000).toString(),
          });
          router.push(`/sports/mountain-bike/rutas/rutaseleccionada?${mountainBikeParams.toString()}`);
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
        case 'escalada':
          router.push('/sports/escalada/centros/centroseleccionado');
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
      case 'atletismo':
        return '🏃‍♂️';
      case 'enduro':
        return '🏍️';
      case 'rugby':
        return '🏉';
      case 'futbol-americano':
        return '🏈';
      case 'mountain-bike':
        return '🚵‍♂️';
      case 'crossfitentrenamientofuncional':
        return '💪';
      case 'skate':
        return '🛹';
      case 'ciclismo':
        return '🚴‍♂️';
      case 'karting':
        return '🏎️';
      default:
        return '🏀';
    }
  };
  
  return (
    <div className={currentStyles.courtCard} data-sport={sport}>
      {/* 🔥 CONTENEDOR DE IMAGEN CON FALLBACK INTELIGENTE */}
      <div className={`${currentStyles.imageContainer} ${imageError ? currentStyles.fallback : ''}`}>
        {!imageError ? (
          <Image
            src={currentImageUrl}
            alt={name}
            className={currentStyles.cardImage}
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
            height: '100%',
            backgroundColor: '#f0f0f0'
          }}>
            {getSportEmoji()}
          </div>
        )}
      </div>
      
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
          
          <button onClick={handleInternalClick} className={currentStyles.actionButton}> Ir a →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;