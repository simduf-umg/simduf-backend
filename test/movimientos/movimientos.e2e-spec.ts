import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Movimientos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idMovimiento: number;
  let idInventario: number;
  let idUsuario: number;
  let idMedicamento: number;
  let idLote: number;
  let idDistrito: number;
  let idPresentacion: number;
  let idConcentracion: number;
  let idDepartamento: number;
  let idMunicipio: number;

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
    idUsuario = respuestaLogin.body.user.id_usuario;

    // Crear departamento
    const respuestaDepartamento = await request(app.getHttpServer())
      .post('/departamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({ nombre: 'Departamento Test' });
    idDepartamento = respuestaDepartamento.body.id_departamento;

    // Crear municipio
    const respuestaMunicipio = await request(app.getHttpServer())
      .post('/municipios')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Municipio Test',
        id_departamento: idDepartamento,
      });
    idMunicipio = respuestaMunicipio.body.id_municipio;

    // Crear distrito
    const respuestaDistrito = await request(app.getHttpServer())
      .post('/distritos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Distrito Test',
        id_municipio: idMunicipio,
      });
    idDistrito = respuestaDistrito.body.id_distrito;

    // Crear presentación
    const respuestaPresentacion = await request(app.getHttpServer())
      .post('/presentaciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Tabletas',
        descripcion: 'Pastillas sólidas',
      });
    idPresentacion = respuestaPresentacion.body.id_presentacion;

    // Crear concentración
    const respuestaConcentracion = await request(app.getHttpServer())
      .post('/concentraciones')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        valor: '500',
        unidad_medida: 'mg',
      });
    idConcentracion = respuestaConcentracion.body.id_concentracion;

    // Crear medicamento
    const respuestaMedicamento = await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Paracetamol Test',
        codigo: 'PAR-TEST-001',
        id_presentacion: idPresentacion,
        id_concentracion: idConcentracion,
      });
    idMedicamento = respuestaMedicamento.body.id_medicamento;

    // Crear lote
    const respuestaLote = await request(app.getHttpServer())
      .post('/lotes')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        id_medicamento: idMedicamento,
        numero_lote: 'LOT-TEST-001',
        fecha_caducidad: '2025-12-31',
        cantidad_actual: 1000,
      });
    idLote = respuestaLote.body.id_lote;

    // Crear inventario
    const respuestaInventario = await request(app.getHttpServer())
      .post('/inventarios')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        id_medicamento: idMedicamento,
        id_lote: idLote,
        id_distrito: idDistrito,
        cantidad_disponible: 500,
        punto_reorden: 50,
      });
    idInventario = respuestaInventario.body.id_inventario;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo movimiento de entrada', async () => {
    const datosCrearMovimiento = {
      id_inventario: idInventario,
      id_usuario: idUsuario,
      tipo: 'ENTRADA',
      cantidad: 100,
      motivo: 'Reposición de stock',
      observaciones: 'Entrada inicial de prueba',
      estado: 'PENDIENTE',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/movimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearMovimiento)
      .expect(201);
    
    expect(respuesta.body.tipo).toEqual(datosCrearMovimiento.tipo);
    expect(respuesta.body.cantidad).toEqual(datosCrearMovimiento.cantidad);
    expect(respuesta.body.motivo).toEqual(datosCrearMovimiento.motivo);
    expect(respuesta.body.estado).toEqual(datosCrearMovimiento.estado);
    expect(respuesta.body.id_movimiento).toBeDefined();
    
    idMovimiento = respuesta.body.id_movimiento;
  });

  it('debería fallar al crear movimiento de salida con stock insuficiente', async () => {
    const datosMovimientoInvalido = {
      id_inventario: idInventario,
      id_usuario: idUsuario,
      tipo: 'SALIDA',
      cantidad: 1000, // Más que el stock disponible
      motivo: 'Salida de prueba',
      estado: 'COMPLETADO', // Intentar completar inmediatamente
    };

    await request(app.getHttpServer())
      .post('/movimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosMovimientoInvalido)
      .expect(400); // Bad Request por stock insuficiente
  });

  it('debería obtener todos los movimientos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/movimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un movimiento por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/movimientos/${idMovimiento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_movimiento).toEqual(idMovimiento);
    expect(respuesta.body.inventario).toBeDefined();
    expect(respuesta.body.usuario).toBeDefined();
  });

  it('debería obtener movimientos pendientes', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/movimientos/pendientes')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    // Debe incluir nuestro movimiento pendiente
    const movimientoPendiente = respuesta.body.find(m => m.id_movimiento === idMovimiento);
    expect(movimientoPendiente).toBeDefined();
    expect(movimientoPendiente.estado).toEqual('PENDIENTE');
  });

  it('debería obtener movimientos por tipo', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/movimientos/tipo/ENTRADA')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    if (respuesta.body.length > 0) {
      expect(respuesta.body[0].tipo).toEqual('ENTRADA');
    }
  });

  it('debería obtener movimientos por inventario', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/movimientos/inventario/${idInventario}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
    expect(respuesta.body[0].id_inventario).toEqual(idInventario);
  });

  it('debería obtener estadísticas de movimientos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/movimientos/estadisticas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.porTipo).toBeDefined();
    expect(respuesta.body.porEstado).toBeDefined();
    expect(respuesta.body.porTipo.entradas).toBeGreaterThan(0);
  });

  it('debería actualizar un movimiento pendiente', async () => {
    const datosActualizarMovimiento = {
      cantidad: 150,
      motivo: 'Motivo actualizado',
      observaciones: 'Observaciones actualizadas',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/movimientos/${idMovimiento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarMovimiento)
      .expect(200);
    
    expect(respuesta.body.cantidad).toEqual(datosActualizarMovimiento.cantidad);
    expect(respuesta.body.motivo).toEqual(datosActualizarMovimiento.motivo);
    expect(respuesta.body.observaciones).toEqual(datosActualizarMovimiento.observaciones);
  });

  it('debería cambiar estado de movimiento a COMPLETADO', async () => {
    const cambiarEstado = {
      estado: 'COMPLETADO',
      observaciones: 'Movimiento procesado exitosamente',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/movimientos/${idMovimiento}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(cambiarEstado)
      .expect(200);
    
    expect(respuesta.body.estado).toEqual('COMPLETADO');
    expect(respuesta.body.observaciones).toEqual(cambiarEstado.observaciones);
  });

  it('debería fallar al actualizar movimiento completado', async () => {
    const datosActualizar = {
      cantidad: 200,
      motivo: 'Nuevo motivo',
    };

    await request(app.getHttpServer())
      .put(`/movimientos/${idMovimiento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizar)
      .expect(400); // Bad Request porque está completado
  });

  it('debería cancelar un movimiento completado', async () => {
    const cambiarEstado = {
      estado: 'CANCELADO',
      observaciones: 'Movimiento cancelado por prueba',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/movimientos/${idMovimiento}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(cambiarEstado)
      .expect(200);
    
    expect(respuesta.body.estado).toEqual('CANCELADO');
  });

  it('debería crear movimiento de salida válido', async () => {
    const datosMovimientoSalida = {
      id_inventario: idInventario,
      id_usuario: idUsuario,
      tipo: 'SALIDA',
      cantidad: 50, // Cantidad válida
      motivo: 'Dispensación a paciente',
      estado: 'COMPLETADO',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/movimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosMovimientoSalida)
      .expect(201);
    
    expect(respuesta.body.tipo).toEqual('SALIDA');
    expect(respuesta.body.estado).toEqual('COMPLETADO');
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosMovimientoInvalidos = {
      tipo: 'TIPO_INVALIDO',
      cantidad: -10,
      motivo: '', // Muy corto
    };

    const respuesta = await request(app.getHttpServer())
      .post('/movimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosMovimientoInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});