import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Personas (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idPersona: number;

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

  it('debería crear una nueva persona', async () => {
    const datosCrearPersona = {
      nombre: 'Prueba',
      apellido: 'Usuario',
      fecha_nacimiento: '1990-01-01',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/personas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearPersona)
      .expect(201);
    
    expect(respuesta.body.nombre).toEqual(datosCrearPersona.nombre);
    expect(respuesta.body.apellido).toEqual(datosCrearPersona.apellido);
    expect(respuesta.body.id_persona).toBeDefined();
    
    idPersona = respuesta.body.id_persona;
  });

  it('debería obtener todas las personas', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/personas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener una persona por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/personas/${idPersona}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_persona).toEqual(idPersona);
    expect(respuesta.body.nombre).toBeDefined();
    expect(respuesta.body.apellido).toBeDefined();
  });

  it('debería actualizar una persona', async () => {
    const datosActualizarPersona = {
      nombre: 'Actualizado',
      apellido: 'Persona',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/personas/${idPersona}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarPersona)
      .expect(200);
    
    expect(respuesta.body.nombre).toEqual(datosActualizarPersona.nombre);
    expect(respuesta.body.apellido).toEqual(datosActualizarPersona.apellido);
  });

  it('debería fallar con 404 al obtener una persona inexistente', async () => {
    await request(app.getHttpServer())
      .get('/personas/9999')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería eliminar una persona', async () => {
    await request(app.getHttpServer())
      .delete(`/personas/${idPersona}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que la persona ha sido eliminada
    await request(app.getHttpServer())
      .get(`/personas/${idPersona}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos de persona inválidos', async () => {
    const datosPersonaInvalidos = {
      nombre: '',
      apellido: '',
      fecha_nacimiento: 'fecha-invalida',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/personas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosPersonaInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});