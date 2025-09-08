
-- =============================================================
--  SportHubTemuco - 03_datos_iniciales.sql
--  Semillas mínimas para probar web+móvil en local o Docker.
--  Requiere que ya se haya ejecutado el schema completo.
-- =============================================================

BEGIN;

-- Asegura extensiones usadas para hashing y geo (no falla si ya existen)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- -------------------------------------------------------------
-- Comunas base (ajusta según tu región)
-- -------------------------------------------------------------
INSERT INTO comunas (nombre) VALUES
('Temuco'),
('Padre Las Casas'),
('Lautaro'),
('Villarrica')
ON CONFLICT (nombre) DO NOTHING;

-- -------------------------------------------------------------
-- Usuarios base (superadmin, admin, dueño, usuario)
-- Contraseñas hash con bcrypt vía pgcrypto (cámbialas luego)
-- -------------------------------------------------------------
WITH su AS (
  INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol, verificado)
  VALUES (
    'Root', 'System', 'root@sporthub.temuco',
    crypt('Cambiar.123', gen_salt('bf',12)), 'superadmin', TRUE
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id_usuario
),
ad AS (
  INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol, verificado)
  VALUES (
    'Admin', 'Global', 'admin@sporthub.temuco',
    crypt('Cambiar.123', gen_salt('bf',12)), 'admin', TRUE
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id_usuario
),
du AS (
  INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol, verificado)
  VALUES (
    'Dueño', 'Ñielol', 'dueno@playtemuco.cl',
    crypt('Dueno.123', gen_salt('bf',12)), 'dueno', TRUE
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id_usuario
),
us AS (
  INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol, verificado)
  VALUES (
    'Usuaria', 'Prueba', 'user@playtemuco.cl',
    crypt('Usuario.123', gen_salt('bf',12)), 'usuario', TRUE
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id_usuario
)
SELECT 1;

