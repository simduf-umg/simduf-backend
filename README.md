# SIMDUF API

## Descripción General

SIMDUF es un sistema modular desarrollado con NestJS.

## Características Principales

- **Gestión de Personas**: Sistema completo CRUD para información personal
- **Gestión de Usuarios**: Registro, autenticación y administración de usuarios
- **Control de Roles**: Sistema de permisos basado en roles
- **Seguridad**: Autenticación JWT y encriptación de contraseñas con bcrypt
- **Validación**: Sistema completo de validación de datos
- **Documentación**: API completamente documentada con Swagger/OpenAPI
- **Testing**: Pruebas e2e automatizadas para todos los endpoints

## Arquitectura

El proyecto sigue una arquitectura modular por capas:

```plaintext
+----------------+      +-----------------+     +---------------+
|  CONTROLLERS   |----->|    SERVICES     |---->| REPOSITORIES  |
| (API Endpoints)|      | (Business Logic)|     | (Data Access) |
+----------------+      +-----------------+     +---------------+
        |                      |                       |
        |                      |                       |
        v                      v                       v
   +----------+           +---------+            +------------+
   |   DTOs   |           | ENTITIES |           |  DATABASE  |
   | (Input/  |           | (Domain  |           | (PostgreSQL|
   |  Output) |           |  Model)  |           |   Tables)  |
   +----------+           +---------+            +------------+
```
  
Cada módulo está organizado en capas:

- **Controllers**: Manejo de peticiones HTTP
- **Services**: Lógica de negocio
- **Entities**: Entidades de base de datos (TypeORM)
- **DTOs**: Objetos de transferencia de datos
- **Guards**: Protección de rutas

