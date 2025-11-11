import axios from 'axios';

/**
 * Servicio para subir imágenes de canchas usando el servicio Cloudflare existente
 * Se conecta al endpoint /upload del servicio cloudflare/subirCanchas
 */
export class CloudflareImageUploader {
  private cloudflareEndpoint: string;

  constructor() {
    // URL del servicio cloudflare que ya tienes funcionando
    // Por defecto apunta al puerto 3000 donde corre subidaCanchas.js
    this.cloudflareEndpoint = process.env.CLOUDFLARE_UPLOAD_ENDPOINT || 'http://localhost:3000';
  }

  /**
   * Sube una imagen de cancha usando el servicio existente
   * @param fileBuffer - Buffer del archivo de imagen
   * @param originalName - Nombre original del archivo
   * @returns Objeto con id único y filename generado
   */
  async uploadCanchaImage(fileBuffer: any, originalName: string): Promise<{ id: string; filename: string; url: string }> {
    try {
      // Crear FormData para enviar al servicio Cloudflare
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Agregar el archivo como stream
      formData.append('images', fileBuffer, {
        filename: originalName,
        contentType: this.getMimeType(originalName)
      });
      
      // Indicar que se procese en el servidor
      formData.append('process_server', 'true');

      // Hacer petición al servicio Cloudflare
      const response = await axios.post(`${this.cloudflareEndpoint}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000 // 60 segundos timeout
      });

      const resultados = response.data;
      
      if (Array.isArray(resultados) && resultados.length > 0) {
        const resultado = resultados[0];
        
        if (resultado.error) {
          throw new Error(resultado.error);
        }
        
        // Construir URL pública (ajustar según tu configuración)
        const publicUrl = `${this.cloudflareEndpoint}/view/${resultado.id}`;
        
        return {
          id: resultado.id,
          filename: resultado.filename,
          url: publicUrl
        };
      } else {
        throw new Error('Respuesta inesperada del servicio de upload');
      }
    } catch (error: any) {
      console.error('Error uploading to Cloudflare service:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Sube múltiples imágenes usando el servicio existente
   * @param files - Array de archivos con buffer y nombre original
   * @returns Array de resultados de subida
   */
  async uploadMultipleImages(files: Array<{ buffer: any; originalname: string }>): Promise<Array<{ id: string; filename: string; url: string; error?: string }>> {
    try {
      // Crear FormData para múltiples archivos
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Agregar todos los archivos
      files.forEach((file, index) => {
        formData.append('images', file.buffer, {
          filename: file.originalname,
          contentType: this.getMimeType(file.originalname)
        });
      });
      
      // Indicar que se procese en el servidor
      formData.append('process_server', 'true');

      // Hacer petición al servicio Cloudflare
      const response = await axios.post(`${this.cloudflareEndpoint}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 120000 // 2 minutos timeout para múltiples archivos
      });

      const resultados = response.data;
      
      if (Array.isArray(resultados)) {
        return resultados.map((resultado: any) => {
          if (resultado.error) {
            return {
              id: '',
              filename: '',
              url: '',
              error: resultado.error
            };
          }
          
          const publicUrl = `${this.cloudflareEndpoint}/view/${resultado.id}`;
          
          return {
            id: resultado.id,
            filename: resultado.filename,
            url: publicUrl
          };
        });
      } else {
        throw new Error('Respuesta inesperada del servicio de upload');
      }
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      // Retornar array con errores
      return files.map(() => ({
        id: '',
        filename: '',
        url: '',
        error: `Error uploading: ${error.message}`
      }));
    }
  }

  /**
   * Obtiene el MIME type basado en la extensión del archivo
   * @param filename - Nombre del archivo
   * @returns MIME type
   */
  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }
}