require('dotenv').config({ path: '../.env' });
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
let uuidv4;
(async () => {
  const { v4 } = await import('uuid');
  uuidv4 = v4;
})();
// Ruta del archivo donde se guardarán los IDs y nombres de archivo
const MAP_FILE = path.join(__dirname, 'img_map.json');

// Función para guardar el mapeo ID <-> nombre de archivo
function saveImageMap(id, filename) {
  let map = {};
  if (fs.existsSync(MAP_FILE)) {
    map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  }
  map[id] = filename;
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}

// Función para obtener el nombre de archivo por ID
function getFilenameById(id) {
  if (!fs.existsSync(MAP_FILE)) return null;
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  return map[id] || null;
}
const sharp = require('sharp');

const app = express();

// Configuración de multer para limitar tamaños de archivo (50MB máximo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB máximo
});


// Configuración de Cloudflare R2
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.URL3_Subida_Perfil,
  credentials: {
    accessKeyId: process.env.ID_Subida_Perfil, 
    secretAccessKey: process.env.Clave_Subida_Perfil,
  },
});

const BUCKET = process.env.BUCKET_Subida_Perfil; 

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/imgPerfil', express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '..')));

// Endpoint de visualización eliminado

// Servir index_subida.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index_subida.html'));
});



// Configuración para procesar el formulario con datos adicionales además de los archivos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Subir imágenes (múltiples), asignar ID único a cada una y devolver array de resultados
app.post('/upload', upload.array('images'), async (req, res) => {
  const files = req.files;
  if (!files || !files.length) return res.status(400).send('No se subió ningún archivo');

  // Verificar si hay una solicitud para procesar en el servidor
  const processInServer = req.body.process_server === 'true';

  let resultados = [];
  for (const file of files) {
    // Generar un ID único y extensión
    const id = uuidv4();
    let ext = path.extname(file.originalname);
    
    // Si la extensión no es WebP y viene del cliente, aseguramos que se guarde como WebP
    if (ext.toLowerCase() !== '.webp') {
      ext = '.webp';
    }
    const filename = id + ext;

    // Procesar todas las imágenes como WebP
    // Y adicionalmente optimizar las mayores a 1MB
    let bufferToUpload = file.buffer;
    let contentType = file.mimetype;
    
    try {
      // Configuración base para todas las imágenes
      let sharpProcess = sharp(file.buffer).rotate();
      
      // Para imágenes grandes, aplicar redimensionamiento
      if (file.size > 1 * 1024 * 1024) {
        sharpProcess = sharpProcess.resize({ width: 1920, withoutEnlargement: true });
      }
      
      // Siempre convertir a WebP
      const processedBuffer = await sharpProcess
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
      
      // Solo usar la versión procesada si realmente es más pequeña o si no es WebP originalmente
      if (processedBuffer.length < file.buffer.length || contentType !== 'image/webp') {
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
    try {
      await R2.send(new PutObjectCommand(uploadParams));
      saveImageMap(id, filename);
      resultados.push({ id, filename });
    } catch (err) {
      resultados.push({ error: 'Error al subir la imagen: ' + err.message, file: file.originalname });
    }
  }
  res.json(resultados);
});
// Endpoint de visualización por ID eliminado



// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});