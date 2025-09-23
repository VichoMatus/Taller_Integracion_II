export interface Complejo {
  id_complejo: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  activo: boolean;
  rating_promedio?: number;
  total_resenas: number;
}

export interface ComplejosList {
  items: Complejo[];
  total: number;
  page: number;
  page_size: number;
}

export interface ComplejoQueryParams {
  q?: string;
  comuna?: string;
  deporte?: string;
  page?: number;
  page_size?: number;
}