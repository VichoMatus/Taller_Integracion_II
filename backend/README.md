backend/
├── src/
│   ├── domain/         # Lógica de negocio, entidades, interfaces, casos de uso
│   ├── application/    # Servicios de aplicación, orquestación de casos de uso
│   ├── infrastructure/ # Implementaciones concretas (DB, APIs, frameworks)
│   ├── interfaces/     # Adaptadores: controladores, rutas, DTOs
│   └── config/         # Configuración de la app (env, settings)
├── tests/              # Pruebas unitarias y de integración
└──  package.json        # Dependencias y scripts




La arquitectura limpia en el backend busca separar claramente las responsabilidades del sistema, organizando el código en capas independientes como dominio, aplicación, infraestructura e interfaces. Esto permite que la lógica de negocio permanezca aislada de detalles técnicos y frameworks, facilitando la mantenibilidad, escalabilidad y testeo del proyecto. Así, los cambios en la base de datos, frameworks o adaptadores no afectan el núcleo de la aplicación, promoviendo un desarrollo más robusto y flexible.


