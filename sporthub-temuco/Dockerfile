# Dockerfile para Next.js - DESARROLLO ÚNICAMENTE
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# 🔥 INSTALAR TODAS LAS DEPENDENCIAS (incluyendo devDependencies)
RUN npm ci --silent

# Copiar el código fuente
COPY . .

# 🔥 CONFIGURACIÓN PARA DESARROLLO
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Variables de entorno para desarrollo
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

EXPOSE 3000

# 🔥 USAR COMANDO DE DESARROLLO
CMD ["npm", "run", "dev"]