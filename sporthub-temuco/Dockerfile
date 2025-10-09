# Dockerfile para Next.js
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .

# Build sin lint check
ENV NEXT_TELEMETRY_DISABLED=1
ENV DISABLE_ESLINT_PLUGIN=true
# Variable de entorno para la URL del backend en producción
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# Producción
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
