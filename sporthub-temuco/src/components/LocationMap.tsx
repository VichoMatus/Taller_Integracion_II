'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import basquetStyles from './stylesLocationMap/BasquetbolLocationMap.module.css';
import atletismoStyles from './stylesLocationMap/AtletismoLocationMap.module.css';
import skateStyles from './stylesLocationMap/SkateLocationMap.module.css';
import ciclismoStyles from './stylesLocationMap/CiclismoLocationMap.module.css';

// 🔥 IMPORTAR TODOS LOS ESTILOS DE LOS DEPORTES
import basquetbolStyles from './stylesLocationMap/BasquetbolLocationMap.module.css';
import futbolStyles from './stylesLocationMap/FutbolLocationMap.module.css';
import padelStyles from './stylesLocationMap/PadelLocationMap.module.css';
import tenisStyles from './stylesLocationMap/TenisLocationMap.module.css';
import crossfitentrenamientofuncionalStyles from './stylesLocationMap/CrossfitEntrenamientoFuncionalLocationMap.module.css';
import voleiStyles from './stylesLocationMap/VoleibolLocationMap.module.css';
import natacionStyles from './stylesLocationMap/NatacionLocationMap.module.css';
import patinajeStyles from './stylesLocationMap/PatinajeLocationMap.module.css';
import escaladaStyles from './stylesLocationMap/EscaladaLocationMap.module.css';
import enduroStyles from './stylesLocationMap/EnduroLocationMap.module.css';
import rugbyStyles from './stylesLocationMap/RugbyLocationMap.module.css';
import futbolAmericanoStyles from './stylesLocationMap/Futbol-AmericanoLocationMap.module.css';
import mountainBikeStyles from './stylesLocationMap/Mountain-BikeLocationMap.module.css';

