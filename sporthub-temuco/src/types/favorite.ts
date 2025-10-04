export interface Favorite {
  id: string;
  courtId: string;
  name: string;
  sport: string;
  imageUrl?: string;
  address?: string;
  rating?: number;
  lastAvailable?: string;
  pricePerHour?: number;
  notes?: string;
  createdAt: string;
}

export type FavoritesResponse = Favorite[];
