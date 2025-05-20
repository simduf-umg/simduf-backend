import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesService } from './modules/roles/services/roles.service';
import { PersonasService } from './modules/personas/services/personas.service';
import { UsuariosService } from './modules/usuarios/services/usuarios.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Iniciando proceso de semilla de datos...');

    // Servicios
    const rolesService = app.get(RolesService);
    const personasService = app.get(PersonasService);
    const usuariosService = app.get(UsuariosService);

    // Crear roles
    console.log('Creando roles...');
    const adminRol = await rolesService.create({ nombre_rol: 'ADMIN' });
    const userRol = await rolesService.create({ nombre_rol: 'USER' });
    console.log(`Roles creados: ${adminRol.nombre_rol}, ${userRol.nombre_rol}`);

    // Crear persona admin
    console.log('Creando persona admin...');
    const adminPersona = await personasService.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      fecha_nacimiento: '1990-01-01',
    });
    console.log(`Persona admin creada: ${adminPersona.nombre} ${adminPersona.apellido}`);

    // Crear usuario admin
    console.log('Creando usuario admin...');
    const adminUsuario = await usuariosService.create({
      username: 'admin',
      contrasena: 'Admin123!',
      id_persona: adminPersona.id_persona,
      activo: true,
      rolIds: [adminRol.id_rol],
    });
    console.log(`Usuario admin creado: ${adminUsuario.username}`);

    // Crear persona usuario
    console.log('Creando persona usuario normal...');
    const userPersona = await personasService.create({
      nombre: 'Usuario',
      apellido: 'Normal',
      fecha_nacimiento: '1995-05-15',
    });
    console.log(`Persona usuario creada: ${userPersona.nombre} ${userPersona.apellido}`);

    // Crear usuario normal
    console.log('Creando usuario normal...');
    const usuario = await usuariosService.create({
      username: 'usuario',
      contrasena: 'Usuario123!',
      id_persona: userPersona.id_persona,
      activo: true,
      rolIds: [userRol.id_rol],
    });
    console.log(`Usuario normal creado: ${usuario.username}`);

    console.log('Proceso de semilla completado exitosamente!');

  } catch (error) {
    console.error('Error durante el proceso de semilla:', error);
  } finally {
    await app.close();
  }
}

bootstrap();