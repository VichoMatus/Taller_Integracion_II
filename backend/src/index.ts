/**
 * SERVIDOR PRINCIPAL - BACKEND FOR FRONTEND (BFF)
 * ===============================================
 * 
 * Este servidor Expr  console.log('🚀 Servidor BFF iniciado correctamente');
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`🌐 API FastAPI: ${process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me'}`);
  console.log(`📄 Documentación FastAPI: ${process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me'}/docs`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /api`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - GET  /api/superadmin/users`);
  console.log(`   - Y muchos más...`);BFF entre el frontend y la API FastAPI.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './auth/routes/authRoutes';
import superAdminRoutes from './superAdmin/routes/superAdminRoutes';
import usuarioRoutes from './usuario/routes/usuarioRoutes';
import notificacionesRoutes from './notificaciones/routes/notificacionesRoutes';
import favoritosRoutes from './favoritos/routes/favoritosRoute';
import adminRoutes from './admin/presentation/routes/admin.routes';
import bloqueoRoutes from './bloqueos/presentation/routes/bloqueos.routes';
import reservasRoutes from './reservas/presentation/routes/reservas.routes';
import resenasRoutes from './resenas/presentation/routes/resenas.routes';
import uploadsRoutes from './uploads/presentation/routes/uploads.routes';
import canchasRoutes from './canchas/routes/canchas.routes';
import complejosRoutes from './complejos/routes/complejos.routes';

/**
 * CARGA DE VARIABLES DE ENTORNO
 */

// Cargar variables de entorno desde el .env de la raíz del proyecto
// En Docker, el .env se monta en /app/.env
// En desarrollo local, está en ../../.env
dotenv.config({ 
  path: process.env.NODE_ENV === 'development' && process.cwd().includes('/app')
    ? path.resolve(__dirname, '../.env')       // Docker (montado en /app/.env)
    : path.resolve(__dirname, '../../.env')    // Desarrollo local
});

const app = express();
const PORT = process.env.BFF_PORT || process.env.PORT || 4000;

/**
 * MIDDLEWARES GLOBALES
 */

// CORS - Permitir requests desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

/**
 * RUTAS PRINCIPALES
 */

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'SportHub BFF API está funcionando',
    endpoints: {
      info: '/api',
      health: '/health',
      auth: '/api/auth',
      admin: '/api/superadmin',
      usuarios: '/api/usuarios',
      reservas: '/api/reservas',
      resenas: '/api/resenas',
      notificaciones: '/api/notificaciones',
      favoritos: '/api/favoritos',
      bloqueos: '/api/bloqueos',
      uploads: '/api/uploads',
      superadmin: '/api/superadmin'
    }
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SportHub BFF',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

// Rutas de bloqueos
app.use('/api/bloqueos', bloqueoRoutes);

// Rutas de reservas
app.use('/api/reservas', reservasRoutes);

// Rutas de reseñas
app.use('/api/resenas', resenasRoutes);

// Rutas de uploads
app.use('/api/uploads', uploadsRoutes);

// Rutas de canchas
app.use('/api/canchas', canchasRoutes);

// Rutas de complejos
app.use('/api/complejos', complejosRoutes);

// Rutas de administración (legacy)
app.use('/api/superadmin', superAdminRoutes);

// Middleware de debug para ver todas las rutas
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Original URL: ${req.originalUrl}`);
  next();
});

// Ruta de prueba simple para usuarios
app.get('/api/usuarios/test', (req, res) => {
  res.json({ message: 'Endpoint de usuarios funciona', timestamp: new Date() });
});

// Rutas de usuarios
console.log('Montando rutas de usuarios...');
app.use('/api/usuarios', usuarioRoutes);

// Rutas de notificaciones
app.use('/api/notificaciones', notificacionesRoutes);

// Rutas de favoritos
app.use('/api/favoritos', favoritosRoutes);

// Ruta de información general
app.get('/api', (req, res) => {
  res.json({
    name: 'SportHub Backend for Frontend',
    version: '1.0.0',
    description: 'BFF que conecta el frontend con la API FastAPI',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      superadmin: '/api/superadmin/*',
      usuarios: '/api/usuarios/*',
      reservas: '/api/reservas/*',
      resenas: '/api/resenas/*',
      notificaciones: '/api/notificaciones/*',
      favoritos: '/api/favoritos/*',
      admin: '/api/admin/*',
      bloqueos: '/api/bloqueos/*',
      uploads: '/api/uploads/*',
    },
    api: {
      fastapi: process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me',
      docs: `${process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me'}/docs`
    }
  });
});

// === Endpoint Global de Status ===
app.get("/status", async (req, res) => {
  const modules = [
    { name: "admin", url: "/admin/status" },
    { name: "canchas", url: "/canchas/status" },
    { name: "complejos", url: "/complejos/status" },
    { name: "reservas", url: "/reservas/status" },
    { name: "bloqueos", url: "/bloqueos/status" },
    { name: "resenas", url: "/resenas/status" },
    { name: "uploads", url: "/uploads/status" }
  ];

  res.json({
    ok: true,
    message: "SportHub Backend API funcionando",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    fastapi_url: process.env.API_BASE_URL,
    modules: modules.map(m => ({
      name: m.name,
      status_endpoint: `${req.protocol}://${req.get('host')}${m.url}`
    })),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * MANEJO DE ERRORES
 */

// 404 - Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

/**
 * INICIAR SERVIDOR
 */

app.listen(PORT, () => {
  console.log('🚀 Servidor BFF iniciado correctamente');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌐 API FastAPI: ${process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me'}`);
  console.log(`📖 Documentación FastAPI: ${process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me'}/docs`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /api`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - GET  /api/superadmin/users`);
  console.log(`   - GET  /api/usuarios`);
  console.log(`   - GET  /api/reservas`);
  console.log(`   - GET  /api/resenas`);
  console.log(`   - GET  /api/notificaciones`);
  console.log(`   - GET  /api/favoritos`);
  console.log(`   - GET  /api/admin/users`);
  console.log(`   - GET  /api/canchas`);
  console.log(`   - GET  /api/complejos`);
  console.log(`   - POST /api/reservas/verificar-disponibilidad`);
  console.log(`   - GET  /api/reservas`);
  console.log(`   - POST /api/bloqueos/verificar-conflicto`);
  console.log(`   - GET  /api/resenas/complejo/:id`);
  console.log(`   - POST /api/uploads`);
  console.log(`   - Y muchos más...`);
});

export default app;
