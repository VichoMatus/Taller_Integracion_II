import { Upload, TipoArchivo, CategoriaUpload, EstadoUpload } from "../../domain/upload/Upload";
import { Paginated } from "../../app/common/pagination";

/**
 * Parámetros de filtrado para la búsqueda de uploads.
 */
export interface UploadFilters {
  /** Número de página (opcional) */
  page?: number;
  /** Tamaño de página (opcional) */
  pageSize?: number;
  /** Filtrar por usuario (opcional) */
  usuarioId?: number;
  /** Filtrar por tipo de archivo (opcional) */
  tipo?: TipoArchivo;
  /** Filtrar por categoría (opcional) */
  categoria?: CategoriaUpload;
  /** Filtrar por estado (opcional) */
  estado?: EstadoUpload;
  /** Filtrar por entidad asociada (opcional) */
  entidadId?: number;
  /** Filtrar por tipo de entidad (opcional) */
  tipoEntidad?: string;
  /** Filtrar por fecha desde (opcional) */
  fechaDesde?: Date;
  /** Filtrar por fecha hasta (opcional) */
  fechaHasta?: Date;
  /** Texto de búsqueda en nombre (opcional) */
  q?: string;
}

/**
 * Datos para crear un nuevo upload.
 */
export interface CreateUploadInput {
  nombreOriginal: string;
  nombreArchivo: string;
  mimeType: string;
  tamano: number;
  tipo: TipoArchivo;
  categoria: CategoriaUpload;
  url: string;
  thumbnailUrl?: string;
  usuarioId: number;
  entidadId?: number;
  tipoEntidad?: string;
  altText?: string;
  hashArchivo?: string;
  metadatos?: any;
  fechaExpiracion?: Date;
}

/**
 * Datos para actualizar un upload existente.
 */
export interface UpdateUploadInput {
  nombreOriginal?: string;
  estado?: EstadoUpload;
  altText?: string;
  metadatos?: any;
  entidadId?: number;
  tipoEntidad?: string;
  fechaExpiracion?: Date;
}

/**
 * Configuración para el procesamiento de archivos.
 */
export interface ProcessingConfig {
  /** Generar thumbnail para imágenes */
  generateThumbnail?: boolean;
  /** Tamaños de thumbnail a generar */
  thumbnailSizes?: Array<{ width: number; height: number }>;
  /** Comprimir imágenes */
  compress?: boolean;
  /** Calidad de compresión (0-100) */
  quality?: number;
  /** Formato de salida */
  outputFormat?: string;
}

/**
 * Repositorio para operaciones sobre uploads.
 * Define el contrato para la gestión de archivos subidos.
 */
export interface UploadRepository {
  /**
   * Obtiene una lista paginada de uploads con filtros opcionales.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado de uploads
   */
  listUploads(filters: UploadFilters): Promise<Paginated<Upload>>;

  /**
   * Obtiene un upload específico por su ID.
   * @param id - ID del upload
   * @returns Promise con los datos del upload
   * @throws Error si el upload no existe
   */
  getUpload(id: number): Promise<Upload>;

  /**
   * Registra un nuevo upload en el sistema.
   * @param input - Datos del upload a registrar
   * @returns Promise con el upload creado
   */
  createUpload(input: CreateUploadInput): Promise<Upload>;

  /**
   * Actualiza parcialmente los datos de un upload.
   * @param id - ID del upload a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con el upload actualizado
   * @throws Error si el upload no existe
   */
  updateUpload(id: number, input: UpdateUploadInput): Promise<Upload>;

  /**
   * Elimina un upload del sistema.
   * @param id - ID del upload a eliminar
   * @throws Error si el upload no existe
   */
  deleteUpload(id: number): Promise<void>;

  /**
   * Obtiene uploads de un usuario específico.
   * @param usuarioId - ID del usuario
   * @param categoria - Categoría específica (opcional)
   * @returns Promise con lista de uploads del usuario
   */
  getUploadsByUsuario(usuarioId: number, categoria?: CategoriaUpload): Promise<Upload[]>;

  /**
   * Obtiene uploads asociados a una entidad específica.
   * @param entidadId - ID de la entidad
   * @param tipoEntidad - Tipo de entidad
   * @returns Promise con lista de uploads de la entidad
   */
  getUploadsByEntidad(entidadId: number, tipoEntidad: string): Promise<Upload[]>;

  /**
   * Busca uploads por hash para detectar duplicados.
   * @param hashArchivo - Hash del archivo
   * @returns Promise con upload encontrado o undefined
   */
  findByHash(hashArchivo: string): Promise<Upload | undefined>;

  /**
   * Marca un upload como procesado.
   * @param id - ID del upload
   * @param url - URL final del archivo procesado
   * @param thumbnailUrl - URL del thumbnail (opcional)
   * @param metadatos - Metadatos adicionales
   * @returns Promise con el upload actualizado
   */
  markAsProcessed(id: number, url: string, thumbnailUrl?: string, metadatos?: any): Promise<Upload>;

  /**
   * Marca un upload como error.
   * @param id - ID del upload
   * @param error - Mensaje de error
   * @returns Promise con el upload actualizado
   */
  markAsError(id: number, error: string): Promise<Upload>;

  /**
   * Obtiene uploads que han expirado.
   * @returns Promise con lista de uploads expirados
   */
  getExpiredUploads(): Promise<Upload[]>;

  /**
   * Obtiene estadísticas de uso de uploads.
   * @param usuarioId - ID del usuario (opcional)
   * @returns Promise con estadísticas
   */
  getStats(usuarioId?: number): Promise<{
    totalArchivos: number;
    tamanototal: number;
    porTipo: Record<TipoArchivo, number>;
    porCategoria: Record<CategoriaUpload, number>;
  }>;
}
