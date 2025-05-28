import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Presentaciones (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idPresentacion: number;

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
    const respuestaLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        contrasena: 'Admin123!',
      });
    
    tokenJWT = respuestaLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear una nueva presentación', async () => {
    const datosCrearPresentacion = {
      nombre: 'Tabletas',
      descripcion: 'Pastillas sólidas',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/presentaciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearPresentacion)
      .expect(201);
    
    expect(respuesta.body.nombre).toEqual(datosCrearPresentacion.nombre);
    expect(respuesta.body.descripcion).toEqual(datosCrearPresentacion.descripcion);
    expect(respuesta.body.id_presentacion).toBeDefined();
    
    idPresentacion = respuesta.body.id_presentacion;
  });

  it('debería obtener todas las presentaciones', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/presentaciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener una presentación por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/presentaciones/${idPresentacion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_presentacion).toEqual(idPresentacion);
    expect(respuesta.body.nombre).toBeDefined();
  });

  it('debería actualizar una presentación', async () => {
    const datosActualizarPresentacion = {
      nombre: 'Cápsulas',
      descripcion: 'Cápsulas gelatinosas',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/presentaciones/${idPresentacion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarPresentacion)
      .expect(200);
    
    expect(respuesta.body.nombre).toEqual(datosActualizarPresentacion.nombre);
    expect(respuesta.body.descripcion).toEqual(datosActualizarPresentacion.descripcion);
  });

  it('debería eliminar una presentación', async () => {
    await request(app.getHttpServer())
      .delete(`/presentaciones/${idPresentacion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que la presentación ha sido eliminada
    await request(app.getHttpServer())
      .get(`/presentaciones/${idPresentacion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosPresentacionInvalidos = {
      nombre: '',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/presentaciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosPresentacionInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});