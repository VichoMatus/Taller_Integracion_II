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
  console.log(`   - GET  /api/super_admin/users`);
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
import reservasRoutesNew from './reservas/reservas.routes.new';
import disponibilidadRoutes from './disponibilidad/presentation/routes/disponibilidad.routes';
import pricingRoutes from './pricing/presentation/routes/pricing.routes';
import pagosRoutes from './pagos/presentation/routes/pagos.routes';
import resenasRoutes from './resenas/presentation/routes/resenas.routes';
import uploadsRoutes from './uploads/presentation/routes/uploads.routes';
import canchasRoutes from './canchas/routes/canchas.routes';
import complejosRoutes from './complejos/presentation/routes/complejos.routes';
import canchaImagesRoutes from './canchas/presentation/routes/canchaImages.routes';

/**
 * CONFIGURACIÓN E IMPORTACIONES
 */

// Importar configuración centralizada (ya incluye carga de .env)
import './config/config';

const app = express();
const PORT = process.env.BFF_PORT || process.env.PORT || 4000;

/**
 * MIDDLEWARES GLOBALES
 */

// CORS - Permitir requests desde múltiples orígenes (desarrollo y producción)
const allowedOrigins = [
  // Desarrollo local
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  
  // Frontend Main (producción)
  'https://frontend-cdrhos-0246e7-168-232-167-73.traefik.me',
  
  // Frontend Develop 
  'https://frontend-develop-yqgrkr-0246e7-168-232-167-73.traefik.me',
  
  // Variables de entorno dinámicas
  process.env.FRONTEND_URL,
  process.env.FRONTEND_MAIN_URL,
  process.env.FRONTEND_DEVELOP_URL
].filter(Boolean) as string[];

console.log('🌐 CORS configurado para orígenes:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Request from origin:', origin);
    
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) {
      console.log('✅ CORS: Permitiendo request sin origin');
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista permitida exacta
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin permitido (lista exacta):', origin);
      return callback(null, true);
    }
    
    // Para desarrollo, permitir localhost con cualquier puerto
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      console.log('✅ CORS: Permitiendo localhost para desarrollo:', origin);
      return callback(null, true);
    }
    
    // Permitir cualquier subdominio de traefik.me (para producción/staging flexibles)
    if (origin.includes('traefik.me')) {
      console.log('✅ CORS: Permitiendo traefik.me subdomain:', origin);
      return callback(null, true);
    }
    
    // Permitir dominios de Dokploy (formato típico)
    if (origin.includes('168.232.167.73') || origin.includes('dokploy')) {
      console.log('✅ CORS: Permitiendo dominio Dokploy:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS: Origin NO permitido:', origin);
    console.log('📋 Origins permitidos explícitos:', allowedOrigins);
    console.log('📋 Patrones permitidos: localhost:*, *.traefik.me, *168.232.167.73*');
    
    const corsError = new Error(`CORS policy: Origin ${origin} is not allowed`);
    return callback(corsError);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
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
      admin: '/api/super_admin',
      usuarios: '/api/usuarios',
      reservas: '/api/reservas',
      resenas: '/api/resenas',
      notificaciones: '/api/notificaciones',
      favoritos: '/api/favoritos',
      bloqueos: '/api/bloqueos',
      uploads: '/api/uploads',
      super_admin: '/api/super_admin'
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

// Rutas de disponibilidad
app.use('/api/disponibilidad', disponibilidadRoutes);

// Rutas de pricing
app.use('/api/pricing', pricingRoutes);

// Rutas de pagos
app.use('/api/pagos', pagosRoutes);

// ============================================
// Rutas de reservas (NUEVA IMPLEMENTACIÓN LIMPIA)
// ============================================
console.log('🆕 Montando rutas de reservas (NUEVA IMPLEMENTACIÓN)...');
app.use('/api/v1/reservas', reservasRoutesNew);

// ============================================
// Rutas de reservas LEGACY (para admin)
// ============================================
console.log('📦 Montando rutas de reservas LEGACY (para admin)...');
app.use('/api/reservas', reservasRoutes);

// Rutas de reseñas
app.use('/api/resenas', resenasRoutes);

// Rutas de uploads
app.use('/api/uploads', uploadsRoutes);

// Rutas de canchas
app.use('/api/canchas', canchasRoutes);
// Rutas públicas/privadas relacionadas con imágenes de canchas
app.use('/api/canchas', canchaImagesRoutes);

// Rutas de complejos
app.use('/api/complejos', complejosRoutes);

// Rutas de administración (legacy)
app.use('/api/super_admin', superAdminRoutes);

// Ruta de prueba para debugging
app.get('/api/super_admin/test', (req, res) => {
  res.json({
    ok: true,
    message: 'SuperAdmin endpoint funcionando',
    timestamp: new Date().toISOString(),
    headers: {
      authorization: req.headers.authorization ? `Bearer ${req.headers.authorization.substring(7, 27)}...` : 'No token'
    }
  });
});

// Middleware de debug para ver todas las rutas y headers CORS
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  if (origin) {
    console.log(`  🌐 Origin: ${origin}`);
  }
  if (referer) {
    console.log(`  🔗 Referer: ${referer}`);
  }
  
  // Loggear headers importantes para CORS
  if (req.method === 'OPTIONS') {
    console.log(`  ✋ PREFLIGHT REQUEST - Origin: ${origin}`);
  }
  
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
      super_admin: '/api/super_admin/*',
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
    { name: "auth", url: "/auth/status" },
    { name: "admin", url: "/admin/status" },
    { name: "usuarios", url: "/usuarios/status" },
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
  console.log(`   - GET  /api/super_admin/users`);
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
