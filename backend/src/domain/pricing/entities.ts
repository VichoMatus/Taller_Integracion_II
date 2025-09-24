export interface ReglaPrecio {
  id_regla: number;
  id_cancha: number;
  dia?: string; // dia_semana enum
  hora_inicio: string; // TIME format
  hora_fin: string; // TIME format
  precio_por_hora: number;
  vigente_desde?: string; // DATE format
  vigente_hasta?: string; // DATE format
  created_at: string;
  updated_at: string;
}

export interface Promocion {
  id_promocion: number;
  id_complejo?: number;
  id_cancha?: number;
  titulo: string;
  descripcion?: string;
  tipo: string; // tipo_descuento enum: 'porcentaje' | 'monto_fijo'
  valor: number;
  estado: string; // estado_promocion enum: 'activa' | 'inactiva'
  vigente_desde?: string; // DATE format
  vigente_hasta?: string; // DATE format
  created_at: string;
  updated_at: string;
}

export interface PricingRule extends ReglaPrecio {}

export interface PricingRulesList {
  items: ReglaPrecio[];
  total: number;
  page: number;
  page_size: number;
}

export interface PromocionList {
  items: Promocion[];
  total: number;
  page: number;
  page_size: number;
}

export interface PricingQueryParams {
  q?: string;
  id_cancha?: number;
  id_complejo?: number;
  dia?: string;
  page?: number;
  page_size?: number;
}

export interface PromocionQueryParams {
  q?: string;
  id_complejo?: number;
  id_cancha?: number;
  estado?: string;
  tipo?: string;
  page?: number;
  page_size?: number;
}