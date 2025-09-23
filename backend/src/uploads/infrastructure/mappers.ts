import { Upload } from "../../domain/upload/Upload";

/**
 * Tipo que representa la estructura de upload en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastUpload = {
  id: number;
  nombre_original: string;
  nombre_archivo: string;
  mime_type: string;
  tamano: number;
  tipo: Upload["tipo"];
  categoria: Upload["categoria"];
  estado: Upload["estado"];
  url: string;
  thumbnail_url?: string;
  usuario_id: number;
  entidad_id?: number;
  tipo_entidad?: string;
  alt_text?: string;
  hash_archivo?: string;
  metadatos?: any;
  fecha_subida: string;
  fecha_actualizacion: string;
  fecha_expiracion?: string;
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
  };
};

/**
 * Convierte upload de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Upload en formato FastAPI
 * @returns Upload en formato del dominio
 */
export const toUpload = (r: FastUpload): Upload => ({
  id: r.id,
  nombreOriginal: r.nombre_original,
  nombreArchivo: r.nombre_archivo,
  mimeType: r.mime_type,
  tamano: r.tamano,
  tipo: r.tipo,
  categoria: r.categoria,
  estado: r.estado,
  url: r.url,
  thumbnailUrl: r.thumbnail_url,
  usuarioId: r.usuario_id,
  entidadId: r.entidad_id,
  tipoEntidad: r.tipo_entidad,
  altText: r.alt_text,
  hashArchivo: r.hash_archivo,
  metadatos: r.metadatos,
  fechaSubida: new Date(r.fecha_subida),
  fechaActualizacion: new Date(r.fecha_actualizacion),
  fechaExpiracion: r.fecha_expiracion ? new Date(r.fecha_expiracion) : undefined,
  usuario: r.usuario,
});
