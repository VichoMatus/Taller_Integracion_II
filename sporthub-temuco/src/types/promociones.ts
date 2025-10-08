// src/types/promociones.ts
export type PromoTipo = "PORCENTAJE" | "MONTO_FIJO";

export interface Promocion {
  id_promocion: string | number;
  titulo: string;
  descripcion: string | null;
  tipo: PromoTipo;
  valor: number;           // % o monto según tipo
  id_cancha?: string | number | null;   // si aplica a una cancha
  id_complejo?: string | number | null; // o a un complejo
  inicio: string; // ISO datetime
  fin: string;    // ISO datetime
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PromocionCreate {
  titulo: string;
  descripcion?: string | null;
  tipo: PromoTipo;
  valor: number;
  id_cancha?: string | number | null;
  id_complejo?: string | number | null;
  inicio: string;
  fin: string;
  activo?: boolean;
}

export interface PromocionUpdate {
  titulo?: string;
  descripcion?: string | null;
  tipo?: PromoTipo;
  valor?: number;
  id_cancha?: string | number | null;
  id_complejo?: string | number | null;
  inicio?: string;
  fin?: string;
  activo?: boolean;
}

export interface PromocionListQuery {
  activo?: boolean;
  id_cancha?: string | number;
  id_complejo?: string | number;
  now?: string; // ISO para filtrar vigentes
  page?: number;
  size?: number;
}
