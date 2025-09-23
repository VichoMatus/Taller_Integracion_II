export interface Bloqueo {
  id_bloqueo: number;
  id_cancha: number;
  inicio: string; // TIMESTAMPTZ format
  fin: string; // TIMESTAMPTZ format
  motivo?: string;
  created_at: string;
  updated_at: string;
}

export interface BloqueosList {
  items: Bloqueo[];
  total: number;
  page: number;
  page_size: number;
}

export interface BloqueoQueryParams {
  q?: string;
  id_cancha?: number;
  inicio?: string;
  fin?: string;
  page?: number;
  page_size?: number;
}