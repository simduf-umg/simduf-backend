import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Departamentos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idDepartamento: number;

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

  it('debería crear un nuevo departamento', async () => {
    const datosCrearDepartamento = {
      nombre: 'Departamento Prueba',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/departamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearDepartamento)
      .expect(201);
    
    expect(respuesta.body.nombre).toEqual(datosCrearDepartamento.nombre);
    expect(respuesta.body.id_departamento).toBeDefined();
    
    idDepartamento = respuesta.body.id_departamento;
  });

  it('debería obtener todos los departamentos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/departamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un departamento por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/departamentos/${idDepartamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_departamento).toEqual(idDepartamento);
    expect(respuesta.body.nombre).toBeDefined();
  });

  it('debería actualizar un departamento', async () => {
    const datosActualizarDepartamento = {
      nombre: 'Departamento Actualizado',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/departamentos/${idDepartamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarDepartamento)
      .expect(200);
    
    expect(respuesta.body.nombre).toEqual(datosActualizarDepartamento.nombre);
  });

  it('debería fallar con 404 al obtener un departamento inexistente', async () => {
    await request(app.getHttpServer())
      .get('/departamentos/9999')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería eliminar un departamento', async () => {
    await request(app.getHttpServer())
      .delete(`/departamentos/${idDepartamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el departamento ha sido eliminado
    await request(app.getHttpServer())
      .get(`/departamentos/${idDepartamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos de departamento inválidos', async () => {
    const datosDepartamentoInvalidos = {
      nombre: '',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/departamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosDepartamentoInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});