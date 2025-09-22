
//Zod valida respuesta upstream
import { z } from "zod";

export const ReservaRawSchema = z.object({
  id_reserva:   z.string().or(z.number()),
  id_usuario:   z.string().or(z.number()),
  id_cancha:    z.string().or(z.number()),
  inicio:       z.string(), // ISO fecha/hora
  fin:          z.string(),
  estado:       z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA"]),
  precio_total: z.number(),
  notas:        z.string().nullable(),
  fecha_creacion: z.string(),
  fecha_actualizacion: z.string(),
});

export const ReservaListRawSchema = z.object({
  items: z.array(ReservaRawSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export type ReservaRaw = z.infer<typeof ReservaRawSchema>;
export type ReservaListRaw = z.infer<typeof ReservaListRawSchema>;
