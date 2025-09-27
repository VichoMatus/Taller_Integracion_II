import React from 'react';
import Image from 'next/image';
import styles from './favoriteCard.module.css';
import { Favorite } from '@/types/favorite';

interface Props {
  item: Favorite;
  onRemove: (id: string) => void;
  onView: (courtId: string) => void;
}

const FavoriteCard: React.FC<Props> = ({ item, onRemove, onView }) => {
  return (
    <div className={styles.card} role="article">
      <div className={styles.imageWrap} onClick={() => onView(item.courtId)}>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} width={320} height={180} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
        <div className={styles.tag}>{item.sport}</div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{item.name}</h3>
        <p className={styles.address}>{item.address}</p>
        <div className={styles.meta}>
          <div className={styles.rating}>⭐ {item.rating ?? '--'}</div>
          <div className={styles.price}>${item.pricePerHour ?? '--'}/h</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.viewBtn} onClick={() => onView(item.courtId)} aria-label={`Ver ${item.name}`}>
            Ver
          </button>
          <button className={styles.removeBtn} onClick={() => onRemove(item.id)} aria-label={`Quitar favorito ${item.name}`}>
            Quitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;
