import { apiBackend } from '../config/backend';
import { handleApiError } from "../services/ApiError";
import {
  Bloqueo,
  BloqueoCreate,
  BloqueoUpdate,
  BloqueoListQuery,
} from "../types/bloqueos";


export const bloqueosService = {
  list(params?: BloqueoListQuery) {
    return apiBackend.get<Bloqueo[]>("/bloqueos", { params }).then(r => r.data);
  },
  get(id: string | number) {
    return apiBackend.get<Bloqueo>(`/bloqueos/${id}`).then(r => r.data);
  },
  create(payload: BloqueoCreate) {
    return apiBackend.post<Bloqueo>("/bloqueos", payload).then(r => r.data);
  },
  update(id: string | number, payload: BloqueoUpdate) {
    return apiBackend.put<Bloqueo>(`/bloqueos/${id}`, payload).then(r => r.data);
  },
  remove(id: string | number) {
    return apiBackend.delete<void>(`/bloqueos/${id}`).then(r => r.data);
  },
};
