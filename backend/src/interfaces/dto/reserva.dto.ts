// dto/reserva.dto.ts
export interface ReservaDTO {
  id: string;
  userId: string;
  courtId: string;
  start: Date;
  end: Date;
  status: "pending" | "confirmed" | "cancelled";
  price: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
// Define el formato que tu aplicación usará internamente
// El normalizador se encarga de transformar la respuesta upstream a este formato