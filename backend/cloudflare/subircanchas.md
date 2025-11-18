# Cloudflare — Guía rápida para frontend (imágenes de canchas)

Resumen breve
- Flujo típico (recomendado): el frontend sube la imagen (multipart) al BFF, el BFF procesa y sube a Cloudflare R2 y luego registra la entrada en la API (FastAPI).
- Si el BFF no hace el registro automático, el flujo es 2 pasos: 1) subir imagen -> recibir `{ id, filename }`; 2) POST a `/api/canchas/:id/fotos` con el `filename`/`url` para persistir la foto.

Subida (ejemplo mínimo usando fetch)
```js
// FormData -> POST multipart a un endpoint del BFF que acepte `image`
const file = document.querySelector('input[type=file]').files[0];
const fd = new FormData();
fd.append('image', file);

const res = await fetch('/api/canchas/123/fotos/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token // si requiere auth
  },
  body: fd
});
const data = await res.json();
// data => { ok: true, id, filename }
```

Registrar metadata en FastAPI (si el BFF no lo hizo automáticamente)
```js
await fetch('/api/canchas/123/fotos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ url: data.filename, descripcion: 'Foto cancha', orden: 1 })
});
```

Obtener la imagen desde frontend
- Para mostrar la lista de fotos: GET `/api/canchas/123/fotos` (retorna metadata desde FastAPI).
- Para obtener el archivo binario puede usarse el servicio local `pedircanchas` si está desplegado (ej. `/cloudflare/pedirCanchas/image/:uuid`) o una URL pública directa si R2 está expuesto.

Puntos importantes
- Endpoints protegidos: añadir `Authorization: Bearer <token>` cuando el endpoint lo requiera (admin/owner).
- Tipos de archivo permitidos: imágenes (jpeg, png, webp, gif). Tamaño máximo según backend (p. ej. 50MB).
- Variables de entorno (backend): `URL3_Subida_Canchas`, `ID_Subida_Canchas`, `Clave_Subida_Canchas`, `BUCKET_Subida_Canchas`, `FASTAPI_URL`.
- CORS: el frontend debe estar en la lista de orígenes permitidos o usar proxy del BFF.

Si quieres, puedo añadir un pequeño ejemplo de componente React/Next que implemente esto paso a paso.

---
Archivo creado por el equipo backend — mantén esto corto y prueba primero en entorno local.
