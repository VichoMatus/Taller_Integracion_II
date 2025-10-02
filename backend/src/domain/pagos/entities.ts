export interface Pago {
  id_pago: number;
  id_reserva: number;
  proveedor: string;
  id_externo?: string;
  moneda: string;
  monto: number;
  estado: 'creado' | 'autorizado' | 'pagado' | 'fallido' | 'reembolsado';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PagosList {
  items: Pago[];
  total: number;
  page: number;
  page_size: number;
}

export interface PagoQueryParams {
  id_reserva?: number;
  proveedor?: string;
  estado?: 'creado' | 'autorizado' | 'pagado' | 'fallido' | 'reembolsado';
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  page_size?: number;
}

export interface PagoDetalle extends Pago {
  reserva_inicio?: string;
  reserva_fin?: string;
  cancha_nombre?: string;
  usuario_nombre?: string;
}