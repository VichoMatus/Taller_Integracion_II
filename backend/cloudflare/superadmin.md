# Subida de foto de perfil SuperAdmin a Cloudflare R2

## Resumen
Este backend expone un endpoint para que el frontend pueda subir la foto de perfil del superadmin. El backend procesa la imagen (reduce tamaño, convierte a webp, asigna nombre único) y la sube a Cloudflare R2. Luego retorna el nombre y la URL de la imagen.

## Endpoint

- **URL:** `/api/super_admin/profile-image`
- **Método:** `POST`
- **Autenticación:** (Recomendado) Enviar JWT en header Authorization
- **Tipo de contenido:** `multipart/form-data`
- **Campo de imagen:** `image`

## Ejemplo de uso en frontend (React/Next.js)

```js
const formData = new FormData();
formData.append('image', archivoImagen); // archivoImagen es un File (input type="file")

const response = await fetch('/api/super_admin/profile-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}` // si requiere autenticación
  },
  body: formData
});

const data = await response.json();
if (data.filename && data.url) {
  // Mostrar imagen subida
  setImagenPerfil(data.url);
}
```

## Respuestas posibles
- **200 OK**: `{ filename: "uuid.webp", url: "https://.../bucket/uuid.webp" }`
- **400**: `{ error: "No se envió ninguna imagen." }`
- **500**: `{ error: "Mensaje de error interno" }`

## Notas
- El backend se encarga de procesar y optimizar la imagen, el frontend solo debe enviarla.
- Se recomienda proteger el endpoint con autenticación.
- El campo del formulario debe llamarse `image`.
- El backend retorna la URL lista para usar en `<img src=... />`.
