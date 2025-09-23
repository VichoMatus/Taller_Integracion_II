import { ComplejoRepository, ComplejoFilters, CreateComplejoInput, UpdateComplejoInput } from "../domain/ComplejoRepository";
import { Complejo, EstadoComplejo } from "../../domain/complejo/Complejo";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso para listar complejos con paginación y filtros.
 */
export class ListComplejos {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Obtiene una lista paginada de complejos.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado
   */
  execute(filters: ComplejoFilters): Promise<Paginated<Complejo>> {
    return this.repo.listComplejos(filters);
  }
}

/**
 * Caso de uso para obtener un complejo específico.
 */
export class GetComplejo {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Obtiene un complejo por su ID.
   * @param id - ID del complejo
   * @returns Promise con los datos del complejo
   */
  execute(id: number): Promise<Complejo> {
    return this.repo.getComplejo(id);
  }
}

/**
 * Caso de uso para crear un nuevo complejo.
 */
export class CreateComplejo {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Crea un nuevo complejo.
   * @param input - Datos del complejo a crear
   * @returns Promise con el complejo creado
   */
  execute(input: CreateComplejoInput): Promise<Complejo> {
    // Validaciones de negocio
    if (!input.nombre.trim()) {
      throw new Error("El nombre del complejo es requerido");
    }
    if (!input.direccion.trim()) {
      throw new Error("La dirección es requerida");
    }
    if (!this.isValidTimeFormat(input.horaApertura) || !this.isValidTimeFormat(input.horaCierre)) {
      throw new Error("Las horas deben estar en formato HH:mm");
    }
    if (input.horaApertura >= input.horaCierre) {
      throw new Error("La hora de apertura debe ser anterior a la hora de cierre");
    }
    
    return this.repo.createComplejo(input);
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}

/**
 * Caso de uso para actualizar datos de un complejo.
 */
export class UpdateComplejo {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Actualiza parcialmente un complejo.
   * @param id - ID del complejo
   * @param input - Datos a actualizar
   * @returns Promise con el complejo actualizado
   */
  execute(id: number, input: UpdateComplejoInput): Promise<Complejo> {
    // Validaciones de negocio
    if (input.nombre !== undefined && !input.nombre.trim()) {
      throw new Error("El nombre del complejo no puede estar vacío");
    }
    if (input.horaApertura && input.horaCierre && input.horaApertura >= input.horaCierre) {
      throw new Error("La hora de apertura debe ser anterior a la hora de cierre");
    }
    
    return this.repo.updateComplejo(id, input);
  }
}

/**
 * Caso de uso para eliminar un complejo.
 */
export class DeleteComplejo {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Elimina un complejo del sistema.
   * @param id - ID del complejo a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> {
    return this.repo.deleteComplejo(id);
  }
}

/**
 * Caso de uso para cambiar el estado de un complejo.
 */
export class CambiarEstadoComplejo {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Cambia el estado de un complejo.
   * @param id - ID del complejo
   * @param estado - Nuevo estado
   * @returns Promise con el complejo actualizado
   */
  execute(id: number, estado: EstadoComplejo): Promise<Complejo> {
    return this.repo.cambiarEstado(id, estado);
  }
}

/**
 * Caso de uso para obtener complejos por dueño.
 */
export class GetComplejosByDuenio {
  constructor(private repo: ComplejoRepository) {}
  
  /**
   * Obtiene complejos de un dueño específico.
   * @param duenioId - ID del dueño
   * @returns Promise con lista de complejos
   */
  execute(duenioId: number): Promise<Complejo[]> {
    return this.repo.getComplejosByDuenio(duenioId);
  }
}
