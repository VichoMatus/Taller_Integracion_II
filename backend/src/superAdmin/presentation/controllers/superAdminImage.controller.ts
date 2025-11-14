import { Request, Response } from 'express';
import { streamSuperAdminImage } from '../../infrastructure/SuperAdminImageRetriever';

export async function getSuperAdminImage(req: Request, res: Response) {
  const filename = req.params.filename;
  if (!filename) {
    return res.status(400).json({ ok: false, error: 'Filename requerido' });
  }
  await streamSuperAdminImage(filename, res);
}
