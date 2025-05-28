import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Pedidos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idPedido: number;
  let idUsuario: number;
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
    idUsuario = respuestaLogin.body.user.id_usuario;

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
        nombre: 'Paracetamol Test',
        codigo: 'PAR-PEDIDO-001',
        id_presentacion: idPresentacion,
        id_concentracion: idConcentracion,
      });
    idMedicamento = respuestaMedicamento.body.id_medicamento;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería crear un nuevo pedido', async () => {
    const datosCrearPedido = {
      id_usuario_solicitante: idUsuario,
      fecha_limite_requerida: '2024-12-31',
      observaciones: 'Pedido de prueba urgente',
      prioridad: 'ALTA',
      detalles: [
        {
          id_medicamento: idMedicamento,
          cantidad_solicitada: 100,
          observaciones: 'Preferir lote más reciente',
        },
        {
          id_medicamento: idMedicamento,
          cantidad_solicitada: 50,
          observaciones: 'Para uso inmediato',
        },
      ],
    };

    const respuesta = await request(app.getHttpServer())
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearPedido)
      .expect(201);
    
    expect(respuesta.body.id_usuario_solicitante).toEqual(datosCrearPedido.id_usuario_solicitante);
    expect(respuesta.body.prioridad).toEqual(datosCrearPedido.prioridad);
    expect(respuesta.body.estado).toEqual('PENDIENTE');
    expect(respuesta.body.detalles).toHaveLength(2);
    expect(respuesta.body.seguimientos).toHaveLength(1);
    expect(respuesta.body.id_pedido).toBeDefined();
    
    idPedido = respuesta.body.id_pedido;
  });

  it('debería fallar al crear pedido sin detalles', async () => {
    const datosPedidoInvalido = {
      id_usuario_solicitante: idUsuario,
      observaciones: 'Pedido sin detalles',
      detalles: [], // Array vacío
    };

    const respuesta = await request(app.getHttpServer())
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosPedidoInvalido)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });

  it('debería obtener todos los pedidos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un pedido por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/pedidos/${idPedido}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_pedido).toEqual(idPedido);
    expect(respuesta.body.usuario_solicitante).toBeDefined();
    expect(respuesta.body.detalles).toBeDefined();
    expect(respuesta.body.seguimientos).toBeDefined();
  });

  it('debería obtener pedidos pendientes', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pedidos/pendientes')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    const pedidoPendiente = respuesta.body.find(p => p.id_pedido === idPedido);
    expect(pedidoPendiente).toBeDefined();
    expect(pedidoPendiente.estado).toEqual('PENDIENTE');
  });

  it('debería obtener pedidos por estado', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pedidos/estado/PENDIENTE')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    if (respuesta.body.length > 0) {
      expect(respuesta.body[0].estado).toEqual('PENDIENTE');
    }
  });

  it('debería obtener pedidos por prioridad', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pedidos/prioridad/ALTA')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    const pedidoAlta = respuesta.body.find(p => p.id_pedido === idPedido);
    expect(pedidoAlta).toBeDefined();
    expect(pedidoAlta.prioridad).toEqual('ALTA');
  });

  it('debería obtener pedidos por usuario solicitante', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/pedidos/usuario-solicitante/${idUsuario}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
    expect(respuesta.body[0].id_usuario_solicitante).toEqual(idUsuario);
  });

  it('debería obtener estadísticas de pedidos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pedidos/estadisticas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.porEstado).toBeDefined();
    expect(respuesta.body.porPrioridad).toBeDefined();
    expect(respuesta.body.porEstado.pendientes).toBeGreaterThan(0);
    expect(respuesta.body.porPrioridad.alta).toBeGreaterThan(0);
  });

  it('debería actualizar un pedido pendiente', async () => {
    const datosActualizarPedido = {
      observaciones: 'Observaciones actualizadas',
      prioridad: 'MEDIA',
      fecha_limite_requerida: '2024-11-30',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/pedidos/${idPedido}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarPedido)
      .expect(200);
    
    expect(respuesta.body.observaciones).toEqual(datosActualizarPedido.observaciones);
    expect(respuesta.body.prioridad).toEqual(datosActualizarPedido.prioridad);
  });

  it('debería aprobar un pedido', async () => {
    const cambiarEstado = {
      estado: 'APROBADO',
      id_usuario_autorizador: idUsuario,
      observaciones: 'Pedido aprobado para procesamiento',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/pedidos/${idPedido}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(cambiarEstado)
      .expect(200);
    
    expect(respuesta.body.estado).toEqual('APROBADO');
    expect(respuesta.body.id_usuario_autorizador).toEqual(idUsuario);
    expect(respuesta.body.fecha_autorizacion).toBeDefined();
    expect(respuesta.body.seguimientos.length).toBeGreaterThan(1);
  });

  it('debería cambiar estado a EN_PROCESO', async () => {
    const cambiarEstado = {
      estado: 'EN_PROCESO',
      observaciones: 'Iniciando preparación del pedido',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/pedidos/${idPedido}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(cambiarEstado)
      .expect(200);
    
    expect(respuesta.body.estado).toEqual('EN_PROCESO');
  });

  it('debería completar el pedido', async () => {
    const cambiarEstado = {
      estado: 'COMPLETADO',
      observaciones: 'Pedido completado exitosamente',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/pedidos/${idPedido}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(cambiarEstado)
      .expect(200);
    
    expect(respuesta.body.estado).toEqual('COMPLETADO');
    expect(respuesta.body.fecha_completado).toBeDefined();
  });

  it('debería fallar al actualizar pedido completado', async () => {
    const datosActualizar = {
      observaciones: 'Intentando actualizar pedido completado',
    };

    await request(app.getHttpServer())
      .put(`/pedidos/${idPedido}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizar)
      .expect(400); // Bad Request porque está completado
  });

  it('debería fallar con transición de estado inválida', async () => {
    const cambiarEstadoInvalido = {
      estado: 'PENDIENTE', // No se puede volver a pendiente desde completado
      observaciones: 'Transición inválida',
    };

    await request(app.getHttpServer())
      .patch(`/pedidos/${idPedido}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(cambiarEstadoInvalido)
      .expect(400); // Bad Request por transición inválida
  });

  it('debería crear pedido y rechazarlo', async () => {
    const datosNuevoPedido = {
      id_usuario_solicitante: idUsuario,
      observaciones: 'Pedido para rechazar',
      prioridad: 'BAJA',
      detalles: [
        {
          id_medicamento: idMedicamento,
          cantidad_solicitada: 25,
        },
      ],
    };

    const respuestaPedido = await request(app.getHttpServer())
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosNuevoPedido)
      .expect(201);
    
    const idPedidoRechazar = respuestaPedido.body.id_pedido;

    // Rechazar el pedido
    const rechazarPedido = {
      estado: 'RECHAZADO',
      id_usuario_autorizador: idUsuario,
      motivo_rechazo: 'Stock insuficiente',
      observaciones: 'No hay suficiente inventario',
    };

    const respuestaRechazo = await request(app.getHttpServer())
      .patch(`/pedidos/${idPedidoRechazar}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(rechazarPedido)
      .expect(200);
    
    expect(respuestaRechazo.body.estado).toEqual('RECHAZADO');
    expect(respuestaRechazo.body.motivo_rechazo).toEqual(rechazarPedido.motivo_rechazo);
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosPedidoInvalidos = {
      prioridad: 'PRIORIDAD_INVALIDA',
      detalles: [
        {
          cantidad_solicitada: -10, // Cantidad negativa
        },
      ],
    };

    const respuesta = await request(app.getHttpServer())
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosPedidoInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});