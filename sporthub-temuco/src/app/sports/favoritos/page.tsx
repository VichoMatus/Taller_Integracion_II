'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import FavoriteCard from '@/components/FavoriteCard';
import { getFavorites, deleteFavorite } from '@/services/favorites';
import { Favorite } from '@/types/favorite';
import styles from './favoritos.module.css';
import { useRouter } from 'next/navigation';

export default function FavoritosPage() {
  const [items, setItems] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const favs = await getFavorites();
      if (!mounted) return;
      setItems(favs);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const handleRemove = async (id: string) => {
    const prev = items;
    setItems(items.filter((i) => i.id !== id));
    const res = await deleteFavorite(id);
    if (!res.ok) {
      setItems(prev);
      alert('No se pudo eliminar. Intenta nuevamente.');
    }
  };

  const handleView = (courtId: string) => {
    router.push(`/sports/basquetbol/canchas/canchaseleccionada`);
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar userRole="usuario" sport="basquetbol" />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Tus Favoritos</h1>
          <div className={styles.controls}>
            <button className={styles.exploreBtn} onClick={() => router.push('/sports')}>Explorar canchas</button>
          </div>
        </div>

        {loading ? (
          <div style={{padding: 40}}>Cargando favoritos...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <h3>No tienes favoritos todavía</h3>
            <p>Explora canchas y toca el corazón para guardar tus favoritos.</p>
            <button className={styles.exploreBtn} onClick={() => router.push('/sports')}>Ver deportes</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <FavoriteCard key={item.id} item={item} onRemove={handleRemove} onView={handleView} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
