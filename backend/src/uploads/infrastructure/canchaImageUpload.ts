import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.URL3_Subida_Canchas,
  credentials: {
    accessKeyId: process.env.ID_Subida_Canchas,
    secretAccessKey: process.env.Clave_Subida_Canchas,
  },
});
const BUCKET = process.env.BUCKET_Subida_Canchas;
const MAP_FILE = path.join(__dirname, 'cancha_img_map.json');

export async function uploadCanchaImage(fileBuffer: Buffer, originalName: string): Promise<{ id: string, filename: string }> {
  const id = uuidv4();
  let ext = path.extname(originalName);
  if (ext.toLowerCase() !== '.webp') {
    ext = '.webp';
  }
  const filename = id + ext;

  let bufferToUpload = fileBuffer;
  let contentType = 'image/webp';
  try {
    let sharpProcess = sharp(fileBuffer).rotate();
    if (fileBuffer.length > 1 * 1024 * 1024) {
      sharpProcess = sharpProcess.resize({ width: 1920, withoutEnlargement: true });
    }
    const processedBuffer = await sharpProcess
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    if (processedBuffer.length < fileBuffer.length || contentType !== 'image/webp') {
      bufferToUpload = processedBuffer;
      contentType = 'image/webp';
    }
  } catch (err) {
    console.error('Error al procesar la imagen:', err);
  }

  const uploadParams = {
    Bucket: BUCKET,
    Key: filename,
    Body: bufferToUpload,
    ContentType: contentType,
  };
  await R2.send(new PutObjectCommand(uploadParams));
  saveImageMap(id, filename);
  return { id, filename };
}

function saveImageMap(id: string, filename: string) {
  let map: Record<string, string> = {};
  if (fs.existsSync(MAP_FILE)) {
    map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  }
  map[id] = filename;
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}
