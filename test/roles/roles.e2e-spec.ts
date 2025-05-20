import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Roles (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idRol: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();

    // Iniciar sesión para obtener token
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        contrasena: 'Admin123!',
      });
    
    tokenJWT = respuesta.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo rol', async () => {
    const datosCrearRol = {
      nombre_rol: 'ROL_PRUEBA',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearRol)
      .expect(201);
    
    expect(respuesta.body.nombre_rol).toEqual(datosCrearRol.nombre_rol);
    expect(respuesta.body.id_rol).toBeDefined();
    
    idRol = respuesta.body.id_rol;
  });

  it('debería obtener todos los roles', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un rol por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/roles/${idRol}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_rol).toEqual(idRol);
    expect(respuesta.body.nombre_rol).toBeDefined();
  });

  it('debería actualizar un rol', async () => {
    const datosActualizarRol = {
      nombre_rol: 'ROL_ACTUALIZADO',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/roles/${idRol}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarRol)
      .expect(200);
    
    expect(respuesta.body.nombre_rol).toEqual(datosActualizarRol.nombre_rol);
  });

  it('debería fallar con 404 al obtener un rol inexistente', async () => {
    await request(app.getHttpServer())
      .get('/roles/9999')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería eliminar un rol', async () => {
    await request(app.getHttpServer())
      .delete(`/roles/${idRol}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el rol ha sido eliminado
    await request(app.getHttpServer())
      .get(`/roles/${idRol}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos de rol inválidos', async () => {
    const datosRolInvalidos = {
      nombre_rol: '',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosRolInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});