// src/promociones/type/promocionesTypes.ts

export type PromoTipo = "PORCENTAJE" | "FIJO";         // % o monto fijo
export type PromoEstado = "ACTIVA" | "INACTIVA" | "PROGRAMADA";

export interface Promocion {
  id_promocion: number | string;
  nombre: string;
  descripcion?: string | null;

  tipo: PromoTipo;                // "PORCENTAJE" | "FIJO"
  valor: number;                  // 10 => 10% si tipo=% ; 3000 => $3.000 si tipo=fijo
  tope_descuento?: number | null; // opcional, tope máximo aplicable

  // Alcance
  id_cancha?: number | string | null;
  id_complejo?: number | string | null;

  // Vigencia
  fecha_inicio: string;   // ISO datetime
  fecha_fin: string;      // ISO datetime
  dias_semana?: number[] | null; // 0..6 (0=Domingo)

  // Reglas opcionales
  min_horas?: number | null;
  min_monto?: number | null;

  estado: PromoEstado;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PromocionCreate {
  nombre: string;
  descripcion?: string | null;

  tipo: PromoTipo;
  valor: number;
  tope_descuento?: number | null;

  id_cancha?: number | string | null;
  id_complejo?: number | string | null;

  fecha_inicio: string;
  fecha_fin: string;
  dias_semana?: number[] | null;

  min_horas?: number | null;
  min_monto?: number | null;

  estado?: PromoEstado; // por defecto "PROGRAMADA" o "ACTIVA" según backend
}

export interface PromocionUpdate {
  nombre?: string;
  descripcion?: string | null;

  tipo?: PromoTipo;
  valor?: number;
  tope_descuento?: number | null;

  id_cancha?: number | string | null;
  id_complejo?: number | string | null;

  fecha_inicio?: string;
  fecha_fin?: string;
  dias_semana?: number[] | null;

  min_horas?: number | null;
  min_monto?: number | null;

  estado?: PromoEstado;
}

export interface PromocionListQuery {
  q?: string;                          // búsqueda por nombre/desc
  estado?: PromoEstado;
  id_cancha?: number | string;
  id_complejo?: number | string;
  vigentes?: boolean;                  // true => dentro de [fecha_inicio, fecha_fin]
  page?: number;
  size?: number;
}

/** Respuesta al evaluar una promoción sobre un precio base */
export interface PromoEvalRequest {
  id_promocion: number | string;
  precio_base: number;     // precio antes de descuento
  horas?: number;          // horas reservadas (para min_horas)
  fecha?: string;          // ISO (para chequear vigencia/día)
}

export interface PromoEvalResponse {
  id_promocion: number | string;
  aplicado: boolean;
  motivo_no_aplica?: string;
  descuento: number;       // monto descontado (>= 0)
  precio_final: number;    // precio_base - descuento (no negativo)
}