// 🗺️ TIPOS DE COMPLEJOS DEPORTIVOS
export interface ComplejoDeportivo {
  id: number;
  nombre: string;
  direccion: string;
  coordenadas: { lat: number; lng: number };
  deportes: string[];
  telefono?: string;
  horario?: string;
  calificacion?: number;
  precio?: string;
}

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  zoom?: number;
  height?: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje' | 'escalada' | 'atletismo' | 'skate' | 'ciclismo' | 'karting' | 'enduro' | 'rugby' | 'futbol-americano' | 'mountain-bike';
  // 🗺️ NUEVAS PROPS PARA MAPA INTERACTIVO
  interactive?: boolean; // Si es true, muestra el mapa real de Google desde el inicio
  complejos?: ComplejoDeportivo[]; // Lista de complejos a mostrar en el mapa
  onComplexClick?: (complejo: ComplejoDeportivo) => void; // Callback cuando se hace clic en un complejo
  showControls?: boolean; // Mostrar controles de zoom
  enableInteractiveButton?: boolean; // Si es true (defecto), el botón activa el mapa interactivo
  redirectToMap?: boolean; // Si es true, el botón redirige a /mapa (solo si enableInteractiveButton=false)
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude = -38.7359,
  longitude = -72.5904,
  address,
  zoom = 15,
  height = '250px',
  sport = 'basquetbol',
  interactive = false,
  complejos = [],
  onComplexClick,
  showControls = true,
  enableInteractiveButton = true,  // ✅ Por defecto activa el mapa
  redirectToMap = false  // ❌ Por defecto NO redirige
}) => {
  const router = useRouter();
  
  // 🗺️ REFS PARA EL MAPA
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // 🗺️ ESTADOS
  const [mapCenter, setMapCenter] = useState({ lat: latitude, lng: longitude });
  const [mapZoom, setMapZoom] = useState(zoom);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isInteractive, setIsInteractive] = useState(interactive);

  // 🗺️ EFECTO: Cargar Google Maps Script e inicializar el mapa
  useEffect(() => {
    if (!isInteractive) return; // Solo cargar si el mapa es interactivo

    const initMap = () => {
      if (mapRef.current && !mapInstanceRef.current && typeof window !== 'undefined' && (window as any).google) {
        const { google } = window as any;
        
        console.log('🗺️ [LocationMap] Inicializando mapa de Google Maps');
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        
        setIsMapLoaded(true);
        console.log('✅ [LocationMap] Mapa inicializado correctamente');
      }
    };

    // Si ya hay una instancia de google cargada
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }

    // Insertar el script de Google Maps si no existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      console.log('📦 [LocationMap] Cargando script de Google Maps...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBMIE36wrh9juIn2RXAGVoBwnc-hhFfwd4&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        console.log('✅ [LocationMap] Script de Google Maps cargado');
        initMap();
      };
    } else {
      existingScript.addEventListener('load', initMap);
    }

    // Limpiar marcadores al desmontar
    return () => {
      markersRef.current.forEach((marker: any) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [isInteractive, mapCenter, mapZoom]);

  // 🗺️ EFECTO: Actualizar centro y zoom del mapa
  useEffect(() => {
    if (!isInteractive || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.setCenter(mapCenter);
    map.setZoom(mapZoom);
  }, [isInteractive, mapCenter, mapZoom]);

  // 🗺️ EFECTO: Dibujar marcadores cuando cambian los complejos
  useEffect(() => {
    if (!isInteractive || !mapInstanceRef.current || !isMapLoaded) return;

    const map = mapInstanceRef.current;
    if (!(window as any).google) return;

    const { google } = window as any;

    console.log(`🗺️ [LocationMap] Dibujando ${complejos.length} marcadores`);

    // Quitar marcadores existentes
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    // Si no hay complejos pero sí hay coordenadas, mostrar un solo marcador
    if (complejos.length === 0 && latitude && longitude) {
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: address || 'Ubicación',
      });

      if (address) {
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 10px;"><strong>${address}</strong></div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }

      markersRef.current.push(marker);
      return;
    }

    // Crear marcadores para cada complejo
    complejos.forEach((complejo) => {
      const marker = new google.maps.Marker({
        position: complejo.coordenadas,
        map: map,
        title: complejo.nombre,
        animation: google.maps.Animation.DROP,
      });

      // Crear InfoWindow con información del complejo
      const infoContent = `
        <div style="padding: 12px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${complejo.nombre}</h3>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${complejo.direccion}</p>
          ${complejo.telefono ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">📞 ${complejo.telefono}</p>` : ''}
          ${complejo.horario ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">⏰ ${complejo.horario}</p>` : ''}
          ${complejo.calificacion ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">⭐ ${complejo.calificacion}/5</p>` : ''}
          <div style="margin-top: 8px;">
            ${complejo.deportes.map(d => `<span style="display: inline-block; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px;">${d}</span>`).join('')}
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        // Cerrar otros InfoWindows
        markersRef.current.forEach((m: any) => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });

        infoWindow.open(map, marker);
        
        // Callback si existe
        if (onComplexClick) {
          onComplexClick(complejo);
        }

        // Centrar mapa en el marcador
        map.panTo(complejo.coordenadas);
        map.setZoom(16);
      });

      // Guardar referencia al InfoWindow en el marker
      (marker as any).infoWindow = infoWindow;

      markersRef.current.push(marker);
    });

    console.log(`✅ [LocationMap] ${markersRef.current.length} marcadores dibujados`);
  }, [isInteractive, complejos, isMapLoaded, latitude, longitude, address, onComplexClick]);

  // 🗺️ FUNCIONES DE CONTROL
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const handleResetCenter = () => {
    setMapCenter({ lat: latitude, lng: longitude });
    setMapZoom(zoom);
  };
  // 🔥 FUNCIÓN PARA SELECCIONAR ESTILOS SEGÚN EL DEPORTE
  const getSportStyles = () => {
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        return futbolStyles;
      case 'padel':
        return padelStyles;
      case 'tenis':
        return tenisStyles;
      case 'voleibol':
        return voleiStyles;
      case 'crossfitentrenamientofuncional':
        return crossfitentrenamientofuncionalStyles;
      case 'natacion':
        return natacionStyles;
      case 'patinaje':
        return patinajeStyles;
      case 'escalada':
        return escaladaStyles;
      // case 'tenis':
      case 'enduro':
        return enduroStyles;
      case 'rugby':
        return rugbyStyles;
      case 'futbol-americano':
        return futbolAmericanoStyles;
      case 'mountain-bike':
        return mountainBikeStyles;
      default:
        return basquetbolStyles; // Fallback
    }
  };

  // 🔥 OBTENER LOS ESTILOS APROPIADOS
  const styles = getSportStyles();

  // 🔥 FUNCIÓN PARA OBTENER EMOJI DEL DEPORTE
  const getSportMapEmoji = () => {
    switch (sport) {
      case 'basquetbol':
        return '🏀';
      case 'futbol':
        return '⚽';
      case 'padel':
        return '🏓';
      case 'tenis':
        return '🎾';
      case 'voleibol':
        return '🏐';
      case 'crossfitentrenamientofuncional':
        return '🏋️‍♂️';
      case 'natacion':
        return '🏊‍♂️';
      case 'patinaje':
        return '⛸️';
      case 'escalada':
        return '🧗‍♂️';
      case 'enduro':
        return '🏍️';
      case 'rugby':
        return '🏉';
      case 'futbol-americano':
        return '🏈';
      case 'mountain-bike':
        return '🚵‍♂️';
      default:
        return '🏀';
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER NOMBRE DEL DEPORTE
  const getSportName = () => {
    switch (sport) {
      case 'basquetbol':
        return 'Basquetbol';
      case 'futbol':
        return 'Fútbol';
      case 'padel':
        return 'Pádel';
      case 'tenis':
        return 'Tenis';
      case 'voleibol':
        return 'Voleibol';
      case 'crossfitentrenamientofuncional':
        return 'Crossfit Entrenamiento Funcional';
      case 'natacion':
        return 'Natación';
      case 'patinaje':
        return 'Patinaje';
      case 'enduro':
        return 'Enduro';
      case 'rugby':
        return 'Rugby';
      case 'futbol-americano':
        return 'Fútbol Americano';
      case 'mountain-bike':
        return 'Mountain Bike';

      default:
        return 'Basquetbol';
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER MENSAJE ESPECÍFICO DEL DEPORTE
  const getSportMessage = () => {
    switch (sport) {
      case 'basquetbol':
        return 'Encuentra las mejores canchas de basquetbol cerca de ti';
      case 'futbol':
        return 'Descubre canchas de fútbol en tu zona';
      case 'tenis':
        return 'Explora las mejores canchas de tenis en tu área';
      case 'voleibol':
        return 'Descubre las mejores canchas de voleibol en tu zona';
      case 'padel':
        return 'Encuentra las mejores canchas de pádel cerca de ti';
      case 'crossfitentrenamientofuncional':
        return 'Descubre gimnasios de CrossFit y entrenamiento funcional en tu zona';
      case 'natacion':
        return 'Encuentra las mejores piscinas y centros de natación cerca de ti';
      case 'patinaje':
        return 'Encuentra las mejores pistas de patinaje cerca de ti';
      case 'enduro':
        return 'Descubre las mejores rutas de enduro para motocross';
      case 'rugby':
        return 'Encuentra los mejores campos de rugby en tu área';
      case 'futbol-americano':
        return 'Descubre campos de fútbol americano en tu zona';
      case 'mountain-bike':
        return 'Explora los mejores senderos de mountain bike';

      default:
        return 'Encuentra las mejores instalaciones deportivas cerca de ti';
    }
  };

  const handleImplementClick = () => {
    console.log(`🗺️ [LocationMap] Botón mapa interactivo clickeado`);
    console.log(`📍 Coordenadas: ${latitude}, ${longitude}`);
    console.log(`🏃 Deporte: ${sport}`);
    
    if (enableInteractiveButton) {
      // Activar mapa interactivo en el mismo componente
      console.log('✅ [LocationMap] Activando mapa interactivo...');
      setIsInteractive(true);
    } else if (redirectToMap) {
      // Redirigir a la página de mapa
      console.log('🔄 [LocationMap] Redirigiendo a /mapa...');
      router.push('/mapa');
    } else {
      // Comportamiento por defecto: solo log
      console.log('ℹ️ [LocationMap] Mapa interactivo no configurado');
    }
  };

  // 🗺️ SI ES INTERACTIVO, RENDERIZAR MAPA REAL DE GOOGLE
  if (isInteractive) {
    return (
      <div className={styles.mapContainer} data-sport={sport} style={{ position: 'relative', height }}>
        {/* Controles del mapa */}
        {showControls && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={handleResetCenter}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              title="Centrar mapa"
            >
              🎯
            </button>
            <button
              onClick={handleZoomIn}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontSize: '18px'
              }}
              title="Acercar"
            >
              ➕
            </button>
            <button
              onClick={handleZoomOut}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontSize: '18px'
              }}
              title="Alejar"
            >
              ➖
            </button>
          </div>
        )}

        {/* Contenedor del mapa */}
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />

        {/* Indicador de carga */}
        {!isMapLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            zIndex: 5
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <p style={{ color: '#666', fontSize: '16px' }}>Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🗺️ SI NO ES INTERACTIVO, RENDERIZAR PLACEHOLDER (COMPORTAMIENTO ORIGINAL)
  return (
    <div className={styles.mapContainer} data-sport={sport}>
      <div className={styles.mapPlaceholder} style={{ height }}>
        <div className={styles.mapIcon}>
          {getSportMapEmoji()} 🗺️
        </div>
        <h3 className={styles.mapTitle}>
          Mapa de Canchas - {getSportName()}
        </h3>
        <p className={styles.mapMessage}>
          {getSportMessage()}
        </p>
        {address && (
          <p className={styles.addressInfo}>
            📍 {address}
          </p>
        )}
        <div className={styles.coordsInfo}>
          <span>Lat: {latitude.toFixed(4)}</span>
          <span>Lng: {longitude.toFixed(4)}</span>
          <span>Zoom: {zoom}x</span>
        </div>
        <button 
          className={styles.implementButton}
          onClick={handleImplementClick}
        >
          Ver mapa interactivo {getSportMapEmoji()}
        </button>
      </div>
    </div>
  );
};

export default LocationMap;