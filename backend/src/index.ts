import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'sporthub_admin',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'sporthubBD',
  port: 5432
};

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'SportHub Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: dbConfig,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend servidor ejecutándose en puerto ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});

export default app;
