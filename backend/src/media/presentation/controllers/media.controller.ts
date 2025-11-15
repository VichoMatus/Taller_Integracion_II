// Controlador base para media
import { MediaApiRepository } from "../../infrastructure/MediaApiRepository";

export class MediaController {
  constructor(private mediaApi: MediaApiRepository) {}

  async upload(req: any, res: any) {
    try {
      const result = await this.mediaApi.uploadMedia(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async list(req: any, res: any) {
    try {
      const result = await this.mediaApi.listMedia(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markPrincipal(req: any, res: any) {
    try {
      const result = await this.mediaApi.markAsPrincipal(req.params.id_media);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: any, res: any) {
    try {
      const result = await this.mediaApi.deleteMedia(req.params.id_media);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async replace(req: any, res: any) {
    try {
      const result = await this.mediaApi.replaceMedia(req.params.id_media, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async reorder(req: any, res: any) {
    try {
      const result = await this.mediaApi.reorderMedia(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
