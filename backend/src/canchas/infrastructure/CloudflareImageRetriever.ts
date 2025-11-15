import axios from 'axios';

/**
 * Servicio para obtener imágenes de canchas desde Cloudflare R2
 * Se conecta al servicio pedircanchas.js para recuperar imágenes por UUID
 */
export class CloudflareImageRetriever {
  private cloudflareEndpoint: string;

  constructor() {
    // URL del servicio pedircanchas.js (puerto donde corre)
    this.cloudflareEndpoint = process.env.CLOUDFLARE_IMAGES_ENDPOINT || 'http://localhost:3000';
  }

  /**
   * Obtiene una imagen por su UUID/filename
   * @param imageId - UUID o filename de la imagen
   * @param format - Formato de respuesta ('url' | 'buffer' | 'stream')
   * @returns URL de la imagen o buffer según el formato
   */
  async getImage(imageId: string, format: 'url' | 'buffer' | 'stream' = 'url'): Promise<string | Buffer | any> {
    try {
      // Limpiar el imageId (quitar extensión si la tiene)
      const uuid = imageId.replace(/\.(webp|jpg|jpeg|png)$/i, '');
      
      const imageUrl = `${this.cloudflareEndpoint}/image/${uuid}`;
      
      if (format === 'url') {
        // Verificar que la imagen existe
        await this.checkImageExists(imageUrl);
        return imageUrl;
      }
      
      if (format === 'buffer') {
        const response = await axios.get(imageUrl, { 
          responseType: 'arraybuffer',
          timeout: 30000 
        });
        return Buffer.from(response.data);
      }
      
      if (format === 'stream') {
        const response = await axios.get(imageUrl, { 
          responseType: 'stream',
          timeout: 30000 
        });
        return response.data;
      }
      
      return imageUrl;
    } catch (error: any) {
      console.error(`❌ Error obteniendo imagen ${imageId}:`, error.message);
      throw new Error(`No se pudo obtener la imagen: ${error.message}`);
    }
  }

  /**
   * Obtiene múltiples imágenes por sus UUIDs
   * @param imageIds - Array de UUIDs/filenames
   * @returns Array de URLs de imágenes
   */
  async getMultipleImages(imageIds: string[]): Promise<Array<{ id: string; url: string; error?: string }>> {
    const results = await Promise.allSettled(
      imageIds.map(async (imageId) => {
        try {
          const url = await this.getImage(imageId, 'url');
          return { id: imageId, url: url as string };
        } catch (error: any) {
          return { id: imageId, url: '', error: error.message };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: imageIds[index],
          url: '',
          error: result.reason?.message || 'Error desconocido'
        };
      }
    });
  }

  /**
   * Obtiene información de una imagen (metadatos básicos)
   * @param imageId - UUID de la imagen
   * @returns Información básica de la imagen
   */
  async getImageInfo(imageId: string): Promise<{
    id: string;
    url: string;
    exists: boolean;
    size?: number;
    contentType?: string;
  }> {
    try {
      const uuid = imageId.replace(/\.(webp|jpg|jpeg|png)$/i, '');
      const imageUrl = `${this.cloudflareEndpoint}/image/${uuid}`;
      
      // Hacer HEAD request para obtener metadatos sin descargar la imagen
      const response = await axios.head(imageUrl, { timeout: 10000 });
      
      return {
        id: imageId,
        url: imageUrl,
        exists: true,
        size: response.headers['content-length'] ? parseInt(response.headers['content-length']) : undefined,
        contentType: response.headers['content-type']
      };
    } catch (error: any) {
      return {
        id: imageId,
        url: '',
        exists: false
      };
    }
  }

  /**
   * Genera URL de imagen con parámetros de optimización
   * @param imageId - UUID de la imagen
   * @param options - Opciones de optimización
   * @returns URL con parámetros
   */
  generateOptimizedUrl(imageId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }): string {
    const uuid = imageId.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    let url = `${this.cloudflareEndpoint}/image/${uuid}`;
    
    if (options) {
      const params = new URLSearchParams();
      
      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.quality) params.append('q', options.quality.toString());
      if (options.format) params.append('f', options.format);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    
    return url;
  }

  /**
   * Verifica si una imagen existe sin descargarla
   * @param imageUrl - URL de la imagen
   * @returns true si existe, false si no
   */
  private async checkImageExists(imageUrl: string): Promise<boolean> {
    try {
      await axios.head(imageUrl, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene todas las imágenes de una cancha desde FastAPI y las convierte en URLs de Cloudflare
   * @param canchaId - ID de la cancha
   * @returns Array de URLs de imágenes
   */
  async getCanchaImages(canchaId: number): Promise<Array<{
    id: number;
    url: string;
    filename: string;
    descripcion?: string;
    cloudflare_url: string;
    exists: boolean;
  }>> {
    try {
      // Nota: Esto requeriría integración con FastAPI para obtener la lista de archivos
      // Por ahora, simulo la respuesta esperada
      console.log(`📋 Obteniendo imágenes de cancha ${canchaId} desde FastAPI...`);
      
      // En la implementación real, esto vendría de FastAPI:
      // const { data } = await this.httpClient.get(`/canchas/${canchaId}/fotos`);
      
      // Simulación de respuesta de FastAPI
      const fotosFromFastAPI = [
        // Esta data vendría de FastAPI con los filenames guardados
      ];
      
      const results = [];
      
      for (const foto of fotosFromFastAPI) {
        try {
          const cloudflareUrl = await this.getImage(foto.filename, 'url');
          const exists = await this.checkImageExists(cloudflareUrl as string);
          
          results.push({
            id: foto.id,
            url: foto.url, // URL original de FastAPI
            filename: foto.filename,
            descripcion: foto.descripcion,
            cloudflare_url: cloudflareUrl as string,
            exists
          });
        } catch (error) {
          results.push({
            id: foto.id,
            url: foto.url,
            filename: foto.filename,
            descripcion: foto.descripcion,
            cloudflare_url: '',
            exists: false
          });
        }
      }
      
      console.log(`✅ Procesadas ${results.length} imágenes para cancha ${canchaId}`);
      return results;
    } catch (error: any) {
      console.error(`❌ Error obteniendo imágenes de cancha ${canchaId}:`, error);
      throw new Error(`Error obteniendo imágenes: ${error.message}`);
    }
  }
}