import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Response } from 'express';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.URL3_Subida_PerfilSuperAdmin,
  credentials: {
    accessKeyId: process.env.ID_Subida_PerfilSuperAdmin!,
    secretAccessKey: process.env.Clave_Subida_PerfilSuperAdmin!,
  },
});
const BUCKET = process.env.BUCKET_Subida_PerfilSuperAdmin;

export async function streamSuperAdminImage(filename: string, res: Response) {
  try {
    const getParams = {
      Bucket: BUCKET,
      Key: filename,
    };
    const data = await R2.send(new GetObjectCommand(getParams));
    res.setHeader('Content-Type', data.ContentType || 'image/webp');
    if (data.ContentLength) res.setHeader('Content-Length', String(data.ContentLength));
    (data.Body as any).pipe(res);
  } catch (err: any) {
    res.status(404).send('Imagen de superadmin no encontrada');
  }
}
