import { UploadRepository, UploadFilters, CreateUploadInput, UpdateUploadInput, ProcessingConfig } from "../domain/UploadRepository";
import { Upload, TipoArchivo, CategoriaUpload, EstadoUpload } from "../../domain/upload/Upload";
import { Paginated } from "../../app/common/pagination";
import * as crypto from "crypto";
import * as path from "path";

/**
 * Caso de uso para listar uploads con paginación y filtros.
 */
export class ListUploads {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Obtiene una lista paginada de uploads.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado
   */
  execute(filters: UploadFilters): Promise<Paginated<Upload>> {
    return this.repo.listUploads(filters);
  }
}

/**
 * Caso de uso para obtener un upload específico.
 */
export class GetUpload {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Obtiene un upload por su ID.
   * @param id - ID del upload
   * @returns Promise con los datos del upload
   */
  execute(id: number): Promise<Upload> {
    return this.repo.getUpload(id);
  }
}

/**
 * Caso de uso para procesar un nuevo upload.
 */
export class ProcessUpload {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Procesa un archivo subido.
   * @param file - Información del archivo
   * @param usuarioId - ID del usuario que sube el archivo
   * @param categoria - Categoría del upload
   * @param entidadId - ID de entidad asociada (opcional)
   * @param tipoEntidad - Tipo de entidad asociada (opcional)
   * @returns Promise con el upload creado
   */
  async execute(
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer?: Buffer;
      path?: string;
    },
    usuarioId: number,
    categoria: CategoriaUpload,
    entidadId?: number,
    tipoEntidad?: string
  ): Promise<Upload> {
    // Validaciones de seguridad
    this.validateFile(file, categoria);
    
    // Generar hash del archivo
    const hashArchivo = this.generateFileHash(file);
    
    // Verificar si ya existe un archivo con el mismo hash
    const existingUpload = await this.repo.findByHash(hashArchivo);
    if (existingUpload && this.shouldReuseDuplicate(categoria)) {
      return existingUpload;
    }
    
    // Generar nombre único para el archivo
    const nombreArchivo = this.generateUniqueFilename(file.originalname);
    
    // Determinar tipo de archivo
    const tipo = this.determineFileType(file.mimetype);
    
    // Generar URL temporal
    const url = this.generateFileUrl(nombreArchivo, categoria);
    
    // Crear registro en base de datos
    const uploadData: CreateUploadInput = {
      nombreOriginal: file.originalname,
      nombreArchivo,
      mimeType: file.mimetype,
      tamano: file.size,
      tipo,
      categoria,
      url,
      usuarioId,
      entidadId,
      tipoEntidad,
      hashArchivo,
      metadatos: this.extractMetadata(file),
    };
    
    return this.repo.createUpload(uploadData);
  }

  private validateFile(file: any, categoria: CategoriaUpload): void {
    // Validar tamaño máximo
    const maxSizes: Record<CategoriaUpload, number> = {
      avatar: 5 * 1024 * 1024, // 5MB
      cancha: 10 * 1024 * 1024, // 10MB
      complejo: 10 * 1024 * 1024, // 10MB
      reserva: 5 * 1024 * 1024, // 5MB
      verificacion: 15 * 1024 * 1024, // 15MB
      general: 20 * 1024 * 1024, // 20MB
    };

    if (file.size > maxSizes[categoria]) {
      throw new Error(`Archivo demasiado grande. Máximo permitido: ${maxSizes[categoria] / (1024 * 1024)}MB`);
    }

    // Validar tipos MIME permitidos
    const allowedTypes: Record<CategoriaUpload, string[]> = {
      avatar: ["image/jpeg", "image/png", "image/webp"],
      cancha: ["image/jpeg", "image/png", "image/webp"],
      complejo: ["image/jpeg", "image/png", "image/webp"],
      reserva: ["image/jpeg", "image/png", "application/pdf"],
      verificacion: ["image/jpeg", "image/png", "application/pdf"],
      general: ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"],
    };

    if (!allowedTypes[categoria].includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido para la categoría ${categoria}`);
    }

    // Validar nombre de archivo
    if (file.originalname.length > 255) {
      throw new Error("Nombre de archivo demasiado largo");
    }

    // Validar caracteres peligrosos en nombre
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.originalname)) {
      throw new Error("Nombre de archivo contiene caracteres no permitidos");
    }
  }

  private generateFileHash(file: any): string {
    if (file.buffer) {
      return crypto.createHash('sha256').update(file.buffer).digest('hex');
    }
    // Si no hay buffer, generar hash basado en metadatos
    return crypto.createHash('sha256')
      .update(`${file.originalname}-${file.size}-${file.mimetype}-${Date.now()}`)
      .digest('hex');
  }

  private shouldReuseDuplicate(categoria: CategoriaUpload): boolean {
    // Para ciertas categorías, permitir reutilizar archivos duplicados
    return ["general"].includes(categoria);
  }

  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}${ext}`;
  }

  private determineFileType(mimeType: string): TipoArchivo {
    if (mimeType.startsWith('image/')) return 'imagen';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'documento';
  }

  private generateFileUrl(nombreArchivo: string, categoria: CategoriaUpload): string {
    // URL temporal que será reemplazada después del procesamiento
    return `/uploads/${categoria}/${nombreArchivo}`;
  }

  private extractMetadata(file: any): any {
    const metadata: any = {
      uploadDate: new Date().toISOString(),
    };

    // Para imágenes, intentar extraer dimensiones (requeriría librería como sharp)
    if (file.mimetype.startsWith('image/')) {
      // metadata.width = ...
      // metadata.height = ...
    }

    return metadata;
  }
}

