import { AxiosInstance } from "axios";
// Aquí irán las interfaces y tipos necesarios para Media

export class MediaApiRepository {
  constructor(private http: AxiosInstance) {}

  async uploadMedia(payload: any): Promise<any> {
    const { data } = await this.http.post("/media", payload);
    return data;
  }

  async listMedia(params?: any): Promise<any> {
    const { data } = await this.http.get("/media", { params });
    return data;
  }

  async markAsPrincipal(id_media: string): Promise<any> {
    const { data } = await this.http.post(`/media/${id_media}/principal`);
    return data;
  }

  async deleteMedia(id_media: string): Promise<any> {
    const { data } = await this.http.delete(`/media/${id_media}`);
    return data;
  }

  async replaceMedia(id_media: string, payload: any): Promise<any> {
    const { data } = await this.http.put(`/media/${id_media}`, payload);
    return data;
  }

  async reorderMedia(payload: any): Promise<any> {
    const { data } = await this.http.post(`/media/reorder`, payload);
    return data;
  }
}
