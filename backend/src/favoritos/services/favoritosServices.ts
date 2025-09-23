// src/favorito/service/favoritoService.ts
import axios from "axios";
import {
  Favorito,
  FavoritoCreateRequest,
  FavoritoListQuery,
  EsFavoritoResponse,
  CountResponse,
} from "../types/favoritoTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class FavoritoService {
  async crear(payload: FavoritoCreateRequest): Promise<Favorito> {
    const { data } = await axios.post(`${API_BASE}/favoritos`, payload);
    return data;
  }

  async listar(query?: FavoritoListQuery): Promise<Favorito[]> {
    const { data } = await axios.get(`${API_BASE}/favoritos`, { params: query });
    return data;
  }

  async obtener(id: number | string): Promise<Favorito> {
    const { data } = await axios.get(`${API_BASE}/favoritos/${id}`);
    return data;
  }

  async eliminar(id: number | string): Promise<void> {
    await axios.delete(`${API_BASE}/favoritos/${id}`);
  }

  // Eliminar por clave compuesta (si tu backend lo soporta)
  async eliminarPorClave(id_usuario: number | string, id_cancha: number | string): Promise<void> {
    await axios.delete(`${API_BASE}/favoritos`, { params: { id_usuario, id_cancha } });
  }

  async esFavorito(id_usuario: number | string, id_cancha: number | string): Promise<EsFavoritoResponse> {
    const { data } = await axios.get(`${API_BASE}/favoritos/es-favorito`, { params: { id_usuario, id_cancha } });
    return data;
  }

  async contarPorUsuario(id_usuario: number | string): Promise<CountResponse> {
    const { data } = await axios.get(`${API_BASE}/favoritos/count`, { params: { id_usuario } });
    return data;
  }
}
