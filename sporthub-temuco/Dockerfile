# Dockerfile para Next.js - Multi-stage optimizado
FROM node:20-alpine AS dependencies

# Instalar todas las dependencias para build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent

FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias de la etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules
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

# Producción - solo lo necesario
FROM node:20-alpine AS production
WORKDIR /app

# Instalar solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --only=production --silent && npm cache clean --force

# Copiar build y archivos necesarios
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
