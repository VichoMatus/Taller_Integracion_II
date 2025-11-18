import { Request, Response, Router } from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.URL3_Subida_PerfilSuperAdmin,
  credentials: {
    accessKeyId: process.env.ID_Subida_PerfilSuperAdmin!,
    secretAccessKey: process.env.Clave_Subida_PerfilSuperAdmin!,
  },
});
const BUCKET = process.env.BUCKET_Subida_PerfilSuperAdmin!;

// Obtener imagen de perfil de superadmin por UUID (hash del nombre)
router.get('/:uuid', async (req: Request, res: Response) => {
  const uuid = decodeURIComponent(req.params.uuid);
  const filename = `${uuid}.webp`;
  const getParams = {
    Bucket: BUCKET,
    Key: filename,
  };
  try {
    const data = await R2.send(new GetObjectCommand(getParams));
    res.setHeader('Content-Type', data.ContentType || 'image/webp');
    res.setHeader('Content-Disposition', `inline; filename=\"${filename}\"`);
    // @ts-ignore
    data.Body.pipe(res);
  } catch (err: any) {
    res.status(404).send('Imagen no encontrada: ' + err.message);
  }
});

export default router;
