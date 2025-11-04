import { Request, Response } from "express";
import { processCanchaImage } from "../../../uploads/application/ProcessCanchaImage";

/**
 * Controlador para subir fotos de canchas
 * Recibe la imagen ya procesada desde el frontend
 */
export async function subirFotoCancha(req: Request, res: Response) {
  try {
    // La imagen procesada debe venir en req.file (usando multer)
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No se recibió archivo" });
    }
    // Procesar y guardar la imagen en R2, obtener nombre generado
    const { id, filename } = await processCanchaImage(req.file.buffer, req.file.originalname);
    // Aquí podrías asociar el filename a la cancha en la base de datos (no implementado aún)
    return res.status(201).json({ ok: true, id, filename });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
