import { Complejo, EstadoComplejo, ServicioComplejo } from "../../domain/complejo/Complejo";
import { Paginated } from "../../app/common/pagination";

/**
 * Parámetros de filtrado para la búsqueda de complejos.
 */
export interface ComplejoFilters {
  /** Número de página (opcional) */
  page?: number;
  /** Tamaño de página (opcional) */
  pageSize?: number;
  /** Texto de búsqueda en nombre, descripción o dirección (opcional) */
  q?: string;
  /** Filtrar por estado (opcional) */
  estado?: EstadoComplejo;
  /** Filtrar por comuna (opcional) */
  comuna?: string;
  /** Filtrar por región (opcional) */
  region?: string;
  /** Filtrar por servicios disponibles (opcional) */
  servicios?: ServicioComplejo[];
  /** Filtrar por dueño (opcional) */
  duenioId?: number;
  /** Calificación mínima (opcional) */
  calificacionMin?: number;
}

/**
 * Datos para crear un nuevo complejo.
 */
export interface CreateComplejoInput {
  nombre: string;
  descripcion?: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono?: string;
  email?: string;
  horaApertura: string;
  horaCierre: string;
  servicios: ServicioComplejo[];
  duenioId: number;
  imagenUrl?: string;
}

/**
 * Datos para actualizar un complejo existente.
 */
export interface UpdateComplejoInput {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
  estado?: EstadoComplejo;
  horaApertura?: string;
  horaCierre?: string;
  servicios?: ServicioComplejo[];
  activo?: boolean;
  imagenUrl?: string;
}

/**
 * Repositorio para operaciones sobre complejos deportivos.
 * Define el contrato para la gestión de establecimientos deportivos.
 */
export interface ComplejoRepository {
  /**
   * Obtiene una lista paginada de complejos con filtros opcionales.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado de complejos
   */
  listComplejos(filters: ComplejoFilters): Promise<Paginated<Complejo>>;

  /**
   * Obtiene un complejo específico por su ID.
   * @param id - ID del complejo
   * @returns Promise con los datos del complejo
   * @throws Error si el complejo no existe
   */
  getComplejo(id: number): Promise<Complejo>;

  /**
   * Crea un nuevo complejo en el sistema.
   * @param input - Datos del complejo a crear
   * @returns Promise con el complejo creado
   * @throws Error si faltan datos requeridos o hay conflictos
   */
  createComplejo(input: CreateComplejoInput): Promise<Complejo>;

  /**
   * Actualiza parcialmente los datos de un complejo.
   * @param id - ID del complejo a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con el complejo actualizado
   * @throws Error si el complejo no existe
   */
  updateComplejo(id: number, input: UpdateComplejoInput): Promise<Complejo>;

  /**
   * Elimina un complejo del sistema.
   * @param id - ID del complejo a eliminar
   * @throws Error si el complejo no existe o tiene canchas activas
   */
  deleteComplejo(id: number): Promise<void>;

  /**
   * Cambia el estado de un complejo.
   * @param id - ID del complejo
   * @param estado - Nuevo estado a asignar
   * @returns Promise con el complejo actualizado
   * @throws Error si el complejo no existe o el estado es inválido
   */
  cambiarEstado(id: number, estado: EstadoComplejo): Promise<Complejo>;

  /**
   * Obtiene complejos por dueño.
   * @param duenioId - ID del dueño
   * @returns Promise con lista de complejos del dueño
   */
  getComplejosByDuenio(duenioId: number): Promise<Complejo[]>;
}
