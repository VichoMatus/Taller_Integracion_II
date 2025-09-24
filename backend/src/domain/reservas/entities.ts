export interface Reserva {
  id_reserva: number;
  id_cancha: number;
  id_usuario: number;
  inicio: string;
  fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'expirada';
  precio_total?: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface ReservasList {
  items: Reserva[];
  total: number;
  page: number;
  page_size: number;
}

export interface ReservaQueryParams {
  id_usuario?: number;
  id_cancha?: number;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'expirada';
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  page_size?: number;
}

export interface ReservaDetalle extends Reserva {
  cancha_nombre?: string;
  complejo_nombre?: string;
  usuario_nombre?: string;
  usuario_email?: string;
}