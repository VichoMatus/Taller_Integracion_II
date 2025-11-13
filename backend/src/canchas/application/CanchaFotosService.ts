import { buildHttpClient } from "../../infra/http/client";
import { ENV } from "../../config/env";
import { CloudflareImageUploader } from "../infrastructure/CloudflareImageUploader";

/**
 * Servicio para manejar fotos de canchas
 * Sube a Cloudflare R2 y registra en FastAPI
 */
export class CanchaFotosService {
  private imageUploader: CloudflareImageUploader;
  private httpClient: any;

  constructor(authToken?: string) {
    this.imageUploader = new CloudflareImageUploader();
    this.httpClient = buildHttpClient(ENV.FASTAPI_URL, () => authToken || "");
  }

  /**
   * Procesa una imagen y la asocia a una cancha
   * @param canchaId ID de la cancha
   * @param fileBuffer Buffer del archivo de imagen  
   * @param originalName Nombre original del archivo
   * @param descripcion Descripción opcional de la foto
   * @returns Información de la foto creada
   */
  async subirFotoCancha(
    canchaId: number,
    fileBuffer: Buffer,
    originalName: string,
    descripcion?: string
  ) {
    try {
      // 1. Subir imagen a Cloudflare R2
      console.log(`📤 Subiendo imagen ${originalName} para cancha ${canchaId}...`);
      const uploadResult = await this.imageUploader.uploadCanchaImage(fileBuffer, originalName);
      
      console.log(`✅ Imagen subida exitosamente: ${uploadResult.filename}`);

      // 2. Registrar en FastAPI
      const fotoData = {
        url: uploadResult.url,
        filename: uploadResult.filename,
        descripcion: descripcion || null,
        orden: 0 // Orden por defecto
      };

      console.log(`📋 Registrando foto en FastAPI para cancha ${canchaId}...`);
      const { data } = await this.httpClient.post(`/canchas/${canchaId}/fotos`, fotoData);
      
      console.log(`✅ Foto registrada exitosamente en FastAPI`);

      return {
        success: true,
        data: {
          ...data,
          cloudflare_id: uploadResult.id,
          filename: uploadResult.filename,
          url: uploadResult.url
        }
      };
    } catch (error: any) {
      console.error(`❌ Error al procesar foto para cancha ${canchaId}:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido',
          details: error.response?.data || null
        }
      };
    }
  }

  /**
   * Sube múltiples fotos para una cancha
   * @param canchaId ID de la cancha
   * @param files Array de archivos con buffer y nombre original
   * @returns Array de resultados
   */
  async subirMultiplesFotos(
    canchaId: number,
    files: Array<{ buffer: Buffer; originalname: string; descripcion?: string }>
  ) {
    console.log(`📤 Subiendo ${files.length} fotos para cancha ${canchaId}...`);
    
    const resultados = [];
    
    for (const file of files) {
      const resultado = await this.subirFotoCancha(
        canchaId,
        file.buffer,
        file.originalname,
        file.descripcion
      );
      
      resultados.push({
        originalName: file.originalname,
        ...resultado
      });
    }
    
    console.log(`✅ Procesadas ${resultados.length} fotos para cancha ${canchaId}`);
    
    return {
      success: true,
      total: files.length,
      successful: resultados.filter(r => r.success).length,
      failed: resultados.filter(r => !r.success).length,
      results: resultados
    };
  }

  /**
   * Elimina una foto de cancha (tanto de R2 como de FastAPI)
   * @param canchaId ID de la cancha
   * @param fotoId ID de la foto en FastAPI
   * @returns Resultado de la operación
   */
  async eliminarFotoCancha(canchaId: number, fotoId: number) {
    try {
      console.log(`🗑️ Eliminando foto ${fotoId} de cancha ${canchaId}...`);
      
      // Eliminar de FastAPI (el endpoint debería eliminar también de R2 si es necesario)
      await this.httpClient.delete(`/canchas/${canchaId}/fotos/${fotoId}`);
      
      console.log(`✅ Foto ${fotoId} eliminada exitosamente`);
      
      return {
        success: true,
        message: "Foto eliminada exitosamente"
      };
    } catch (error: any) {
      console.error(`❌ Error al eliminar foto ${fotoId}:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido',
          details: error.response?.data || null
        }
      };
    }
  }

  /**
   * Obtiene las fotos de una cancha
   * @param canchaId ID de la cancha
   * @returns Lista de fotos
   */
  async obtenerFotosCancha(canchaId: number) {
    try {
      console.log(`📋 Obteniendo fotos de cancha ${canchaId}...`);
      
      const { data } = await this.httpClient.get(`/canchas/${canchaId}/fotos`);
      
      console.log(`✅ Obtenidas ${data?.length || 0} fotos de cancha ${canchaId}`);
      
      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      console.error(`❌ Error al obtener fotos de cancha ${canchaId}:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido',
          details: error.response?.data || null
        }
      };
    }
  }
}