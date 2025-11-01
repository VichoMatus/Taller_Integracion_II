import { Reserva } from "../../domain/reserva/Reserva";

/**
 * Tipo que representa la estructura de reserva en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastReserva = {
  id: number;
  usuario_id: number;
  cancha_id: number;
  complejo_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: Reserva["estado"];
  precio_total: number;
  metodo_pago?: Reserva["metodoPago"];
  pagado: boolean;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  codigo_confirmacion?: string;
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
  };
  cancha?: {
    id: number;
    nombre: string;
    tipo: string;
    precio_por_hora: number;
  };
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
    telefono?: string;
  };
};

/**
 * Convierte reserva de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Reserva en formato FastAPI
 * @returns Reserva en formato del dominio
 */
export const toReserva = (r: FastReserva): Reserva => {
  // 🔍 DEBUG: Ver qué recibe el mapper
  console.log('🔍 [toReserva] Input:', {
    id: r.id,
    usuario_id: r.usuario_id,
    cancha_id: r.cancha_id,
    hasUsuario: !!r.usuario,
    hasCancha: !!r.cancha,
    allKeys: Object.keys(r)
  });
  
  const mapped = {
    id: r.id,
    usuarioId: r.usuario_id,
    canchaId: r.cancha_id,
    complejoId: r.complejo_id,
    fechaInicio: new Date(r.fecha_inicio),
    fechaFin: new Date(r.fecha_fin),
    estado: r.estado,
    precioTotal: r.precio_total,
    metodoPago: r.metodo_pago,
    pagado: r.pagado,
    notas: r.notas,
    fechaCreacion: new Date(r.fecha_creacion),
    fechaActualizacion: new Date(r.fecha_actualizacion),
    codigoConfirmacion: r.codigo_confirmacion,
    usuario: r.usuario,
    cancha: r.cancha ? {
      ...r.cancha,
      precioPorHora: r.cancha.precio_por_hora,
    } : undefined,
    complejo: r.complejo,
  };
  
  console.log('🔍 [toReserva] Output:', {
    id: mapped.id,
    usuarioId: mapped.usuarioId,
    canchaId: mapped.canchaId,
    hasUsuario: !!mapped.usuario,
    hasCancha: !!mapped.cancha
  });
  
  return mapped;
};
