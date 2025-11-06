// 🔥 UTILIDAD PARA MANEJAR DATOS DE RESERVA ENTRE DEPORTES

export interface ReservationData {
  // 🔥 DATOS BÁSICOS DE LA CANCHA
  canchaId: number;
  canchaNombre: string;
  sport: string;
  canchaType?: string;
  
  // 🔥 DATOS DEL COMPLEJO
  establecimientoId?: number;
  complejoNombre: string;
  direccion: string;
  
  // 🔥 DATOS DE PRECIO Y DISPONIBILIDAD
  precioPorHora: number;
  horarios: string;
  activa: boolean;
  techada?: boolean;
  
  // 🔥 DATOS ADICIONALES
  capacidad: string;
  rating: number;
  amenities?: string[];
  images?: string[];
  
  // 🔥 COORDENADAS PARA MAPA
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // 🔥 CONTACTO
  phone?: string;
  instagram?: string;
}

// 🔥 FUNCIÓN PARA PREPARAR DATOS DE RESERVA DESDE FÚTBOL
export const prepareFutbolReservationData = (cancha: any, complejoData?: any): ReservationData => {
  return {
    // 🔥 DATOS DE LA CANCHA
    canchaId: cancha.id,
    canchaNombre: cancha.name || cancha.nombre,
    canchaType: cancha.tipo || 'futbol',
    sport: 'futbol',
    
    // 🔥 DATOS DEL COMPLEJO
    establecimientoId: cancha.establecimientoId,
    complejoNombre: complejoData?.nombre || cancha.complejoNombre || `Complejo ${cancha.establecimientoId}`,
    direccion: complejoData?.direccion || cancha.location || "Dirección no disponible",
    
    // 🔥 DATOS DE PRECIO Y DISPONIBILIDAD
    precioPorHora: cancha.priceFrom || cancha.precioPorHora || 25000,
    horarios: complejoData?.horarioAtencion || cancha.schedule || "Lunes a Domingo • 08:00 a 23:00",
    activa: cancha.activa !== undefined ? cancha.activa : true,
    techada: cancha.techada || false,
    
    // 🔥 DATOS ADICIONALES
    capacidad: cancha.capacity || getCapacityByType(cancha.tipo || 'futbol'),
    rating: cancha.rating || 4.5,
    amenities: cancha.amenities || getDefaultAmenities('futbol'),
    images: cancha.images || getDefaultImages('futbol'),
    
    // 🔥 COORDENADAS PARA MAPA
    coordinates: cancha.coordinates || { lat: -38.7359, lng: -72.5904 },
    
    // 🔥 CONTACTO
    phone: cancha.phone || "(45) 555-1234",
    instagram: cancha.instagram || "@sporthubtemuco"
  };
};

// 🔥 FUNCIONES AUXILIARES
const getCapacityByType = (tipo: string): string => {
  switch (tipo?.toLowerCase()) {
    case 'futbol':
    case 'football': 
      return "22 jugadores (11 vs 11)";
    case 'futbolito':
    case 'futsal': 
      return "10 jugadores (5 vs 5)";
    case 'baby futbol': 
      return "14 jugadores (7 vs 7)";
    case 'tenis':
      return "4 jugadores (2 vs 2)";
    case 'basquet':
    case 'basketball':
      return "10 jugadores (5 vs 5)";
    case 'voleibol':
    case 'volleyball':
      return "12 jugadores (6 vs 6)";
    default: 
      return "Consultar capacidad";
  }
};

const getDefaultAmenities = (sport: string): string[] => {
  switch (sport.toLowerCase()) {
    case 'futbol':
      return ["Césped Sintético", "Arcos Profesionales", "Iluminación LED", "Vestuarios"];
    case 'tenis':
      return ["Cancha Reglamentaria", "Red Profesional", "Superficie Dura", "Iluminación"];
    case 'basquet':
      return ["Cancha Techada", "Aros Reglamentarios", "Piso Deportivo", "Marcador"];
    default:
      return ["Instalaciones Deportivas", "Iluminación", "Vestuarios"];
  }
};

