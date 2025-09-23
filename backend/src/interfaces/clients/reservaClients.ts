
//clientes HTTP a la API “upstream” existente
import { http } from "../../infrastructure/httpclients";
import { ReservaListRawSchema, ReservaListRaw } from "../schemas/reserva.schema";

export async function fetchReservas(params: {
  userId?: string;
  page?: number;
  pageSize?: number;
}) {
  const res = await http.get<unknown>("/reservas", {
    params: {
      usuario_id: params.userId,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    },
  });
  return ReservaListRawSchema.parse(res.data) as ReservaListRaw;
}