-- Captura IDs (si ya existían, los rescatamos por email)
WITH ids AS (
  SELECT
    (SELECT id_usuario FROM usuarios WHERE email='dueno@playtemuco.cl')  AS id_dueno,
    (SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl')   AS id_usuario,
    (SELECT id_comuna  FROM comunas  WHERE nombre='Temuco')              AS id_comuna_temuco
)
-- -------------------------------------------------------------
-- Complejo de prueba (Temuco) + servicios + fotos
-- -------------------------------------------------------------
, comp AS (
  INSERT INTO complejos (id_dueno, nombre, descripcion, direccion, id_comuna, latitud, longitud, loc, activo)
  SELECT id_dueno,
         'Complejo Ñielol',
         'Complejo con canchas sintéticas y estacionamiento.',
         'Av. Alemania 1000, Temuco',
         id_comuna_temuco,
         -38.739650, -72.598420,
         ST_SetSRID(ST_MakePoint(-72.598420, -38.739650),4326)::geography,
         TRUE
  FROM ids
  RETURNING id_complejo
),
svc AS (
  INSERT INTO complejo_servicios (id_complejo, id_servicio)
  SELECT (SELECT id_complejo FROM comp),
         s.id_servicio
  FROM servicios s
  WHERE s.nombre IN ('Estacionamiento','Iluminación','Camarines')
  ON CONFLICT DO NOTHING
  RETURNING id_complejo
),
fcomp AS (
  INSERT INTO fotos_complejo (id_complejo, url_foto, orden)
  VALUES
    ((SELECT id_complejo FROM comp), 'https://picsum.photos/id/1011/1200/800', 1),
    ((SELECT id_complejo FROM comp), 'https://picsum.photos/id/1015/1200/800', 2)
  ON CONFLICT DO NOTHING
  RETURNING id_foto
)
SELECT 1;

-- -------------------------------------------------------------
-- Cancha de prueba + fotos
-- -------------------------------------------------------------
WITH ids AS (
  SELECT
    (SELECT id_complejo FROM complejos WHERE nombre='Complejo Ñielol' LIMIT 1) AS id_complejo,
    (SELECT id_deporte FROM deportes WHERE nombre='futbolito' LIMIT 1)         AS id_deporte
)
, c AS (
  INSERT INTO canchas (id_complejo, nombre, id_deporte, cubierta, activo)
  SELECT id_complejo, 'Cancha 1 Ñielol', id_deporte, FALSE, TRUE FROM ids
  RETURNING id_cancha
),
fcan AS (
  INSERT INTO fotos_cancha (id_cancha, url_foto, orden)
  VALUES
    ((SELECT id_cancha FROM c), 'https://picsum.photos/id/1041/1200/800', 1)
  ON CONFLICT DO NOTHING
  RETURNING id_foto
)
SELECT 1;

-- -------------------------------------------------------------
-- Horario general del complejo (todos los días 08:00-23:00)
-- -------------------------------------------------------------
WITH comp AS (
  SELECT id_complejo FROM complejos WHERE nombre='Complejo Ñielol' LIMIT 1
)
INSERT INTO horarios_atencion (id_complejo, id_cancha, dia, hora_apertura, hora_cierre)
SELECT id_complejo, NULL, d::dia_semana, '08:00', '23:00'
FROM comp, unnest(ARRAY['lunes','martes','miercoles','jueves','viernes','sabado','domingo']) AS d
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Reglas de precio (dos franjas para todos los días)
WITH c AS (
  SELECT id_cancha FROM canchas WHERE nombre='Cancha 1 Ñielol' LIMIT 1
)
INSERT INTO reglas_precio (id_cancha, dia, hora_inicio, hora_fin, precio_por_hora)
SELECT id_cancha, CAST(NULL AS dia_semana), TIME '08:00', TIME '18:00', 10000 FROM c
UNION ALL
SELECT id_cancha, CAST(NULL AS dia_semana), TIME '18:00', TIME '23:00', 12000 FROM c
ON CONFLICT DO NOTHING;


-- -------------------------------------------------------------
-- Promoción del 20% para la cancha
-- -------------------------------------------------------------
WITH c AS (SELECT id_cancha FROM canchas WHERE nombre='Cancha 1 Ñielol' LIMIT 1)
INSERT INTO promociones (id_complejo, id_cancha, titulo, descripcion, tipo, valor, estado, vigente_desde, vigente_hasta)
SELECT NULL, id_cancha, 'Promo tarde', '20% de descuento de 18 a 20 hrs', 'porcentaje', 20, 'activa', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days' FROM c
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Reserva de ejemplo para el usuario
-- -------------------------------------------------------------
WITH u AS (
  SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl' LIMIT 1
),
c AS (
  SELECT id_cancha FROM canchas WHERE nombre='Cancha 1 Ñielol' LIMIT 1
)
INSERT INTO reservas (id_cancha, id_usuario, inicio, fin, estado, precio_total, notas)
SELECT c.id_cancha, u.id_usuario, 
       (CURRENT_DATE + INTERVAL '3 days')::timestamptz + TIME '19:00',
       (CURRENT_DATE + INTERVAL '3 days')::timestamptz + TIME '20:00',
       'confirmada', 12000, 'Reserva de prueba'
FROM u, c
RETURNING id_reserva;

-- -------------------------------------------------------------
-- Pago asociado a la reserva (simulado pagado)
-- -------------------------------------------------------------
WITH r AS (
  SELECT id_reserva FROM reservas ORDER BY id_reserva DESC LIMIT 1
)
INSERT INTO pagos (id_reserva, proveedor, id_externo, moneda, monto, estado, metadata)
SELECT id_reserva, 'mercadopago', 'test-123', 'CLP', 12000, 'pagado', '{"modo":"sandbox"}'::jsonb FROM r;

-- -------------------------------------------------------------
-- Notificación y reseña de ejemplo
-- -------------------------------------------------------------
WITH u AS (SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl' LIMIT 1),
     co AS (SELECT id_complejo FROM complejos WHERE nombre='Complejo Ñielol' LIMIT 1)
INSERT INTO notificaciones (id_destinatario, titulo, cuerpo)
SELECT u.id_usuario, '¡Reserva confirmada!', 'Tu reserva ha sido confirmada. ¡Nos vemos en cancha!' FROM u
ON CONFLICT DO NOTHING;

WITH u AS (SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl' LIMIT 1),
     co AS (SELECT id_complejo FROM complejos WHERE nombre='Complejo Ñielol' LIMIT 1)
INSERT INTO resenas (id_usuario, id_complejo, puntuacion, comentario)
SELECT u.id_usuario, co.id_complejo, 5, 'Excelente cancha y atención.' FROM u, co
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- Grupo, miembro y favorito de ejemplo
-- -------------------------------------------------------------
WITH u AS (SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl' LIMIT 1)
INSERT INTO grupos (id_creador, nombre, descripcion, privacidad, cupos)
SELECT id_usuario, 'Equipo Ñielol', 'Grupo para armar pichangas los viernes.', 'publico', 20 FROM u
RETURNING id_grupo;

WITH g AS (SELECT id_grupo FROM grupos WHERE nombre='Equipo Ñielol' LIMIT 1),
     u AS (SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl' LIMIT 1)
INSERT INTO grupo_miembros (id_grupo, id_usuario, rol, estado)
SELECT g.id_grupo, u.id_usuario, 'admin', 'aceptado' FROM g, u
ON CONFLICT DO NOTHING;

WITH u AS (SELECT id_usuario FROM usuarios WHERE email='user@playtemuco.cl' LIMIT 1),
     c AS (SELECT id_cancha FROM canchas WHERE nombre='Cancha 1 Ñielol' LIMIT 1)
INSERT INTO favoritos (id_usuario, id_cancha)
SELECT u.id_usuario, c.id_cancha FROM u, c
ON CONFLICT DO NOTHING;

COMMIT;
