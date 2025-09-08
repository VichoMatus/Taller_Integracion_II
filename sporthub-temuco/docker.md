Utilizar DOCKER

1. Construir la imagen Docker 
docker build -t sporthub-temuco .

2. Levantar el entorno con Docker Compose (desarrollo)
docker-compose up

3. Detener los servicios
docker-compose down

4. Acceder al contenedor
docker exec -it <nombre_del_contenedor> sh

Puedes ver el nombre del contenedor con:
docker ps



5. Ejecutar en modo producción
Primero, construye la imagen:
docker build -t sporthub-temuco .

Luego, ejecuta el contenedor:
docker run -p 3000:3000 sporthub-temuco
