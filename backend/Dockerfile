# Dockerfile para desarrollo con ts-node
FROM node:18-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno por defecto  
ENV NODE_ENV=development
ENV PORT=4000

# Exponer el puerto
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Para desarrollo, usar ts-node directamente
CMD ["npm", "run", "dev"]