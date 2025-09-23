# Dockerfile para Next.js
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .

# Build sin lint check
ENV NEXT_TELEMETRY_DISABLED=1
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build

# Producción
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
