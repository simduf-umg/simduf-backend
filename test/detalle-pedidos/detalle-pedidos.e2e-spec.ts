import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Detalle Pedidos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idDetalle: number;
  let idPedido: number;
  let idUsuario: number;
  let idMedicamento1: number;
  let idMedicamento2: number;
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

    // Crear medicamentos para las pruebas
    const respuestaMedicamento1 = await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Paracetamol Detalle',
        codigo: 'PAR-DET-001',
        id_presentacion: idPresentacion,
        id_concentracion: idConcentracion,
      });
    idMedicamento1 = respuestaMedicamento1.body.id_medicamento;

    const respuestaMedicamento2 = await request(app.getHttpServer())
      .post('/medicamentos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        nombre: 'Ibuprofeno Detalle',
        codigo: 'IBU-DET-001',
        id_presentacion: idPresentacion,
        id_concentracion: idConcentracion,
      });
    idMedicamento2 = respuestaMedicamento2.body.id_medicamento;

    // Crear pedido para las pruebas
    const respuestaPedido = await request(app.getHttpServer())
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        id_usuario_solicitante: idUsuario,
        observaciones: 'Pedido para test de detalles',
        prioridad: 'MEDIA',
        detalles: [
          {
            id_medicamento: idMedicamento1,
            cantidad_solicitada: 100,
            precio_unitario: 2.50,
          },
        ],
      });
    idPedido = respuestaPedido.body.id_pedido;
    idDetalle = respuestaPedido.body.detalles[0].id_detalle;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería obtener todos los detalles de pedidos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/detalle-pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un detalle por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/detalle-pedidos/${idDetalle}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_detalle).toEqual(idDetalle);
    expect(respuesta.body.pedido).toBeDefined();
    expect(respuesta.body.medicamento).toBeDefined();
    expect(respuesta.body.cantidad_solicitada).toEqual(100);
    expect(respuesta.body.precio_unitario).toEqual('2.50');
    expect(respuesta.body.subtotal).toEqual('250.00');
  });

  it('debería obtener detalles por pedido', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/detalle-pedidos/pedido/${idPedido}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
    expect(respuesta.body[0].id_pedido).toEqual(idPedido);
  });

  it('debería obtener estadísticas de detalles', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/detalle-pedidos/estadisticas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.porEstado).toBeDefined();
    expect(respuesta.body.cantidades).toBeDefined();
    expect(respuesta.body.porEstado.pendientes).toBeGreaterThan(0);
  });

  it('debería obtener estadísticas de un pedido específico', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/detalle-pedidos/pedido/${idPedido}/estadisticas`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.total).toBeGreaterThan(0);
    expect(respuesta.body.cantidades.totalSolicitado).toEqual(100);
    expect(respuesta.body.cantidades.montoTotal).toEqual(250);
  });

  it('debería crear un nuevo detalle de pedido', async () => {
    const datosCrearDetalle = {
      id_pedido: idPedido,
      id_medicamento: idMedicamento2,
      cantidad_solicitada: 50,
      precio_unitario: 3.00,
      observaciones: 'Nuevo detalle de prueba',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/detalle-pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearDetalle)
      .expect(201);
    
    expect(respuesta.body.id_medicamento).toEqual(datosCrearDetalle.id_medicamento);
    expect(respuesta.body.cantidad_solicitada).toEqual(datosCrearDetalle.cantidad_solicitada);
    expect(respuesta.body.precio_unitario).toEqual('3.00');
    expect(respuesta.body.subtotal).toEqual('150.00');
    expect(respuesta.body.estado).toEqual('PENDIENTE');
  });

  it('debería fallar al crear detalle con medicamento duplicado', async () => {
    const datosDetalleDuplicado = {
      id_pedido: idPedido,
      id_medicamento: idMedicamento1, // Medicamento ya incluido
      cantidad_solicitada: 25,
    };

    await request(app.getHttpServer())
      .post('/detalle-pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosDetalleDuplicado)
      .expect(409); // Conflict
  });

  it('debería actualizar un detalle pendiente', async () => {
    const datosActualizarDetalle = {
      cantidad_solicitada: 120,
      precio_unitario: 2.75,
      observaciones: 'Cantidad actualizada',
    };

    const respuesta = await request(app.getHttpServer())
      .put(`/detalle-pedidos/${idDetalle}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosActualizarDetalle)
      .expect(200);
    
    expect(respuesta.body.cantidad_solicitada).toEqual(datosActualizarDetalle.cantidad_solicitada);
    expect(respuesta.body.precio_unitario).toEqual('2.75');
    expect(respuesta.body.subtotal).toEqual('330.00'); // 120 * 2.75
    expect(respuesta.body.observaciones).toEqual(datosActualizarDetalle.observaciones);
  });

  it('debería aprobar un detalle con cantidad completa', async () => {
    const aprobarDetalle = {
      cantidad_aprobada: 120,
      estado: 'APROBADO',
      observaciones: 'Aprobado cantidad completa',
      precio_unitario: 2.80,
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/detalle-pedidos/${idDetalle}/aprobar`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(aprobarDetalle)
      .expect(200);
    
    expect(respuesta.body.cantidad_aprobada).toEqual(120);
    expect(respuesta.body.estado).toEqual('APROBADO');
    expect(respuesta.body.precio_unitario).toEqual('2.80');
    expect(respuesta.body.subtotal).toEqual('336.00'); // 120 * 2.80
  });

  it('debería registrar entrega parcial', async () => {
    const registrarEntrega = {
      cantidad_entregada: 80,
      observaciones: 'Entrega parcial - lote LOT-001',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/detalle-pedidos/${idDetalle}/entregar`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(registrarEntrega)
      .expect(200);
    
    expect(respuesta.body.cantidad_entregada).toEqual(80);
    expect(respuesta.body.estado).toEqual('PARCIAL');
    expect(respuesta.body.observaciones).toContain('Entrega parcial');
  });

  it('debería completar la entrega', async () => {
    const completarEntrega = {
      cantidad_entregada: 40, // Para completar los 120 aprobados
      observaciones: 'Entrega final - lote LOT-002',
    };

    const respuesta = await request(app.getHttpServer())
      .patch(`/detalle-pedidos/${idDetalle}/entregar`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(completarEntrega)
      .expect(200);
    
    expect(respuesta.body.cantidad_entregada).toEqual(120); // 80 + 40
    expect(respuesta.body.estado).toEqual('COMPLETADO');
  });

  it('debería fallar al entregar más de lo aprobado', async () => {
    const entregaExcesiva = {
      cantidad_entregada: 10, // Ya se entregaron 120, esto excedería
    };

    await request(app.getHttpServer())
      .patch(`/detalle-pedidos/${idDetalle}/entregar`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(entregaExcesiva)
      .expect(400); // Bad Request
  });

  it('debería verificar completitud del pedido', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/detalle-pedidos/pedido/${idPedido}/completitud`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.completo).toBeDefined();
    expect(typeof respuesta.body.completo).toBe('boolean');
  });

  it('debería obtener detalles pendientes de aprobación', async () => {
    // Primero aprobar el pedido para que sus detalles aparezcan en pendientes de aprobación
    await request(app.getHttpServer())
      .patch(`/pedidos/${idPedido}/estado`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        estado: 'APROBADO',
        id_usuario_autorizador: idUsuario,
      });

    const respuesta = await request(app.getHttpServer())
      .get('/detalle-pedidos/pendientes-aprobacion')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  it('debería obtener detalles por estado', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/detalle-pedidos/estado/COMPLETADO')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    if (respuesta.body.length > 0) {
      expect(respuesta.body[0].estado).toEqual('COMPLETADO');
    }
  });

  it('debería obtener detalles por medicamento', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/detalle-pedidos/medicamento/${idMedicamento1}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    if (respuesta.body.length > 0) {
      expect(respuesta.body[0].id_medicamento).toEqual(idMedicamento1);
    }
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosDetalleInvalidos = {
      id_pedido: 'no-es-numero',
      cantidad_solicitada: -10,
      precio_unitario: 'no-es-numero',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/detalle-pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosDetalleInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });
});