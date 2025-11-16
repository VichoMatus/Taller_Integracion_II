# Guía de integración Cloudflare R2 - Fotos de Perfil

Este backend permite subir y solicitar imágenes de perfil para usuarios normales y dueños/admins, almacenando los archivos en Cloudflare R2. Aquí se explica cómo consumir estos endpoints desde el frontend.

## Subir imagen de perfil

- **Endpoint:** `POST /api/media/perfil-image`
- **Tipo de contenido:** `multipart/form-data`
- **Campo:** `image`
- **Respuesta exitosa:**
  ```json
  {
    "filename": "uuid.webp",
    "url": "https://.../imgperfil/uuid.webp"
  }
  ```

### Ejemplo en React/Next.js
```js
const formData = new FormData();
formData.append('image', archivoImagen); // archivoImagen es un File

const response = await fetch('/api/media/perfil-image', {
  method: 'POST',
  body: formData
});
const data = await response.json();
if (data.url) {
  setImagenPerfil(data.url); // Mostrar la imagen subida
}
```

## Solicitar imagen de perfil

- **Endpoint:** `GET /api/media/perfil-image/:uuid`
- **Respuesta:** Devuelve la imagen webp directamente (útil para usar en `<img src=... />`)

### Ejemplo de uso en frontend
```js
const url = `/api/media/perfil-image/${uuid}`;
// Usar en un tag <img src={url} />
```

## Notas
- El backend procesa la imagen: la redimensiona, la convierte a webp y le asigna un nombre único.
- El frontend solo debe enviar la imagen y guardar la URL/uuid retornada.
- El mismo endpoint sirve para usuarios normales y dueños/admins.
- Las credenciales y bucket usados están definidos en el archivo `.env`.
