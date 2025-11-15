# Guía rápida: Subida y obtención de imágenes (Cloudflare R2)

## ¿Para qué sirve?
Permite subir imágenes (canchas, perfil, superadmin) desde el frontend al backend, que las procesa y almacena en Cloudflare R2. Luego puedes pedirlas por endpoint para mostrarlas en la app.

## Subir imagen desde el frontend (ejemplo básico)
```js
const formData = new FormData();
formData.append('image', archivoInput.files[0]);

const res = await fetch('/api/superadmin/image/upload', {
  method: 'POST',
  body: formData
});
const data = await res.json();
if (data.ok) {
  alert('Imagen subida. ID: ' + data.id);
}
```
- El input debe tener `name="image"`.
- El endpoint acepta archivos de hasta 50MB.

## Mostrar imagen subida
```js
// Si el backend responde { ok: true, id, filename }
const url = `/api/superadmin/image/${data.filename}`;
imgElement.src = url;
```

## Endpoints útiles
- `POST /api/superadmin/image/upload` — Sube imagen de perfil superadmin
- `GET /api/superadmin/image/:filename` — Obtiene la imagen (stream desde Cloudflare)

## Notas
- Si usas autenticación, agrega el header `Authorization` en el fetch.
- Si el frontend está en otro dominio, asegúrate de que CORS esté bien configurado en el backend.
- Para canchas o perfil de usuario, cambia la ruta por la correspondiente (`/api/canchas/...`, `/api/usuario/...`)

---
Cualquier duda, revisa los controladores en `backend/src/superAdmin/presentation/controllers/` o pregunta al equipo backend.
