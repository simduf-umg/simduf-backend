import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Municipios (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idMunicipio: number;
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
    const respuestaLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        contrasena: 'Admin123!',
      });
    
    tokenJWT = respuestaLogin.body.access_token;

    // Crear un departamento para las pruebas
    const respuestaDepartamento = await request(app.getHttpServer())
      .post('/departamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Departamento Prueba',
      });
    
    idDepartamento = respuestaDepartamento.body.id_departamento;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo municipio', async () => {
    const datosCrearMunicipio = {
      nombre: 'Municipio Prueba',
      id_departamento: idDepartamento,
    };

    const respuesta = await request(app.getHttpServer())
      .post('/municipios')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearMunicipio)
      .expect(201);
    
    expect(respuesta.body.nombre).toEqual(datosCrearMunicipio.nombre);
    expect(respuesta.body.id_departamento).toEqual(datosCrearMunicipio.id_departamento);
    expect(respuesta.body.id_municipio).toBeDefined();
    
    idMunicipio = respuesta.body.id_municipio;
  });

  it('debería obtener todos los municipios', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/municipios')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un municipio por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/municipios/${idMunicipio}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_municipio).toEqual(idMunicipio);
    expect(respuesta.body.nombre).toBeDefined();
    expect(respuesta.body.departamento).toBeDefined();
  });

  it('debería obtener municipios por departamento', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/municipios/departamento/${idDepartamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería actualizar un municipio', async () => {
    const datosActualizarMunicipio = {
      nombre: 'Municipio Actualizado',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/municipios/${idMunicipio}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarMunicipio)
      .expect(200);
    
    expect(respuesta.body.nombre).toEqual(datosActualizarMunicipio.nombre);
  });

  it('debería fallar con 404 al obtener un municipio inexistente', async () => {
    await request(app.getHttpServer())
      .get('/municipios/9999')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería eliminar un municipio', async () => {
    await request(app.getHttpServer())
      .delete(`/municipios/${idMunicipio}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el municipio ha sido eliminado
    await request(app.getHttpServer())
      .get(`/municipios/${idMunicipio}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos de municipio inválidos', async () => {
    const datosMunicipioInvalidos = {
      nombre: '',
      id_departamento: 'no-es-numero',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/municipios')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosMunicipioInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});