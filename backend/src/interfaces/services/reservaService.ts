//compone y usa múltiples clientes y normalizadores
import { fetchReservas } from "../clients/reservaClients";
import { toReservaDTO } from "../normalizers/reservaNormalizer";
import { fetchUsuariosByIds } from "../clients/usuarioClients"; // ejemplo
import { toUsuarioDTO } from "../normalizers/usuarioNormalizer";

export async function listReservationCards(params: { userId?: string; page?: number; pageSize?: number }) {
  const rawList = await fetchReservas(params);
  const reservas = rawList.items.map(toReservaDTO);

  // composición: enriquecer con el nombre del usuario
  const userIds = Array.from(new Set(reservas.map(r => r.userId)));
  const usersRaw = userIds.length ? await fetchUsuariosByIds(userIds) : [];
  const users = usersRaw.map(toUsuarioDTO);
  const userMap = new Map(users.map(u => [u.id, u]));

  const items = reservas.map(r => ({
    id: r.id,
    userName: userMap.get(r.userId)?.name ?? "Usuario",
    timeRange: `${r.start.toLocaleString()} — ${r.end.toLocaleString()}`,
    priceLabel: new Intl.NumberFormat("es-CL", { style: "currency", currency: r.currency }).format(r.price),
    status: r.status,
  }));

  return {
    items,
    page: rawList.page,
    pageSize: rawList.page_size,
    total: rawList.total,
  };
}
