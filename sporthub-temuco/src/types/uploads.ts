export interface UploadFileInfo {
  id_upload: number | string;
  url: string;
  nombre_original: string;
  mime_type: string;
  size_bytes: number;
  usuario_id?: number | string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UploadListQuery {
  usuario_id?: number | string;
  mime_type?: string;
  page?: number;
  size?: number;
}
