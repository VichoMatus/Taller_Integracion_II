"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar';
import SearchBar from '../../../../../components/SearchBar';
import LocationMap from '../../../../../components/LocationMap';
import skateCommon from '../../skate.module.css';

export default function CanchaSeleccionadaPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const cancha = {
    id: 1,
    name: "Skate Plaza",
    location: "Plaza Central, Temuco",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@skateplaza",
    description: "Skatepark con bowl, rampas y zona street.",
    schedule: "Lunes a Domingo • 08:00 a 21:00",
    capacity: "30 skaters",
    rating: 4.6,
    reviews: 72,
    priceFrom: 0,
    images: [
      "/sports/skate/canchas/Skate1.svg",
      "/sports/skate/canchas/Skate2.svg"
    ],
    amenities: ["Bowl", "Rampas", "Zona street"],
    reviewsList: [
      { name: "Pedro R.", rating: 5, date: "hace 1 día", comment: "Buen park, limpio y seguro." }
    ]
  };

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 800); return () => clearTimeout(timer); }, []);

  const handleBackToCanchas = () => router.push('/sports/skate/canchas');
  const nextImage = () => setCurrentImageIndex((prev) => prev === cancha.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex((prev) => prev === 0 ? cancha.images.length - 1 : prev - 1);
  const formatPrice = (price: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price);
  const handleReserve = () => router.push('/sports/reservacancha');
  const handleCall = () => window.open(`tel:${cancha.phone}`, '_self');
  const handleInstagram = () => window.open(`https://instagram.com/${cancha.instagram.replace('@','')}`, '_blank');
  const handleDirections = () => { const query = encodeURIComponent(cancha.location); window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank'); };

  if (isLoading) return (
    <div className={skateCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />
      <div className={skateCommon.navLoader}>
        <div className={skateCommon.navLoaderInner}>
          <div className={skateCommon.navLoaderIcon}>🛹</div>
          <p className={skateCommon.navLoaderText}>Cargando información...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={skateCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="skate" />
      <div className={skateCommon.mainContent}>
        <div className={skateCommon.header}>
          <div className={skateCommon.headerLeft}>
            <span className={skateCommon.headerIcon}>🛹</span>
            <h1 className={skateCommon.headerTitle}>Skate - {cancha.name}</h1>
          </div>
          <div className={skateCommon.headerRight}>
            <SearchBar placeholder="Buscar skateparks..." sport="skate" onSearch={(term) => router.push(`/sports/skate/canchas?search=${encodeURIComponent(term)}`)} />
            <button className={skateCommon.userButton} onClick={() => router.push('/usuario/perfil')}>👤 Usuario</button>
          </div>
        </div>

        <div className={skateCommon.breadcrumb}><button className={skateCommon.breadcrumbButton} onClick={handleBackToCanchas}>← Volver a skateparks</button></div>

        <div className={skateCommon.courtInfoCard}>
          <div className={skateCommon.courtHeader}>
            <h2 className={skateCommon.sectionTitle}>{cancha.name} - Skatepark</h2>
            <button className={skateCommon.reserveButton} onClick={handleReserve}>📅 Reservar</button>
          </div>
          <div className={skateCommon.courtDetails}>
            <div className={skateCommon.detailItem}><span className={skateCommon.detailIcon}>📍</span><span>{cancha.location}</span></div>
            <div className={skateCommon.detailItem}><span className={skateCommon.detailIcon}>💰</span><span>Desde {formatPrice(cancha.priceFrom)}/h</span></div>
          </div>
        </div>

        <div className={skateCommon.locationImagesContainer}>
          <div className={skateCommon.locationSection}>
            <h3 className={skateCommon.sectionTitle}>Ubicación</h3>
            <div className={skateCommon.mapContainer}>
              <LocationMap sport="skate" latitude={cancha.coordinates.lat} longitude={cancha.coordinates.lng} address={cancha.location} zoom={15} height="250px" />
              <div className={skateCommon.locationInfo}>
                <p className={skateCommon.locationAddress}>{cancha.location}</p>
                <button className={skateCommon.btnGhost} onClick={handleDirections}>🧭 Cómo llegar</button>
              </div>
            </div>
          </div>

          <div className={skateCommon.imagesSection}>
            <h3 className={skateCommon.sectionTitle}>Imágenes</h3>
            <div className={skateCommon.imageCarousel}>
              <button className={skateCommon.carouselButton} onClick={prevImage}>←</button>
              <div className={skateCommon.imageContainer}>
                <Image src={cancha.images[currentImageIndex] || "/sports/skate/canchas/Skate1.svg"} alt={`${cancha.name} - Imagen`} className={skateCommon.courtImage} width={600} height={400} />
              </div>
              <button className={skateCommon.carouselButton} onClick={nextImage}>→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
