# MULTI-STAGE BUILD para optimización
FROM node:18-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copia el código fuente
COPY src/ ./src/

# Compila TypeScript a JavaScript
RUN npm run build

# STAGE FINAL - Runtime
FROM node:18-alpine AS runtime

# Instalar herramientas necesarias
RUN apk add --no-cache curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

WORKDIR /app

# Copia archivos de configuración
COPY package*.json ./

# Instala solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copia el código compilado del stage builder
COPY --from=builder /app/dist ./dist

# Cambiar ownership al usuario no-root
RUN chown -R backend:nodejs /app
USER backend

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Exponer el puerto
EXPOSE 4000

# Healthcheck para verificar que el servicio esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Comando para producción (usando el código compilado)
CMD ["node", "dist/index.js"]