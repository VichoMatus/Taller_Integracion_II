import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

export class SuperAdminProfileImageService {
  private r2: S3Client;
  private bucket: string;

  constructor() {
    this.r2 = new S3Client({
      region: 'auto',
      endpoint: process.env.URL3_Subida_PerfilSuperAdmin,
      credentials: {
        accessKeyId: process.env.ID_Subida_PerfilSuperAdmin!,
        secretAccessKey: process.env.Clave_Subida_PerfilSuperAdmin!,
      },
    });
    this.bucket = process.env.BUCKET_Subida_PerfilSuperAdmin!;
  }

  async processAndUploadImage(fileBuffer: Buffer, originalName: string): Promise<{ filename: string; url: string }> {
    // Procesar imagen: convertir a webp, redimensionar si es necesario
    let sharpProcess = sharp(fileBuffer).rotate();
    const processedBuffer = await sharpProcess
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const filename = uuidv4() + '.webp';
    const uploadParams = {
      Bucket: this.bucket,
      Key: filename,
      Body: processedBuffer,
      ContentType: 'image/webp',
    };
    await this.r2.send(new PutObjectCommand(uploadParams));
    const url = `${process.env.URL3_Subida_PerfilSuperAdmin}/${this.bucket}/${filename}`;
    return { filename, url };
  }
}
