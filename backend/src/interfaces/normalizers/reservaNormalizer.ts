// normalizers/reservaNormalizer.ts
import { ReservaRaw } from "../schemas/reserva.schema";
import { ReservaDTO } from "../dto/reserva.dto";

const estadoMap = {
  PENDIENTE: "pending",
  CONFIRMADA: "confirmed",
  CANCELADA: "cancelled",
} as const;

export function toReservaDTO(raw: ReservaRaw): ReservaDTO {
  return {
    id: String(raw.id_reserva),
    userId: String(raw.id_usuario),
    courtId: String(raw.id_cancha),
    start: new Date(raw.inicio),
    end: new Date(raw.fin),
    status: estadoMap[raw.estado],
    price: Number(raw.precio_total),
    notes: raw.notas ?? undefined, // null → undefined para no obligar al frontend a chequear null
    createdAt: new Date(raw.fecha_creacion),
    updatedAt: new Date(raw.fecha_actualizacion),
  };
}
// Si la API upstream cambia, solo debes actualizar este archivo
// El resto de tu app (servicios, controladores, rutas) no se ven afectados