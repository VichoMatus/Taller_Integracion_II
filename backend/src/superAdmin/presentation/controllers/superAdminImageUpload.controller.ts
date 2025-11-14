import { Request, Response } from 'express';
import { processSuperAdminImage } from '../../application/processSuperAdminImage';

export async function uploadSuperAdminImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No se recibió archivo' });
    }
    const { id, filename } = await processSuperAdminImage(req.file.buffer, req.file.originalname);
    // Aquí podrías asociar el filename a la entidad superadmin en la base de datos si es necesario
    return res.status(201).json({ ok: true, id, filename });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
