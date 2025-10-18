# Dockerfile para Next.js - Optimizado
FROM node:20-alpine AS base

# Instalar dependencias primero (mejor cache)
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --silent && npm cache clean --force

# Luego copiar código fuente
COPY . .

# Build optimizado
ENV NEXT_TELEMETRY_DISABLED=1
ENV DISABLE_ESLINT_PLUGIN=true
ENV NODE_ENV=production

# Variables de entorno para build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

RUN npm run build

# Producción
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
