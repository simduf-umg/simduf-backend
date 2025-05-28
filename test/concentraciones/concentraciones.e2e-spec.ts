import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Concentraciones (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idConcentracion: number;

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

  it('debería crear una nueva concentración', async () => {
    const datosCrearConcentracion = {
      valor: '500',
      unidad_medida: 'mg',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/concentraciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearConcentracion)
      .expect(201);
    
    expect(respuesta.body.valor).toEqual(datosCrearConcentracion.valor);
    expect(respuesta.body.unidad_medida).toEqual(datosCrearConcentracion.unidad_medida);
    expect(respuesta.body.id_concentracion).toBeDefined();
    
    idConcentracion = respuesta.body.id_concentracion;
  });

  it('debería obtener todas las concentraciones', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/concentraciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener una concentración por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/concentraciones/${idConcentracion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_concentracion).toEqual(idConcentracion);
    expect(respuesta.body.valor).toBeDefined();
    expect(respuesta.body.unidad_medida).toBeDefined();
  });

  it('debería actualizar una concentración', async () => {
    const datosActualizarConcentracion = {
      valor: '250',
      unidad_medida: 'ml',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/concentraciones/${idConcentracion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarConcentracion)
      .expect(200);
    
    expect(respuesta.body.valor).toEqual(datosActualizarConcentracion.valor);
    expect(respuesta.body.unidad_medida).toEqual(datosActualizarConcentracion.unidad_medida);
  });

  it('debería eliminar una concentración', async () => {
    await request(app.getHttpServer())
      .delete(`/concentraciones/${idConcentracion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que la concentración ha sido eliminada
    await request(app.getHttpServer())
      .get(`/concentraciones/${idConcentracion}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosConcentracionInvalidos = {
      valor: '',
      unidad_medida: '',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/concentraciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosConcentracionInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});