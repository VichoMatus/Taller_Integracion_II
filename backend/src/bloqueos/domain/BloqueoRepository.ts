import { Bloqueo, TipoBloqueo, EstadoBloqueo } from "../../domain/bloqueo/Bloqueo";
import { Paginated } from "../../app/common/pagination";

/**
 * Parámetros de filtrado para la búsqueda de bloqueos.
 */
export interface BloqueoFilters {
  /** Número de página (opcional) */
  page?: number;
  /** Tamaño de página (opcional) */
  pageSize?: number;
  /** Filtrar por cancha (opcional) */
  canchaId?: number;
  /** Filtrar por complejo (opcional) */
  complejoId?: number;
  /** Filtrar por tipo de bloqueo (opcional) */
  tipo?: TipoBloqueo;
  /** Filtrar por estado (opcional) */
  estado?: EstadoBloqueo;
  /** Filtrar por fecha desde (opcional) */
  fechaDesde?: Date;
  /** Filtrar por fecha hasta (opcional) */
  fechaHasta?: Date;
  /** Filtrar por creador (opcional) */
  creadoPorId?: number;
  /** Solo bloqueos activos (opcional) */
  soloActivos?: boolean;
  /** Texto de búsqueda en título o descripción (opcional) */
  q?: string;
}

/**
 * Datos para crear un nuevo bloqueo.
 */
export interface CreateBloqueoInput {
  canchaId: number;
  tipo: TipoBloqueo;
  fechaInicio: Date;
  fechaFin: Date;
  titulo: string;
  descripcion?: string;
  recurrente?: boolean;
  patronRecurrencia?: string;
  creadoPorId: number;
}

/**
 * Datos para actualizar un bloqueo existente.
 */
export interface UpdateBloqueoInput {
  tipo?: TipoBloqueo;
  estado?: EstadoBloqueo;
  fechaInicio?: Date;
  fechaFin?: Date;
  titulo?: string;
  descripcion?: string;
  recurrente?: boolean;
  patronRecurrencia?: string;
}

/**
 * Parámetros para verificar conflictos con bloqueos.
 */
export interface ConflictoBloqueoInput {
  canchaId: number;
  fechaInicio: Date;
  fechaFin: Date;
  bloqueoId?: number; // Para excluir un bloqueo específico al editar
}

/**
 * Repositorio para operaciones sobre bloqueos de canchas.
 * Define el contrato para la gestión de bloqueos de disponibilidad.
 */
export interface BloqueoRepository {
  /**
   * Obtiene una lista paginada de bloqueos con filtros opcionales.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado de bloqueos
   */
  listBloqueos(filters: BloqueoFilters): Promise<Paginated<Bloqueo>>;

  /**
   * Obtiene un bloqueo específico por su ID.
   * @param id - ID del bloqueo
   * @returns Promise con los datos del bloqueo
   * @throws Error si el bloqueo no existe
   */
  getBloqueo(id: number): Promise<Bloqueo>;

  /**
   * Crea un nuevo bloqueo en el sistema.
   * @param input - Datos del bloqueo a crear
   * @returns Promise con el bloqueo creado
   * @throws Error si faltan datos requeridos o hay conflictos de horario
   */
  createBloqueo(input: CreateBloqueoInput): Promise<Bloqueo>;

  /**
   * Actualiza parcialmente los datos de un bloqueo.
   * @param id - ID del bloqueo a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con el bloqueo actualizado
   * @throws Error si el bloqueo no existe
   */
  updateBloqueo(id: number, input: UpdateBloqueoInput): Promise<Bloqueo>;

  /**
   * Elimina un bloqueo del sistema.
   * @param id - ID del bloqueo a eliminar
   * @throws Error si el bloqueo no existe o está activo
   */
  deleteBloqueo(id: number): Promise<void>;

  /**
   * Verifica si hay conflictos con otros bloqueos en el mismo período.
   * @param input - Parámetros de verificación
   * @returns Promise con true si hay conflictos, false en caso contrario
   */
  verificarConflicto(input: ConflictoBloqueoInput): Promise<boolean>;

  /**
   * Obtiene bloqueos activos para una cancha en un período específico.
   * @param canchaId - ID de la cancha
   * @param fechaInicio - Fecha de inicio del período
   * @param fechaFin - Fecha de fin del período
   * @returns Promise con lista de bloqueos activos
   */
  getBloqueosActivos(canchaId: number, fechaInicio: Date, fechaFin: Date): Promise<Bloqueo[]>;

  /**
   * Obtiene bloqueos por creador.
   * @param creadoPorId - ID del usuario creador
   * @returns Promise con lista de bloqueos del usuario
   */
  getBloqueosByCreador(creadoPorId: number): Promise<Bloqueo[]>;

  /**
   * Activa un bloqueo específico.
   * @param id - ID del bloqueo
   * @returns Promise con el bloqueo activado
   */
  activarBloqueo(id: number): Promise<Bloqueo>;

  /**
   * Desactiva un bloqueo específico.
   * @param id - ID del bloqueo
   * @returns Promise con el bloqueo desactivado
   */
  desactivarBloqueo(id: number): Promise<Bloqueo>;
}
