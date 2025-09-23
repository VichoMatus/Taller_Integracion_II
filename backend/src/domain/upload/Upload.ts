/**
 * Tipos de archivos permitidos en el sistema.
 */
export type TipoArchivo = "imagen" | "documento" | "video" | "audio";

/**
 * Categorías de uploads según su uso.
 */
export type CategoriaUpload = "avatar" | "cancha" | "complejo" | "reserva" | "verificacion" | "general";

/**
 * Estados de procesamiento de un upload.
 */
export type EstadoUpload = "subiendo" | "procesando" | "completado" | "error" | "eliminado";

/**
 * Entidad principal de upload del sistema.
 * Representa un archivo subido con sus metadatos y referencias.
 */
export interface Upload {
  /** Identificador único del upload */
  id: number;
  /** Nombre original del archivo */
  nombreOriginal: string;
  /** Nombre único generado para el archivo */
  nombreArchivo: string;
  /** Tipo MIME del archivo */
  mimeType: string;
  /** Tamaño del archivo en bytes */
  tamano: number;
  /** Tipo de archivo basado en extensión/contenido */
  tipo: TipoArchivo;
  /** Categoría del upload según su uso */
  categoria: CategoriaUpload;
  /** Estado actual del procesamiento */
  estado: EstadoUpload;
  /** URL pública para acceder al archivo */
  url: string;
  /** URL de thumbnail (para imágenes) */
  thumbnailUrl?: string;
  /** ID del usuario que subió el archivo */
  usuarioId: number;
  /** ID de la entidad asociada (opcional) */
  entidadId?: number;
  /** Tipo de entidad asociada (opcional) */
  tipoEntidad?: string;
  /** Texto alternativo para imágenes (accesibilidad) */
  altText?: string;
  /** Hash del archivo para detectar duplicados */
  hashArchivo?: string;
  /** Metadatos adicionales del archivo */
  metadatos?: {
    width?: number;
    height?: number;
    duracion?: number; // Para videos/audio
    [key: string]: any;
  };
  /** Fecha de subida */
  fechaSubida: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
  /** Fecha de expiración (opcional) */
  fechaExpiracion?: Date;
  /** Información del usuario (desnormalizada para consultas) */
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
  };
}
