import { Request, Response } from 'express';
import { PerfilImageService } from '../../infrastructure/PerfilImageService';

const service = new PerfilImageService();

export class PerfilImageController {
  async uploadProfileImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se envió ninguna imagen.' });
      }
      const { filename, url } = await service.processAndUploadImage(req.file.buffer, req.file.originalname);
      // Aquí podrías guardar el nombre en la base de datos usando la lógica de media si es necesario
      return res.json({ filename, url });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
