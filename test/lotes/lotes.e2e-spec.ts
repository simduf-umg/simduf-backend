import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Lotes (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idLote: number;
  let idMedicamento: number;
  let idPresentacion: number;
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

    // Crear presentación para las pruebas
    const respuestaPresentacion = await request(app.getHttpServer())
      .post('/presentaciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Tabletas',
        descripcion: 'Pastillas sólidas',
      });
    
    idPresentacion = respuestaPresentacion.body.id_presentacion;

    // Crear concentración para las pruebas
    const respuestaConcentracion = await request(app.getHttpServer())
      .post('/concentraciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        valor: '500',
        unidad_medida: 'mg',
      });
    
    idConcentracion = respuestaConcentracion.body.id_concentracion;

    // Crear medicamento para las pruebas
    const respuestaMedicamento = await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Paracetamol',
        codigo: 'PAR-001',
        id_presentacion: idPresentacion,
        id_concentracion: idConcentracion,
        descripcion: 'Analgésico',
      });
    
    idMedicamento = respuestaMedicamento.body.id_medicamento;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo lote', async () => {
    const datosCrearLote = {
      id_medicamento: idMedicamento,
      numero_lote: 'LOT-2024-001',
      fecha_caducidad: '2025-12-31',
      cantidad_actual: 100,
    };

    const respuesta = await request(app.getHttpServer())
      .post('/lotes')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearLote)
      .expect(201);
    
    expect(respuesta.body.numero_lote).toEqual(datosCrearLote.numero_lote);
    expect(respuesta.body.cantidad_actual).toEqual(datosCrearLote.cantidad_actual);
    expect(respuesta.body.id_lote).toBeDefined();
    
    idLote = respuesta.body.id_lote;
  });

  it('debería obtener todos los lotes', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/lotes')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un lote por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/lotes/${idLote}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_lote).toEqual(idLote);
    expect(respuesta.body.medicamento).toBeDefined();
  });

  it('debería obtener lotes por medicamento', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/lotes/medicamento/${idMedicamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería actualizar la cantidad de un lote', async () => {
    const nuevaCantidad = 150;

    const respuesta = await request(app.getHttpServer())
      .patch(`/lotes/${idLote}/cantidad`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({ cantidad: nuevaCantidad })
      .expect(200);
    
    expect(respuesta.body.cantidad_actual).toEqual(nuevaCantidad);
  });

  it('debería actualizar un lote', async () => {
    const datosActualizarLote = {
      numero_lote: 'LOT-2024-002',
      cantidad_actual: 200,
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/lotes/${idLote}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarLote)
      .expect(200);
    
    expect(respuesta.body.numero_lote).toEqual(datosActualizarLote.numero_lote);
    expect(respuesta.body.cantidad_actual).toEqual(datosActualizarLote.cantidad_actual);
  });

  it('debería eliminar un lote', async () => {
    await request(app.getHttpServer())
      .delete(`/lotes/${idLote}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el lote ha sido eliminado
    await request(app.getHttpServer())
      .get(`/lotes/${idLote}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosLoteInvalidos = {
      numero_lote: '',
      fecha_caducidad: 'fecha-invalida',
      cantidad_actual: 'no-es-numero',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/lotes')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosLoteInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});