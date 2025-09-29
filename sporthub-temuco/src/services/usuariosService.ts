import api from "@/config/backend";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
} from "../types/usuarios";

export const usuariosService = {
  list(params?: UsuarioListQuery) {
    return api.get<Usuario[]>("/usuarios", { params }).then(r => r.data);
  },
  get(id: string | number) {
    return api.get<Usuario>(`/usuarios/${id}`).then(r => r.data);
  },
  create(payload: UsuarioCreateRequest) {
    return api.post<Usuario>("/usuarios", payload).then(r => r.data);
  },
  update(id: string | number, payload: UsuarioUpdateRequest) {
    return api.put<Usuario>(`/usuarios/${id}`, payload).then(r => r.data);
  },
  remove(id: string | number) {
    return api.delete<void>(`/usuarios/${id}`).then(r => r.data);
  },
  activar(id: string | number) {
    return api.patch<Usuario>(`/usuarios/${id}/activar`).then(r => r.data);
  },
  desactivar(id: string | number) {
    return api.patch<Usuario>(`/usuarios/${id}/desactivar`).then(r => r.data);
  },
  verificar(id: string | number) {
    return api.patch<Usuario>(`/usuarios/${id}/verificar`).then(r => r.data);
  },
};
