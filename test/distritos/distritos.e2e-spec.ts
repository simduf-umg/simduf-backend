import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Distritos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idDistrito: number;
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

    // Crear un municipio para las pruebas
    const respuestaMunicipio = await request(app.getHttpServer())
      .post('/municipios')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Municipio Prueba',
        id_departamento: idDepartamento,
      });
    
    idMunicipio = respuestaMunicipio.body.id_municipio;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo distrito', async () => {
    const datosCrearDistrito = {
      nombre: 'Distrito Prueba',
      id_municipio: idMunicipio,
    };

    const respuesta = await request(app.getHttpServer())
      .post('/distritos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearDistrito)
      .expect(201);
    
    expect(respuesta.body.nombre).toEqual(datosCrearDistrito.nombre);
    expect(respuesta.body.id_municipio).toEqual(datosCrearDistrito.id_municipio);
    expect(respuesta.body.id_distrito).toBeDefined();
    
    idDistrito = respuesta.body.id_distrito;
  });

  it('debería obtener todos los distritos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/distritos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un distrito por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/distritos/${idDistrito}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_distrito).toEqual(idDistrito);
    expect(respuesta.body.nombre).toBeDefined();
    expect(respuesta.body.municipio).toBeDefined();
  });

  it('debería obtener distritos por municipio', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/distritos/municipio/${idMunicipio}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería actualizar un distrito', async () => {
    const datosActualizarDistrito = {
      nombre: 'Distrito Actualizado',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/distritos/${idDistrito}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarDistrito)
      .expect(200);
    
    expect(respuesta.body.nombre).toEqual(datosActualizarDistrito.nombre);
  });

  it('debería fallar con 404 al obtener un distrito inexistente', async () => {
    await request(app.getHttpServer())
      .get('/distritos/9999')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería eliminar un distrito', async () => {
    await request(app.getHttpServer())
      .delete(`/distritos/${idDistrito}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el distrito ha sido eliminado
    await request(app.getHttpServer())
      .get(`/distritos/${idDistrito}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos de distrito inválidos', async () => {
    const datosDistritoInvalidos = {
      nombre: '',
      id_municipio: 'no-es-numero',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/distritos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosDistritoInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});