# Módulo de Uploads

Este módulo maneja la gestión completa de archivos subidos al sistema, incluyendo imágenes, documentos y videos. Proporciona funcionalidades de procesamiento, validación, almacenamiento y organización de archivos.

## Arquitectura

```
uploads/
├── domain/                    # Capa de dominio
│   └── UploadRepository.ts    # Interface del repositorio
├── application/              # Casos de uso
│   └── UploadsUseCases.ts    # CRUD y operaciones de uploads
├── infrastructure/           # Capa de infraestructura
│   ├── UploadApiRepository.ts # Implementación con FastAPI
│   └── mappers.ts           # Mapeo entre entidades
└── presentation/            # Capa de presentación
    ├── controllers/         # Controladores HTTP
    └── routes/             # Definición de rutas (con multer)
```

## Funcionalidades

### Gestión de Archivos
- **Upload de archivos**: Subida con validaciones de seguridad
- **Procesamiento automático**: Thumbnails y compresión de imágenes
- **Gestión de metadatos**: Información detallada de archivos
- **Categorización**: Organización por tipo de uso
- **Detección de duplicados**: Prevención mediante hashing
- **Limpieza automática**: Eliminación de archivos expirados
- **Estadísticas**: Análisis de uso y almacenamiento
- **Asociación con entidades**: Vinculación con canchas, complejos, etc.

## Entidades del Dominio

### Upload
```typescript
interface Upload {
  id: number;
  nombreOriginal: string;
  nombreArchivo: string; // Nombre único generado
  mimeType: string;
  tamano: number; // Bytes
  tipo: TipoArchivo;
  categoria: CategoriaUpload;
  estado: EstadoUpload;
  url: string;
  thumbnailUrl?: string;
  usuarioId: number;
  entidadId?: number; // ID de entidad asociada
  tipoEntidad?: string; // Tipo de entidad
  altText?: string; // Para accesibilidad
  hashArchivo?: string; // Para detectar duplicados
  metadatos?: any; // Información adicional
  fechaSubida: Date;
  fechaActualizacion: Date;
  fechaExpiracion?: Date;
  // Información desnormalizada
  usuario?: { /* datos del usuario */ };
}
```

### Tipos de Archivos
- **imagen**: JPG, PNG, WebP, GIF
- **documento**: PDF, DOC, DOCX
- **video**: MP4, AVI, MOV
- **audio**: MP3, WAV, OGG

### Categorías de Upload
- **avatar**: Imágenes de perfil de usuarios
- **cancha**: Fotos de canchas deportivas
- **complejo**: Imágenes de complejos deportivos
- **reserva**: Documentos relacionados con reservas
- **verificacion**: Documentos de verificación
- **general**: Archivos de propósito general

### Estados de Procesamiento
- **subiendo**: Archivo en proceso de subida
- **procesando**: Generando thumbnails/procesando
- **completado**: Archivo listo para uso
- **error**: Error en el procesamiento
- **eliminado**: Archivo marcado para eliminación

## Endpoints API

### Endpoints Públicos
```
GET    /uploads/entidad/:tipo/:id     # Uploads de una entidad
GET    /uploads/:id                   # Obtener upload específico
```

### Endpoints de Usuario (requieren autenticación)
```
POST   /uploads                       # Subir nuevo archivo
GET    /uploads/usuario/:usuarioId    # Uploads de un usuario
PATCH  /uploads/:id                   # Actualizar metadatos
DELETE /uploads/:id                   # Eliminar archivo
POST   /uploads/:id/processed         # Marcar como procesado
```

### Endpoints Administrativos (requieren rol admin/superadmin)
```
GET    /uploads                       # Listar todos los uploads
GET    /uploads/stats                 # Estadísticas de uso
POST   /uploads/cleanup               # Limpiar archivos expirados
```

## Autorización

### Permisos por Rol
- **Público**: Leer uploads de entidades públicas
- **Usuario**: Subir y gestionar sus propios archivos
- **Dueño**: Gestionar uploads de sus entidades
- **Admin/Superadmin**: Gestión completa y estadísticas

### Políticas de Seguridad
- Solo el propietario puede eliminar sus uploads
- Admins pueden gestionar cualquier upload
- Validación de asociación usuario-entidad
- Rate limiting para prevenir spam

---

Para más información sobre la arquitectura general, consulta el README principal en `/src`.
