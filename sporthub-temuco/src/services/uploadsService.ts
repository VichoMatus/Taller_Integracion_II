import api from "@/config/backend";
import { UploadFileInfo, UploadListQuery } from "../types/uploads";

/**
 * Sube archivos con multipart/form-data
 * - file: File/Blob
 * - extra: campos adicionales opcionales (id_usuario, id_cancha, etc.)
 */
export const uploadsService = {
  list(params?: UploadListQuery) {
    return api.get<UploadFileInfo[]>("/uploads", { params }).then(r => r.data);
  },
  get(id: string | number) {
    return api.get<UploadFileInfo>(`/uploads/${id}`).then(r => r.data);
  },
  upload(file: File | Blob, extra?: Record<string, any>) {
    const form = new FormData();
    form.append("file", file as any);
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, String(v));
      });
    }
    return api
      .post<UploadFileInfo>("/uploads", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then(r => r.data);
  },
  remove(id: string | number) {
    return api.delete<void>(`/uploads/${id}`).then(r => r.data);
  },
};
