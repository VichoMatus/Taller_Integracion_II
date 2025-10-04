"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/layout/Sidebar';
import SearchBar from '../../../../../components/SearchBar';
import LocationMap from '../../../../../components/LocationMap';
import atletismoCommon from '../../atletismo.module.css';

export default function CanchaSeleccionadaPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const cancha = {
    id: 1,
    name: "Pista Central",
    location: "Av. Alemania 1234, Temuco, Chile",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    phone: "(45) 555-1234",
    instagram: "@pistacentral",
    description: "Pista de atletismo con 8 carriles y áreas de salto/lanzamiento.",
    schedule: "Lunes a Domingo • 08:00 a 21:00",
    capacity: "20 atletas",
    rating: 4.5,
    reviews: 64,
    priceFrom: 15000,
    images: [
      "/sports/atletismo/canchas/Cancha1.png",
      "/sports/atletismo/canchas/Cancha2.png"
    ],
    amenities: ["Cronometraje", "Zona de salto", "Zona de lanzamiento"],
    reviewsList: [
      { name: "María P.", rating: 5, date: "hace 2 días", comment: "Pista en excelente estado." }
    ]
  };

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 800); return () => clearTimeout(timer); }, []);

  const handleBackToCanchas = () => router.push('/sports/atletismo/canchas');
  const nextImage = () => setCurrentImageIndex((prev) => prev === cancha.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex((prev) => prev === 0 ? cancha.images.length - 1 : prev - 1);
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (<span key={i} className={`${atletismoCommon.star} ${i < Math.floor(rating) ? atletismoCommon.starFilled : ''}`}>⭐</span>));
  const formatPrice = (price: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price);
  const handleReserve = () => router.push('/sports/reservacancha');
  const handleCall = () => window.open(`tel:${cancha.phone}`, '_self');
  const handleInstagram = () => window.open(`https://instagram.com/${cancha.instagram.replace('@','')}`, '_blank');
  const handleDirections = () => { const query = encodeURIComponent(cancha.location); window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank'); };
  const handleHelp = () => alert('¿Necesitas ayuda?');

  if (isLoading) return (
    <div className={atletismoCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />
      <div className={atletismoCommon.navLoader}>
        <div className={atletismoCommon.navLoaderInner}>
          <div className={atletismoCommon.navLoaderIcon}>🏃‍♂️</div>
          <p className={atletismoCommon.navLoaderText}>Cargando información...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={atletismoCommon.pageContainer}>
      <Sidebar userRole="usuario" sport="atletismo" />
      <div className={atletismoCommon.mainContent}>
        <div className={atletismoCommon.header}>
          <div className={atletismoCommon.headerLeft}>
            <span className={atletismoCommon.headerIcon}>🏃‍♂️</span>
            <h1 className={atletismoCommon.headerTitle}>Atletismo - {cancha.name}</h1>
          </div>
          <div className={atletismoCommon.headerRight}>
            <SearchBar placeholder="Buscar pistas..." sport="atletismo" onSearch={(term) => router.push(`/sports/atletismo/canchas?search=${encodeURIComponent(term)}`)} />
            <button className={atletismoCommon.userButton} onClick={() => router.push('/usuario/perfil')}>👤 Usuario</button>
          </div>
        </div>

        <div className={atletismoCommon.breadcrumb}><button className={atletismoCommon.breadcrumbButton} onClick={handleBackToCanchas}>← Volver a pistas</button></div>

        <div className={atletismoCommon.courtInfoCard}>
          <div className={atletismoCommon.courtHeader}>
            <h2 className={atletismoCommon.sectionTitle}>{cancha.name} - Pista Atletismo</h2>
            <button className={atletismoCommon.reserveButton} onClick={handleReserve}>📅 Reservar</button>
          </div>
          <div className={atletismoCommon.courtDetails}>
            <div className={atletismoCommon.detailItem}><span className={atletismoCommon.detailIcon}>📍</span><span>{cancha.location}</span></div>
            <div className={atletismoCommon.detailItem}><span className={atletismoCommon.detailIcon}>💰</span><span>Desde {formatPrice(cancha.priceFrom)}/h</span></div>
          </div>
        </div>

        <div className={atletismoCommon.locationImagesContainer}>
          <div className={atletismoCommon.locationSection}>
            <h3 className={atletismoCommon.sectionTitle}>Ubicación</h3>
            <div className={atletismoCommon.mapContainer}>
              <LocationMap sport="atletismo" latitude={cancha.coordinates.lat} longitude={cancha.coordinates.lng} address={cancha.location} zoom={15} height="250px" />
              <div className={atletismoCommon.locationInfo}>
                <p className={atletismoCommon.locationAddress}>{cancha.location}</p>
                <button className={atletismoCommon.btnGhost} onClick={handleDirections}>🧭 Cómo llegar</button>
              </div>
            </div>
          </div>

          <div className={atletismoCommon.imagesSection}>
            <h3 className={atletismoCommon.sectionTitle}>Imágenes</h3>
            <div className={atletismoCommon.imageCarousel}>
              <button className={atletismoCommon.carouselButton} onClick={prevImage}>←</button>
              <div className={atletismoCommon.imageContainer}>
                <Image src={cancha.images[currentImageIndex] || "/sports/atletismo/canchas/Cancha1.png"} alt={`${cancha.name} - Imagen`} className={atletismoCommon.courtImage} width={600} height={400} />
              </div>
              <button className={atletismoCommon.carouselButton} onClick={nextImage}>→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
