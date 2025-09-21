src/
  interfaces/
    normalizers/
      usuarioNormalizer.ts
      reservaNormalizer.ts
      resenaNormalizer.ts
      notificacionNormalizer.ts
      favoritoNormalizer.ts
    controllers/
      usuarioController.ts
      reservaController.ts
      resenaController.ts
      notificacionController.ts
      favoritoController.ts
    routes/
      usuarioRoutes.ts
      reservaRoutes.ts
      resenaRoutes.ts
      notificacionRoutes.ts
      favoritoRoutes.ts


FUNCIÓN:
Cada archivo en normalizers/ contiene una función que recibe los datos crudos y retorna el objeto normalizado.
Los controladores usan estos normalizadores antes de enviar la respuesta al frontend.
Las rutas llaman a los controladores.

Por qué en interfaces?

Responsabilidad:
La capa interfaces es para los adaptadores entre el mundo externo (API, frontend, etc.) y tu aplicación. Aquí se transforman los datos para que sean útiles y seguros para el frontend.

Separación de capas:
El backend tiene capas bien definidas:
domain: Lógica de negocio y entidades puras.
application: Orquestación de casos de uso.
infrastructure: Implementaciones técnicas (DB, APIs externas).
interfaces: Adaptadores, controladores, rutas, DTOs, normalizadores.
Flexibilidad:
Si cambias la forma en que el frontend necesita los datos, solo modificas los normalizadores en interfaces, sin tocar la lógica de negocio.