const getDefaultImages = (sport: string): string[] => {
  switch (sport.toLowerCase()) {
    case 'futbol':
      return [
        "/sports/futbol/canchas/Cancha1.png",
        "/sports/futbol/canchas/Cancha2.png",
        "/sports/futbol/canchas/Cancha3.png"
      ];
    case 'tenis':
      return [
        "/sports/tenis/canchas/Cancha1.png",
        "/sports/tenis/canchas/Cancha2.png",
        "/sports/tenis/canchas/Cancha3.png"
      ];
    case 'basquet':
      return [
        "/sports/basquet/canchas/Cancha1.png",
        "/sports/basquet/canchas/Cancha2.png",
        "/sports/basquet/canchas/Cancha3.png"
      ];
    default:
      return ["/sports/default/cancha.png"];
  }
};

// 🔥 FUNCIÓN PARA SERIALIZAR DATOS A URL
export const serializeReservationData = (data: ReservationData): URLSearchParams => {
  const params = new URLSearchParams();
  
  // 🔥 DATOS PRINCIPALES
  params.set('canchaId', data.canchaId.toString());
  params.set('sport', data.sport);
  params.set('canchaNombre', data.canchaNombre);
  params.set('complejoNombre', data.complejoNombre);
  params.set('direccion', data.direccion);
  params.set('precioPorHora', data.precioPorHora.toString());
  params.set('capacidad', data.capacidad);
  params.set('horarios', data.horarios);
  params.set('rating', data.rating.toString());
  
  // 🔥 DATOS OPCIONALES
  if (data.establecimientoId) {
    params.set('establecimientoId', data.establecimientoId.toString());
  }
  if (data.canchaType) {
    params.set('tipo', data.canchaType);
  }
  params.set('techada', data.techada ? 'true' : 'false');
  params.set('activa', data.activa ? 'true' : 'false');
  
  // 🔥 COORDENADAS PARA MAPA
  if (data.coordinates) {
    params.set('lat', data.coordinates.lat.toString());
    params.set('lng', data.coordinates.lng.toString());
  }
  
  // 🔥 CONTACTO
  if (data.phone) params.set('phone', data.phone);
  if (data.instagram) params.set('instagram', data.instagram);
  
  // 🔥 AMENIDADES (como string separado por comas)
  if (data.amenities && data.amenities.length > 0) {
    params.set('amenities', data.amenities.join(','));
  }

  return params;
};

// 🔥 FUNCIÓN PARA DESERIALIZAR DATOS DESDE URL
export const deserializeReservationData = (searchParams: URLSearchParams): ReservationData | null => {
  const canchaId = searchParams.get('canchaId');
  if (!canchaId) return null;

  const data: ReservationData = {
    canchaId: parseInt(canchaId),
    sport: searchParams.get('sport') || 'futbol',
    canchaNombre: searchParams.get('canchaNombre') || 'Cancha Deportiva',
    complejoNombre: searchParams.get('complejoNombre') || 'Complejo Deportivo',
    direccion: searchParams.get('direccion') || 'Dirección no disponible',
    precioPorHora: parseInt(searchParams.get('precioPorHora') || '25000'),
    capacidad: searchParams.get('capacidad') || 'Consultar capacidad',
    horarios: searchParams.get('horarios') || 'Lunes a Domingo • 08:00 a 23:00',
    rating: parseFloat(searchParams.get('rating') || '4.5'),
    activa: searchParams.get('activa') === 'true',
    techada: searchParams.get('techada') === 'true',
  };

  // 🔥 DATOS OPCIONALES
  const establecimientoId = searchParams.get('establecimientoId');
  if (establecimientoId) {
    data.establecimientoId = parseInt(establecimientoId);
  }
  
  const tipo = searchParams.get('tipo');
  if (tipo) {
    data.canchaType = tipo;
  }

  // 🔥 COORDENADAS
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  if (lat && lng) {
    data.coordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
  }

  // 🔥 CONTACTO
  const phone = searchParams.get('phone');
  if (phone) data.phone = phone;
  
  const instagram = searchParams.get('instagram');
  if (instagram) data.instagram = instagram;

  // 🔥 AMENIDADES
  const amenities = searchParams.get('amenities');
  if (amenities) {
    data.amenities = amenities.split(',');
  }

  return data;
};