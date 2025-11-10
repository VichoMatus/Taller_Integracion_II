import { Reserva } from "../../domain/reserva/Reserva";

/**
 * Tipo que representa la estructura de reserva en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 * 
 * ⚠️ ACTUALIZADO 8 NOV 2025: FastAPI cambió el formato
 * - Ahora usa 'id_reserva' en lugar de 'id'
 * - Ahora separa fecha/hora en 'fecha_reserva', 'hora_inicio', 'hora_fin'
 * - Ya no devuelve 'fecha_inicio' ni 'fecha_fin' como timestamps
 */
export type FastReserva = {
  // Nuevo formato (8 nov 2025)
  id_reserva?: number;
  id_usuario?: number;        // Nuevo nombre
  id_cancha?: number;         // Nuevo nombre
  fecha_reserva?: string;     // YYYY-MM-DD
  hora_inicio?: string;        // HH:MM
  hora_fin?: string;           // HH:MM
  
  // Formato legacy (aún soportado para compatibilidad)
  id?: number;
  usuario_id?: number;         // Nombre antiguo
  cancha_id?: number;          // Nombre antiguo
  fecha_inicio?: string;
  fecha_fin?: string;
  
  // Campos comunes
  complejo_id?: number;
  estado: Reserva["estado"];
  precio_total: number;
  metodo_pago?: Reserva["metodoPago"];
  pagado?: boolean;
  notas?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
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
 * Soporta dos formatos de FastAPI:
 * 1. Nuevo (8 nov 2025): { id_reserva, fecha_reserva, hora_inicio, hora_fin }
 * 2. Legacy: { id, fecha_inicio, fecha_fin }
 *
 * @param r - Reserva en formato FastAPI
 * @returns Reserva en formato del dominio
 */
export const toReserva = (r: FastReserva): Reserva => {
  // 🔍 DEBUG: Ver qué recibe el mapper
  console.log('🔍 [toReserva] Input RAW:', {
    id: r.id,
    id_reserva: r.id_reserva,
    fecha_inicio: r.fecha_inicio,
    fecha_reserva: r.fecha_reserva,
    hora_inicio: r.hora_inicio,
    hora_fin: r.hora_fin,
    precio_total: r.precio_total,
    precio_total_type: typeof r.precio_total,
    precio_total_value: r.precio_total,
    pagado: r.pagado,
    estado: r.estado,
    allKeys: Object.keys(r)
  });
  
  // ✅ Detectar formato y construir fechas
  let fechaInicio: Date;
  let fechaFin: Date;
  let id: number;
  
  // Formato nuevo de FastAPI (8 nov 2025)
  if (r.id_reserva !== undefined && r.fecha_reserva && r.hora_inicio && r.hora_fin) {
    id = r.id_reserva;
    // Combinar fecha_reserva + hora_inicio/hora_fin
    fechaInicio = new Date(`${r.fecha_reserva}T${r.hora_inicio}:00`);
    fechaFin = new Date(`${r.fecha_reserva}T${r.hora_fin}:00`);
    console.log('✅ [toReserva] Usando FORMATO NUEVO de FastAPI');
  } 
  // Formato legacy (antes de nov 2025)
  else if (r.id !== undefined && r.fecha_inicio && r.fecha_fin) {
    id = r.id;
    fechaInicio = new Date(r.fecha_inicio);
    fechaFin = new Date(r.fecha_fin);
    console.log('✅ [toReserva] Usando formato LEGACY de FastAPI');
  } 
  // Error: formato desconocido
  else {
    console.error('❌ [toReserva] Formato de reserva desconocido:', r);
    throw new Error('Formato de reserva de FastAPI no reconocido');
  }
  
  const mapped: Reserva = {
    id,
    usuarioId: r.id_usuario || r.usuario_id || 0,  // Nuevo formato primero, luego legacy
    canchaId: r.id_cancha || r.cancha_id || 0,    // Nuevo formato primero, luego legacy
    complejoId: r.complejo_id || 0,
    fechaInicio,
    fechaFin,
    estado: r.estado,
    precioTotal: r.precio_total ?? 0,  // Valor por defecto si es undefined
    metodoPago: r.metodo_pago,
    pagado: r.pagado ?? false,  // Usar nullish coalescing para boolean
    notas: r.notas,
    fechaCreacion: r.fecha_creacion ? new Date(r.fecha_creacion) : new Date(),
    fechaActualizacion: r.fecha_actualizacion ? new Date(r.fecha_actualizacion) : new Date(),
    codigoConfirmacion: r.codigo_confirmacion,
    usuario: r.usuario,
    cancha: r.cancha ? {
      ...r.cancha,
      precioPorHora: r.cancha.precio_por_hora,
    } : undefined,
    complejo: r.complejo,
  };
  
  console.log('✅ [toReserva] Output:', {
    id: mapped.id,
    usuarioId: mapped.usuarioId,
    canchaId: mapped.canchaId,
    fechaInicio: mapped.fechaInicio.toISOString(),
    fechaFin: mapped.fechaFin.toISOString(),
    precioTotal: mapped.precioTotal,
    precioTotal_type: typeof mapped.precioTotal,
    estado: mapped.estado,
    pagado: mapped.pagado,
    hasUsuario: !!mapped.usuario,
    hasCancha: !!mapped.cancha,
    usuarioNombre: mapped.usuario?.nombre,
    canchaNombre: mapped.cancha?.nombre
  });
  
  return mapped;
};
