import { ResenaRepository, ResenaFilters, CreateResenaInput, UpdateResenaInput, EstadisticasResenas } from "../domain/ResenaRepository";
import { Resena, EstadoResena } from "../../domain/resena/Resena";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso para listar reseñas con paginación y filtros.
 */
export class ListResenas {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene una lista paginada de reseñas.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado
   */
  execute(filters: ResenaFilters): Promise<Paginated<Resena>> {
    return this.repo.listResenas(filters);
  }
}

/**
 * Caso de uso para obtener una reseña específica.
 */
export class GetResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene una reseña por su ID.
   * @param id - ID de la reseña
   * @returns Promise con los datos de la reseña
   */
  execute(id: number): Promise<Resena> {
    return this.repo.getResena(id);
  }
}

/**
 * Caso de uso para crear una nueva reseña.
 */
export class CreateResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Crea una nueva reseña.
   * @param input - Datos de la reseña a crear
   * @returns Promise con la reseña creada
   */
  async execute(input: CreateResenaInput): Promise<Resena> {
    // Validaciones de negocio
    this.validateResenaInput(input);
    
    // Verificar que el usuario no haya reseñado ya este complejo
    const yaReseno = await this.repo.usuarioYaReseno(input.usuarioId, input.complejoId);
    if (yaReseno) {
      throw new Error("Ya has reseñado este complejo anteriormente");
    }
    
    return this.repo.createResena(input);
  }

  private validateResenaInput(input: CreateResenaInput): void {
    // Validar calificación
    if (input.calificacion < 1 || input.calificacion > 5) {
      throw new Error("La calificación debe estar entre 1 y 5 estrellas");
    }

    // Validar comentario
    if (!input.comentario.trim()) {
      throw new Error("El comentario es requerido");
    }

    if (input.comentario.length < 10) {
      throw new Error("El comentario debe tener al menos 10 caracteres");
    }

    if (input.comentario.length > 1000) {
      throw new Error("El comentario no puede exceder 1000 caracteres");
    }

    // Validar palabras ofensivas básicas
    const palabrasOfensivas = ["idiota", "estúpido", "basura"]; // Expandir según necesidad
    const comentarioLower = input.comentario.toLowerCase();
    const tieneOfensas = palabrasOfensivas.some(palabra => comentarioLower.includes(palabra));
    
    if (tieneOfensas) {
      throw new Error("El comentario contiene lenguaje inapropiado");
    }
  }
}

/**
 * Caso de uso para actualizar datos de una reseña.
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
      if (!input.comentario.trim()) {
        throw new Error("El comentario no puede estar vacío");
      }
      if (input.comentario.length < 10) {
        throw new Error("El comentario debe tener al menos 10 caracteres");
      }
      if (input.comentario.length > 1000) {
        throw new Error("El comentario no puede exceder 1000 caracteres");
      }
    }
    
    return this.repo.updateResena(id, input);
  }
}

/**
 * Caso de uso para eliminar una reseña.
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
 * Caso de uso para obtener reseñas de un usuario.
 */
export class GetResenasByUsuario {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene reseñas de un usuario específico.
   * @param usuarioId - ID del usuario
   * @returns Promise con lista de reseñas
   */
  execute(usuarioId: number): Promise<Resena[]> {
    return this.repo.getResenasByUsuario(usuarioId);
  }
}

/**
 * Caso de uso para obtener reseñas de un complejo.
 */
export class GetResenasByComplejo {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene reseñas de un complejo específico.
   * @param complejoId - ID del complejo
   * @param incluirOcultas - Si incluir reseñas ocultas
   * @returns Promise con lista de reseñas
   */
  execute(complejoId: number, incluirOcultas = false): Promise<Resena[]> {
    return this.repo.getResenasByComplejo(complejoId, incluirOcultas);
  }
}

/**
 * Caso de uso para dar like a una reseña.
 */
export class DarLike {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Agrega un like a una reseña.
   * @param resenaId - ID de la reseña
   * @param usuarioId - ID del usuario
   * @returns Promise con la reseña actualizada
   */
  execute(resenaId: number, usuarioId: number): Promise<Resena> {
    return this.repo.darLike(resenaId, usuarioId);
  }
}

/**
 * Caso de uso para quitar like de una reseña.
 */
export class QuitarLike {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Remueve un like de una reseña.
   * @param resenaId - ID de la reseña
   * @param usuarioId - ID del usuario
   * @returns Promise con la reseña actualizada
   */
  execute(resenaId: number, usuarioId: number): Promise<Resena> {
    return this.repo.quitarLike(resenaId, usuarioId);
  }
}

/**
 * Caso de uso para reportar una reseña.
 */
export class ReportarResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Reporta una reseña como inapropiada.
   * @param resenaId - ID de la reseña
   * @param usuarioId - ID del usuario que reporta
   * @param motivo - Motivo del reporte
   * @returns Promise que se resuelve cuando se completa
   */
  execute(resenaId: number, usuarioId: number, motivo: string): Promise<void> {
    if (!motivo.trim()) {
      throw new Error("El motivo del reporte es requerido");
    }
    
    return this.repo.reportarResena(resenaId, usuarioId, motivo);
  }
}

/**
 * Caso de uso para obtener estadísticas de reseñas.
 */
export class GetEstadisticasResenas {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Obtiene estadísticas de reseñas para un complejo.
   * @param complejoId - ID del complejo
   * @returns Promise con estadísticas detalladas
   */
  execute(complejoId: number): Promise<EstadisticasResenas> {
    return this.repo.getEstadisticas(complejoId);
  }
}

/**
 * Caso de uso para responder a una reseña.
 */
export class ResponderResena {
  constructor(private repo: ResenaRepository) {}
  
  /**
   * Responde a una reseña (solo dueño del complejo).
   * @param resenaId - ID de la reseña
   * @param respuesta - Texto de la respuesta
   * @returns Promise con la reseña actualizada
   */
  execute(resenaId: number, respuesta: string): Promise<Resena> {
    if (!respuesta.trim()) {
      throw new Error("La respuesta no puede estar vacía");
    }
    
    if (respuesta.length > 500) {
      throw new Error("La respuesta no puede exceder 500 caracteres");
    }
    
    return this.repo.responderResena(resenaId, respuesta);
  }
}
