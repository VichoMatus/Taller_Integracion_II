require('dotenv').config({ path: '../.env' });
const express = require('express');
const path = require('path');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const app = express();


// Configuración de Cloudflare R2
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.URL3_Peticion_Canchas,
  credentials: {
    accessKeyId: process.env.ID_Peticion_Canchas, 
    secretAccessKey: process.env.Clave_Peticion_Canchas, 
  },
});

const BUCKET = process.env.BUCKET_Peticion_Canchas;


// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pedirCanchas', express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '..')));

// Visualizar imagen directamente por UUID (hash del nombre)
app.get('/image/:uuid', async (req, res) => {
  const uuid = decodeURIComponent(req.params.uuid);
  // El nombre del archivo es el UUID + .webp
  const filename = `${uuid}.webp`;
  const getParams = {
    Bucket: BUCKET,
    Key: filename,
  };
  try {
    const data = await R2.send(new GetObjectCommand(getParams));
    res.setHeader('Content-Type', data.ContentType || 'image/webp');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    data.Body.pipe(res);
  } catch (err) {
    res.status(404).send('Imagen no encontrada: ' + err.message);
  }
});

// Servir index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Configuración para procesar solicitudes JSON
app.use(express.json());

// No hay rutas adicionales para buscar imágenes, ya que usamos directamente el UUID



// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});