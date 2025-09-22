# Usa una imagen oficial de Node.js como base
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto (ajusta si tu backend usa otro)
EXPOSE 4000

# Comando por defecto para iniciar el backend
CMD ["npm", "run", "dev"]