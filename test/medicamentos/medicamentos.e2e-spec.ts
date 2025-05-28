import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Medicamentos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo medicamento', async () => {
    const datosCrearMedicamento = {
      nombre: 'Paracetamol',
      codigo: 'PAR-500-TAB',
      descripcion: 'Analgésico y antipirético',
      id_presentacion: idPresentacion,
      id_concentracion: idConcentracion,
    };

    const respuesta = await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearMedicamento)
      .expect(201);
    
    expect(respuesta.body.nombre).toEqual(datosCrearMedicamento.nombre);
    expect(respuesta.body.codigo).toEqual(datosCrearMedicamento.codigo);
    expect(respuesta.body.id_medicamento).toBeDefined();
    
    idMedicamento = respuesta.body.id_medicamento;
  });

  it('debería fallar al crear medicamento con código duplicado', async () => {
    const datosCrearMedicamento = {
      nombre: 'Otro Paracetamol',
      codigo: 'PAR-500-TAB', // Código duplicado
      id_presentacion: idPresentacion,
      id_concentracion: idConcentracion,
    };

    await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearMedicamento)
      .expect(409); // Conflict
  });

  it('debería obtener todos los medicamentos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un medicamento por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/medicamentos/${idMedicamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_medicamento).toEqual(idMedicamento);
    expect(respuesta.body.presentacion).toBeDefined();
    expect(respuesta.body.concentracion).toBeDefined();
  });

  it('debería obtener medicamento por código', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/medicamentos/codigo/PAR-500-TAB')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.codigo).toEqual('PAR-500-TAB');
  });

  it('debería buscar medicamentos por nombre', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/medicamentos/buscar?nombre=Paracetamol')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería actualizar un medicamento', async () => {
    const datosActualizarMedicamento = {
      nombre: 'Paracetamol Actualizado',
      descripcion: 'Descripción actualizada',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/medicamentos/${idMedicamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarMedicamento)
      .expect(200);
    
    expect(respuesta.body.nombre).toEqual(datosActualizarMedicamento.nombre);
    expect(respuesta.body.descripcion).toEqual(datosActualizarMedicamento.descripcion);
  });

  it('debería eliminar un medicamento', async () => {
    await request(app.getHttpServer())
      .delete(`/medicamentos/${idMedicamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el medicamento ha sido eliminado
    await request(app.getHttpServer())
      .get(`/medicamentos/${idMedicamento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosMedicamentoInvalidos = {
      nombre: '',
      codigo: '',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosMedicamentoInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});