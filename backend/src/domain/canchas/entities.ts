export interface Cancha {
  id_cancha: number;
  id_complejo: number;
  nombre: string;
  deporte: string;
  cubierta: boolean;
  activo: boolean;
  precio_desde?: number;
  rating_promedio?: number;
  total_resenas: number;
}

export interface CanchasList {
  items: Cancha[];
  total: number;
  page: number;
  page_size: number;
}

export interface CanchaQueryParams {
  q?: string;
  id_complejo?: number;
  deporte?: string;
  page?: number;
  page_size?: number;
}