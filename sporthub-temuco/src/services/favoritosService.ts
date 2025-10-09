import apiBackend from "../config/backend";
import { handleApiError } from "../services/ApiError";
import {
  Favorito,
  FavoritoCreateRequest,
  FavoritoListQuery,
  EsFavoritoResponse,
  CountResponse,
} from "../types/favoritos";

export const favoritosService = {
  // 🔹 Listar favoritos
  async listar(params?: FavoritoListQuery): Promise<Favorito[]> {
    try {
      const { data } = await apiBackend.get<Favorito[]>("/favoritos", { params });
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // 🔹 Obtener un favorito por ID
  async obtener(id: string | number): Promise<Favorito> {
    try {
      const { data } = await apiBackend.get<Favorito>(`/favoritos/${id}`);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // 🔹 Crear un favorito
  async crear(payload: FavoritoCreateRequest): Promise<Favorito> {
    try {
      const { data } = await apiBackend.post<Favorito>("/favoritos", payload);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // 🔹 Eliminar por ID
  async eliminar(id: string | number): Promise<void> {
    try {
      await apiBackend.delete(`/favoritos/${id}`);
    } catch (e) {
      handleApiError(e);
    }
  },

  // 🔹 Eliminar por combinación usuario + cancha
  async eliminarPorClave(
    id_usuario: string | number,
    id_cancha: string | number
  ): Promise<void> {
    try {
      await apiBackend.delete(`/favoritos`, { params: { id_usuario, id_cancha } });
    } catch (e) {
      handleApiError(e);
    }
  },

  // 🔹 Verificar si un usuario tiene una cancha como favorita
  async esFavorito(
    id_usuario: string | number,
    id_cancha: string | number
  ): Promise<EsFavoritoResponse> {
    try {
      const { data } = await apiBackend.get<EsFavoritoResponse>(
        `/favoritos/es-favorito`,
        { params: { id_usuario, id_cancha } }
      );
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // 🔹 Contar favoritos por usuario
  async contarPorUsuario(id_usuario: string | number): Promise<CountResponse> {
    try {
      const { data } = await apiBackend.get<CountResponse>(
        `/favoritos/count`,
        { params: { id_usuario } }
      );
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },
};
