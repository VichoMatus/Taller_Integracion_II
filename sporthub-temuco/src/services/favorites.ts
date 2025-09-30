import { Favorite } from '@/types/favorite';

// Mock data - replace with real API calls later
const mockFavorites: Favorite[] = [
  {
    id: 'f1',
    courtId: 'c1',
    name: 'Cancha Central',
    sport: 'basquetbol',
    imageUrl: '/sports/basquetbol/canchas/Cancha1.png',
    address: 'Av. Principal 123',
    rating: 4.3,
    lastAvailable: 'Hoy, 19:00',
    pricePerHour: 21,
    notes: '',
    createdAt: '2025-06-01T12:00:00Z'
  },
  {
    id: 'f2',
    courtId: 'c2',
    name: 'Cancha Norte',
    sport: 'futbol',
    imageUrl: '/sports/futbol/futbol.png',
    address: 'Calle Norte 45',
    rating: 4.1,
    lastAvailable: 'Mañana, 10:00',
    pricePerHour: 18,
    notes: '',
    createdAt: '2025-06-12T10:00:00Z'
  },
  {
    id: 'f3',
    courtId: 'c3',
    name: 'Cancha Sur',
    sport: 'padel',
    imageUrl: '/sports/padel/padel.png',
    address: 'Sector Sur 78',
    rating: 4.6,
    lastAvailable: 'Hoy, 08:00',
    pricePerHour: 15,
    notes: '',
    createdAt: '2025-07-02T09:00:00Z'
  }
];

export const getFavorites = async (): Promise<Favorite[]> => {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 200));
  return mockFavorites;
};

export const deleteFavorite = async (id: string): Promise<{ ok: boolean }> => {
  await new Promise((r) => setTimeout(r, 150));
  // In a real API call we'd remove it server-side. For mock just return ok.
  return { ok: true };
};