/**
 * Caso de uso para actualizar datos de un upload.
 */
export class UpdateUpload {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Actualiza parcialmente un upload.
   * @param id - ID del upload
   * @param input - Datos a actualizar
   * @returns Promise con el upload actualizado
   */
  execute(id: number, input: UpdateUploadInput): Promise<Upload> {
    return this.repo.updateUpload(id, input);
  }
}

/**
 * Caso de uso para eliminar un upload.
 */
export class DeleteUpload {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Elimina un upload del sistema.
   * @param id - ID del upload a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> {
    return this.repo.deleteUpload(id);
  }
}

/**
 * Caso de uso para obtener uploads de un usuario.
 */
export class GetUploadsByUsuario {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Obtiene uploads de un usuario específico.
   * @param usuarioId - ID del usuario
   * @param categoria - Categoría específica (opcional)
   * @returns Promise con lista de uploads
   */
  execute(usuarioId: number, categoria?: CategoriaUpload): Promise<Upload[]> {
    return this.repo.getUploadsByUsuario(usuarioId, categoria);
  }
}

/**
 * Caso de uso para obtener uploads de una entidad.
 */
export class GetUploadsByEntidad {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Obtiene uploads asociados a una entidad.
   * @param entidadId - ID de la entidad
   * @param tipoEntidad - Tipo de entidad
   * @returns Promise con lista de uploads
   */
  execute(entidadId: number, tipoEntidad: string): Promise<Upload[]> {
    return this.repo.getUploadsByEntidad(entidadId, tipoEntidad);
  }
}

/**
 * Caso de uso para marcar upload como procesado.
 */
export class MarkAsProcessed {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Marca un upload como completado después del procesamiento.
   * @param id - ID del upload
   * @param url - URL final del archivo
   * @param thumbnailUrl - URL del thumbnail (opcional)
   * @param metadatos - Metadatos adicionales
   * @returns Promise con el upload actualizado
   */
  execute(id: number, url: string, thumbnailUrl?: string, metadatos?: any): Promise<Upload> {
    return this.repo.markAsProcessed(id, url, thumbnailUrl, metadatos);
  }
}

/**
 * Caso de uso para obtener estadísticas de uploads.
 */
export class GetUploadStats {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Obtiene estadísticas de uso de uploads.
   * @param usuarioId - ID del usuario (opcional)
   * @returns Promise con estadísticas
   */
  execute(usuarioId?: number): Promise<{
    totalArchivos: number;
    tamanototal: number;
    porTipo: Record<TipoArchivo, number>;
    porCategoria: Record<CategoriaUpload, number>;
  }> {
    return this.repo.getStats(usuarioId);
  }
}

/**
 * Caso de uso para limpiar uploads expirados.
 */
export class CleanupExpiredUploads {
  constructor(private repo: UploadRepository) {}
  
  /**
   * Limpia uploads que han expirado.
   * @returns Promise con número de archivos limpiados
   */
  async execute(): Promise<number> {
    const expiredUploads = await this.repo.getExpiredUploads();
    
    for (const upload of expiredUploads) {
      await this.repo.deleteUpload(upload.id);
    }
    
    return expiredUploads.length;
  }
}
