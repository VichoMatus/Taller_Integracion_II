import api from "../config/backend";
import {
  Favorito,
  FavoritoCreateRequest,
  FavoritoListQuery,
  EsFavoritoResponse,
  CountResponse,
} from "../types/favoritos";

export const favoritosService = {
  list(params?: FavoritoListQuery) {
    return api.get<Favorito[]>("/favoritos", { params }).then(r => r.data);
  },
  get(id: string | number) {
    return api.get<Favorito>(`/favoritos/${id}`).then(r => r.data);
  },
  create(payload: FavoritoCreateRequest) {
    return api.post<Favorito>("/favoritos", payload).then(r => r.data);
  },
  remove(id: string | number) {
    return api.delete<void>(`/favoritos/${id}`).then(r => r.data);
  },
  removeByKey(id_usuario: string | number, id_cancha: string | number) {
    return api.delete<void>("/favoritos", { params: { id_usuario, id_cancha } }).then(r => r.data);
  },
  esFavorito(id_usuario: string | number, id_cancha: string | number) {
    return api
      .get<EsFavoritoResponse>("/favoritos/es-favorito", { params: { id_usuario, id_cancha } })
      .then(r => r.data);
  },
  countByUsuario(id_usuario: string | number) {
    return api
      .get<CountResponse>("/favoritos/count", { params: { id_usuario } })
      .then(r => r.data);
  },
};
