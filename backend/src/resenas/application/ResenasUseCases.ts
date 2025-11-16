import { ResenaRepository, ResenaFilters, CreateResenaInput, UpdateResenaInput } from "../domain/ResenaRepository";
import { Resena } from "../../domain/resena/Resena";

/**
 * Caso de uso para listar reseñas con filtros opcionales.
 * Basado en GET /resenas de la API de Taller4.
 */
export class ListResenas {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene una lista de reseñas con filtros opcionales.
   * @param filters - Parámetros de filtrado (id_cancha, id_complejo, order, page, page_size)
   * @returns Promise con array de reseñas
   */
  execute(filters: ResenaFilters): Promise<Resena[]> {
    return this.repo.listResenas(filters);
  }
}

/**
 * Caso de uso para obtener una reseña específica por ID.
 * Llama directamente al endpoint GET /resenas/{id} de FastAPI.
 */
export class GetResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene una reseña por su ID.
   * @param id - ID de la reseña
   * @returns Promise con la reseña encontrada
   */
  async execute(id: number): Promise<Resena> {
    console.log(`🔍 [GetResena] Buscando reseña con ID: ${id}`);
    
    try {
      const resena = await this.repo.getResena(id);
      console.log(`✅ [GetResena] Reseña encontrada:`, resena);
      return resena;
    } catch (error: any) {
      console.error(`❌ [GetResena] Error al obtener reseña con ID ${id}:`, error.message);
      
      // Si es un error 404, lanzar un error más específico
      if (error.statusCode === 404) {
        const notFoundError: any = new Error(`Reseña con ID ${id} no encontrada`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      // Re-lanzar otros errores
      throw error;
    }
  }
}

/**
 * Caso de uso para crear una nueva reseña.
 * Basado en POST /resenas de la API de Taller4.
 * La API valida que el usuario tenga una reserva confirmada.
 */
export class CreateResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Crea una nueva reseña.
   * @param input - Datos de la reseña a crear
   * @returns Promise con la reseña creada
   */
  async execute(input: CreateResenaInput): Promise<Resena> {
    // Validaciones básicas de negocio
    this.validateResenaInput(input);
    
    // La API se encarga de validar que tenga reserva confirmada
    return this.repo.createResena(input);
  }

  private validateResenaInput(input: CreateResenaInput): void {
    // Validar calificación
    if (input.calificacion < 1 || input.calificacion > 5) {
      throw new Error("La calificación debe estar entre 1 y 5 estrellas");
    }

    // Validar que se indique cancha o complejo
    if (!input.idCancha && !input.idComplejo) {
      throw new Error("Debe indicar id_cancha o id_complejo");
    }

    // Validar comentario si existe
    if (input.comentario) {
      if (input.comentario.trim().length < 10) {
        throw new Error("El comentario debe tener al menos 10 caracteres");
      }

      if (input.comentario.length > 2000) {
        throw new Error("El comentario no puede exceder 2000 caracteres");
      }
    }
  }
}

/**
 * Caso de uso para actualizar datos de una reseña.
 * Basado en PATCH /resenas/{id} de la API de Taller4.
 * Solo el autor puede editar su reseña.
 */
export class UpdateResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Actualiza parcialmente una reseña.
   * @param id - ID de la reseña
   * @param input - Datos a actualizar
   * @returns Promise con la reseña actualizada
   */
  async execute(id: number, input: UpdateResenaInput): Promise<Resena> {
    // Validaciones si se actualiza la calificación
    if (input.calificacion !== undefined) {
      if (input.calificacion < 1 || input.calificacion > 5) {
        throw new Error("La calificación debe estar entre 1 y 5 estrellas");
      }
    }

    // Validaciones si se actualiza el comentario
    if (input.comentario !== undefined) {
      if (input.comentario.trim().length < 10) {
        throw new Error("El comentario debe tener al menos 10 caracteres");
      }
      if (input.comentario.length > 2000) {
        throw new Error("El comentario no puede exceder 2000 caracteres");
      }
    }
    
    return this.repo.updateResena(id, input);
  }
}

/**
 * Caso de uso para eliminar una reseña.
 * Basado en DELETE /resenas/{id} de la API de Taller4.
 * Permisos: autor, admin/dueno del complejo, o superadmin.
 */
export class DeleteResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Elimina una reseña del sistema.
   * @param id - ID de la reseña a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> {
    return this.repo.deleteResena(id);
  }
}

/**
 * Caso de uso para reportar una reseña.
 * Basado en POST /resenas/{id}/reportar de la API de Taller4.
 * 1 reporte por usuario por reseña (UPSERT).
 */
export class ReportarResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Reporta una reseña como inapropiada.
   * @param resenaId - ID de la reseña
   * @param motivo - Motivo del reporte (opcional)
   * @returns Promise que se resuelve cuando se completa
   */
  execute(resenaId: number, motivo?: string): Promise<any> {
    if (motivo && motivo.length > 2000) {
      throw new Error("El motivo no puede exceder 2000 caracteres");
    }
    
    return this.repo.reportarResena(resenaId, motivo);
  }
}
