import { Cancha, TipoCancha, EstadoCancha } from "../../domain/cancha/Cancha";
import { Paginated } from "../../app/common/pagination";

/**
 * Parámetros de filtrado para la búsqueda de canchas.
 */
export interface CanchaFilters {
  /** Número de página (opcional) */
  page?: number;
  /** Tamaño de página (opcional) */
  pageSize?: number;
  /** Texto de búsqueda en nombre o descripción (opcional) */
  q?: string;
  /** Filtrar por tipo de cancha (opcional) */
  tipo?: TipoCancha;
  /** Filtrar por estado (opcional) */
  estado?: EstadoCancha;
  /** Filtrar por establecimiento (opcional) */
  establecimientoId?: number;
  /** Filtrar solo canchas techadas (opcional) */
  techada?: boolean;
  /** Precio máximo por hora (opcional) */
  precioMax?: number;
  /** Capacidad mínima (opcional) */
  capacidadMin?: number;
}

/**
 * Datos para crear una nueva cancha.
 */
export interface CreateCanchaInput {
  nombre: string;
  tipo: TipoCancha;
  precioPorHora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  establecimientoId: number;
  imagenUrl?: string;
}

/**
 * Datos para actualizar una cancha existente.
 */
export interface UpdateCanchaInput {
  nombre?: string;
  tipo?: TipoCancha;
  estado?: EstadoCancha;
  precioPorHora?: number;
  descripcion?: string;
  capacidad?: number;
  techada?: boolean;
  activa?: boolean;
  imagenUrl?: string;
}

/**
 * Repositorio para operaciones sobre canchas.
 * Define el contrato para la gestión de canchas deportivas.
 */
export interface CanchaRepository {
  /**
   * Obtiene una lista paginada de canchas con filtros opcionales.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado de canchas
   */
  listCanchas(filters: CanchaFilters): Promise<Paginated<Cancha>>;

  /**
   * Obtiene una cancha específica por su ID.
   * @param id - ID de la cancha
   * @returns Promise con los datos de la cancha
   * @throws Error si la cancha no existe
   */
  getCancha(id: number): Promise<Cancha>;

  /**
   * Crea una nueva cancha en el sistema.
   * @param input - Datos de la cancha a crear
   * @returns Promise con la cancha creada
   * @throws Error si faltan datos requeridos o hay conflictos
   */
  createCancha(input: CreateCanchaInput): Promise<Cancha>;

  /**
   * Actualiza parcialmente los datos de una cancha.
   * @param id - ID de la cancha a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con la cancha actualizada
   * @throws Error si la cancha no existe
   */
  updateCancha(id: number, input: UpdateCanchaInput): Promise<Cancha>;

  /**
   * Elimina una cancha del sistema.
   * @param id - ID de la cancha a eliminar
   * @throws Error si la cancha no existe o tiene reservas activas
   */
  deleteCancha(id: number): Promise<void>;

  /**
   * Cambia el estado de una cancha.
   * @param id - ID de la cancha
   * @param estado - Nuevo estado a asignar
   * @returns Promise con la cancha actualizada
   * @throws Error si la cancha no existe o el estado es inválido
   */
  cambiarEstado(id: number, estado: EstadoCancha): Promise<Cancha>;

  /**
   * Obtiene canchas disponibles en un rango de tiempo.
   * @param fechaInicio - Fecha y hora de inicio
   * @param fechaFin - Fecha y hora de fin
   * @param tipo - Tipo de cancha (opcional)
   * @returns Promise con lista de canchas disponibles
   */
  getCanchasDisponibles(fechaInicio: Date, fechaFin: Date, tipo?: TipoCancha): Promise<Cancha[]>;
}
