import { buildHttpClient } from "../../infra/http/client";
import { ENV } from "../../config/env";
import { CloudflareImageRetriever } from "../infrastructure/CloudflareImageRetriever";

/**
 * Servicio integrado para obtener fotos de canchas
 * Combina datos de FastAPI con imágenes de Cloudflare
 */
export class CanchaImageService {
  private imageRetriever: CloudflareImageRetriever;
  private httpClient: any;

  constructor(authToken?: string) {
    this.imageRetriever = new CloudflareImageRetriever();
    this.httpClient = buildHttpClient(ENV.FASTAPI_URL, () => authToken || "");
  }

  /**
   * Obtiene todas las fotos de una cancha con URLs de Cloudflare
   * @param canchaId - ID de la cancha
   * @returns Lista de fotos con URLs de Cloudflare
   */
  async getCanchaPhotos(canchaId: number) {
    try {
      console.log(`📋 Obteniendo fotos de cancha ${canchaId}...`);
      
      // 1. Obtener lista de fotos desde FastAPI
      const { data: fotosFromAPI } = await this.httpClient.get(`/canchas/${canchaId}/fotos`);
      
      if (!Array.isArray(fotosFromAPI) || fotosFromAPI.length === 0) {
        console.log(`ℹ️ No hay fotos para cancha ${canchaId}`);
        return {
          success: true,
          data: [],
          total: 0
        };
      }

      console.log(`📷 Encontradas ${fotosFromAPI.length} fotos en FastAPI`);

      // 2. Para cada foto, obtener URL de Cloudflare
      const fotosConCloudflare = [];
      
      for (const foto of fotosFromAPI) {
        try {
          // Obtener URL de Cloudflare usando el filename
          const cloudflareUrl = await this.imageRetriever.getImage(foto.filename || foto.url, 'url');
          
          // Verificar que la imagen existe
          const imageInfo = await this.imageRetriever.getImageInfo(foto.filename || foto.url);
          
          fotosConCloudflare.push({
            id: foto.id,
            filename: foto.filename,
            descripcion: foto.descripcion || null,
            orden: foto.orden || 0,
            fecha_subida: foto.fecha_subida || foto.created_at,
            // URLs
            fastapi_url: foto.url, // URL original de FastAPI
            cloudflare_url: cloudflareUrl as string,
            // Estado
            available: imageInfo.exists,
            size: imageInfo.size,
            content_type: imageInfo.contentType
          });
          
          console.log(`✅ Foto ${foto.filename} procesada correctamente`);
        } catch (error: any) {
          console.error(`❌ Error procesando foto ${foto.filename}:`, error.message);
          
          // Incluir foto con error para debug
          fotosConCloudflare.push({
            id: foto.id,
            filename: foto.filename,
            descripcion: foto.descripcion || null,
            orden: foto.orden || 0,
            fecha_subida: foto.fecha_subida || foto.created_at,
            fastapi_url: foto.url,
            cloudflare_url: '',
            available: false,
            error: error.message
          });
        }
      }

      console.log(`✅ Procesadas ${fotosConCloudflare.length} fotos para cancha ${canchaId}`);

      return {
        success: true,
        data: fotosConCloudflare.sort((a, b) => (a.orden || 0) - (b.orden || 0)),
        total: fotosConCloudflare.length,
        available: fotosConCloudflare.filter(f => f.available).length,
        unavailable: fotosConCloudflare.filter(f => !f.available).length
      };
    } catch (error: any) {
      console.error(`❌ Error obteniendo fotos de cancha ${canchaId}:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido',
          details: error.response?.data || null
        },
        data: [],
        total: 0
      };
    }
  }

  /**
   * Obtiene la imagen principal de una cancha
   * @param canchaId - ID de la cancha
   * @returns URL de la imagen principal
   */
  async getCanchaMainPhoto(canchaId: number) {
    try {
      console.log(`🖼️ Obteniendo foto principal de cancha ${canchaId}...`);
      
      const result = await this.getCanchaPhotos(canchaId);
      
      if (!result.success || result.data.length === 0) {
        return {
          success: false,
          error: 'No hay fotos disponibles para esta cancha'
        };
      }

      // Buscar foto principal (orden 0 o primera disponible)
      const fotoPrincipal = result.data.find(foto => foto.orden === 0 && foto.available) 
                          || result.data.find(foto => foto.available)
                          || result.data[0];

      if (!fotoPrincipal) {
        return {
          success: false,
          error: 'No se encontró foto principal'
        };
      }

      console.log(`✅ Foto principal encontrada: ${fotoPrincipal.filename}`);

      return {
        success: true,
        data: {
          id: fotoPrincipal.id,
          filename: fotoPrincipal.filename,
          cloudflare_url: fotoPrincipal.cloudflare_url,
          descripcion: fotoPrincipal.descripcion,
          available: fotoPrincipal.available
        }
      };
    } catch (error: any) {
      console.error(`❌ Error obteniendo foto principal de cancha ${canchaId}:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido'
        }
      };
    }
  }

  /**
   * Obtiene URLs optimizadas para diferentes tamaños
   * @param canchaId - ID de la cancha
   * @param sizes - Tamaños requeridos
   * @returns URLs optimizadas
   */
  async getCanchaPhotosOptimized(
    canchaId: number, 
    sizes: Array<{ name: string; width?: number; height?: number; quality?: number }>
  ) {
    try {
      const result = await this.getCanchaPhotos(canchaId);
      
      if (!result.success) {
        return result;
      }

      const optimizedPhotos = result.data
        .filter(foto => foto.available)
        .map(foto => {
          const optimizedSizes: Record<string, string> = {};
          
          for (const size of sizes) {
            optimizedSizes[size.name] = this.imageRetriever.generateOptimizedUrl(
              foto.filename, 
              {
                width: size.width,
                height: size.height,
                quality: size.quality || 80,
                format: 'webp'
              }
            );
          }

          return {
            id: foto.id,
            filename: foto.filename,
            descripcion: foto.descripcion,
            original_url: foto.cloudflare_url,
            optimized: optimizedSizes
          };
        });

      return {
        success: true,
        data: optimizedPhotos,
        total: optimizedPhotos.length
      };
    } catch (error: any) {
      console.error(`❌ Error generando fotos optimizadas:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido'
        }
      };
    }
  }

  /**
   * Verifica el estado de las imágenes de una cancha
   * @param canchaId - ID de la cancha
   * @returns Reporte de estado de imágenes
   */
  async checkCanchaImagesStatus(canchaId: number) {
    try {
      console.log(`🔍 Verificando estado de imágenes de cancha ${canchaId}...`);
      
      const result = await this.getCanchaPhotos(canchaId);
      
      if (!result.success) {
        return result;
      }

      const report = {
        cancha_id: canchaId,
        total_images: result.total,
        available_images: result.available || 0,
        unavailable_images: result.unavailable || 0,
        status: result.available === result.total ? 'all_available' : 
                result.available === 0 ? 'none_available' : 'partial_available',
        images: result.data.map(foto => ({
          filename: foto.filename,
          available: foto.available,
          error: foto.error || null,
          size: foto.size || null
        }))
      };

      console.log(`📊 Reporte de imágenes: ${report.available_images}/${report.total_images} disponibles`);

      return {
        success: true,
        data: report
      };
    } catch (error: any) {
      console.error(`❌ Error verificando estado de imágenes:`, error);
      
      return {
        success: false,
        error: {
          message: error.message || 'Error desconocido'
        }
      };
    }
  }
}