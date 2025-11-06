import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuración de Cloudflare R2 desde variables de entorno
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.URL3_Subida_Canchas,
  credentials: {
    accessKeyId: process.env.ID_Subida_Canchas,
    secretAccessKey: process.env.Clave_Subida_Canchas,
  },
});
const BUCKET = process.env.BUCKET_Subida_Canchas;

// Ruta del archivo donde se guardarán los IDs y nombres de archivo
const MAP_FILE = path.join(__dirname, 'cancha_img_map.json');

export async function processCanchaImage(fileBuffer: Buffer, originalName: string): Promise<{ id: string, filename: string }> {
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
    // Redimensionar si es mayor a 1MB
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
  let map = {};
  if (fs.existsSync(MAP_FILE)) {
    map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  }
  map[id] = filename;
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}
