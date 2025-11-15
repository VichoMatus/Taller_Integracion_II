// Interfaz base para el repositorio de media
export interface MediaRepository {
  uploadMedia(payload: any): Promise<any>;
  listMedia(params?: any): Promise<any>;
  markAsPrincipal(id_media: string): Promise<any>;
  deleteMedia(id_media: string): Promise<any>;
  replaceMedia(id_media: string, payload: any): Promise<any>;
  reorderMedia(payload: any): Promise<any>;
}
