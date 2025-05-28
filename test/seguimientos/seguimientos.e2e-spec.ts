import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Seguimientos (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;
  let idSeguimiento: number;
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
        nombre: 'Paracetamol Seguimiento',
        codigo: 'PAR-SEG-001',
        id_presentacion: idPresentacion,
        id_concentracion: idConcentracion,
      });
    idMedicamento = respuestaMedicamento.body.id_medicamento;

    // Crear pedido para las pruebas
    const respuestaPedido = await request(app.getHttpServer())
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send({
        id_usuario_solicitante: idUsuario,
        observaciones: 'Pedido para test de seguimientos',
        prioridad: 'ALTA',
        detalles: [
          {
            id_medicamento: idMedicamento,
            cantidad_solicitada: 100,
          },
        ],
      });
    idPedido = respuestaPedido.body.id_pedido;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería obtener todos los seguimientos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/seguimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.data).toBeDefined();
    expect(Array.isArray(respuesta.body.data)).toBe(true);
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.pagina).toBeDefined();
    expect(respuesta.body.limite).toBeDefined();
    expect(respuesta.body.data.length).toBeGreaterThan(0);
  });

  it('debería obtener seguimientos con filtros', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos?id_pedido=${idPedido}&accion=CREACION&limite=5`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.data).toBeDefined();
    expect(respuesta.body.limite).toEqual(5);
    if (respuesta.body.data.length > 0) {
      expect(respuesta.body.data[0].id_pedido).toEqual(idPedido);
      expect(respuesta.body.data[0].accion).toEqual('CREACION');
    }
  });

  it('debería obtener timeline de un pedido específico', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos/pedido/${idPedido}/timeline`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
    
    // Verificar que está ordenado cronológicamente
    if (respuesta.body.length > 1) {
      const fecha1 = new Date(respuesta.body[0].fecha_cambio);
      const fecha2 = new Date(respuesta.body[1].fecha_cambio);
      expect(fecha1.getTime()).toBeLessThanOrEqual(fecha2.getTime());
    }
    
    // Verificar que todos los seguimientos son del mismo pedido
    respuesta.body.forEach((seguimiento: any) => {
      expect(seguimiento.id_pedido).toEqual(idPedido);
    });
  });

  it('debería obtener seguimientos por pedido', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos/pedido/${idPedido}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);
    expect(respuesta.body[0].id_pedido).toEqual(idPedido);
    expect(respuesta.body[0].usuario).toBeDefined();
  });

  it('debería obtener seguimientos recientes', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/seguimientos/recientes?limite=5')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeLessThanOrEqual(5);
    
    // Verificar que está ordenado por fecha descendente
    if (respuesta.body.length > 1) {
      const fecha1 = new Date(respuesta.body[0].fecha_cambio);
      const fecha2 = new Date(respuesta.body[1].fecha_cambio);
      expect(fecha1.getTime()).toBeGreaterThanOrEqual(fecha2.getTime());
    }
  });

  it('debería obtener estadísticas de actividad', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/seguimientos/estadisticas')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.porAccion).toBeDefined();
    expect(respuesta.body.porUsuario).toBeDefined();
    expect(respuesta.body.porEstado).toBeDefined();
    expect(respuesta.body.tiempoPromedio).toBeDefined();
    
    expect(typeof respuesta.body.total).toBe('number');
    expect(Array.isArray(respuesta.body.porUsuario)).toBe(true);
  });

  it('debería obtener estadísticas con filtro de fechas', async () => {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    const fechaFin = new Date();
    
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos/estadisticas?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.porAccion).toBeDefined();
  });

  it('debería obtener seguimientos por usuario', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos/usuario/${idUsuario}?limite=10`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeLessThanOrEqual(10);
    
    if (respuesta.body.length > 0) {
      expect(respuesta.body[0].id_usuario).toEqual(idUsuario);
      expect(respuesta.body[0].pedido).toBeDefined();
    }
  });

  it('debería obtener mi actividad reciente', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/seguimientos/mi-actividad?dias=3')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    
    if (respuesta.body.length > 0) {
      expect(respuesta.body[0].id_usuario).toEqual(idUsuario);
    }
  });

  it('debería obtener actividad reciente de un usuario específico', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos/usuario/${idUsuario}/actividad-reciente?dias=5`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    
    // Verificar que todas las actividades son recientes (últimos 5 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 5);
    
    respuesta.body.forEach((seguimiento: any) => {
      const fechaSeguimiento = new Date(seguimiento.fecha_cambio);
      expect(fechaSeguimiento.getTime()).toBeGreaterThanOrEqual(fechaLimite.getTime());
    });
  });

  it('debería obtener seguimientos por tipo de acción', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/seguimientos/accion/CREACION')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(Array.isArray(respuesta.body)).toBe(true);
    
    if (respuesta.body.length > 0) {
      respuesta.body.forEach((seguimiento: any) => {
        expect(seguimiento.accion).toEqual('CREACION');
      });
    }
  });

  it('debería crear un nuevo seguimiento manual', async () => {
    const datosCrearSeguimiento = {
      id_pedido: idPedido,
      id_usuario: idUsuario,
      estado_anterior: 'PENDIENTE',
      estado_nuevo: 'EN_REVISION',
      accion: 'MODIFICACION',
      observaciones: 'Seguimiento manual de prueba',
      datos_adicionales: {
        motivo: 'Prueba de seguimiento',
        campo_modificado: 'observaciones',
      },
    };

    const respuesta = await request(app.getHttpServer())
      .post('/seguimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearSeguimiento)
      .expect(201);
    
    expect(respuesta.body.id_pedido).toEqual(datosCrearSeguimiento.id_pedido);
    expect(respuesta.body.id_usuario).toEqual(datosCrearSeguimiento.id_usuario);
    expect(respuesta.body.estado_anterior).toEqual(datosCrearSeguimiento.estado_anterior);
    expect(respuesta.body.estado_nuevo).toEqual(datosCrearSeguimiento.estado_nuevo);
    expect(respuesta.body.accion).toEqual(datosCrearSeguimiento.accion);
    expect(respuesta.body.observaciones).toEqual(datosCrearSeguimiento.observaciones);
    expect(respuesta.body.datos_adicionales).toEqual(datosCrearSeguimiento.datos_adicionales);
    expect(respuesta.body.ip_origen).toBeDefined(); // Se debe capturar automáticamente
    expect(respuesta.body.user_agent).toBeDefined(); // Se debe capturar automáticamente
    expect(respuesta.body.duracion_estado_anterior).toBeDefined(); // Se debe calcular automáticamente
    expect(respuesta.body.id_seguimiento).toBeDefined();
    
    idSeguimiento = respuesta.body.id_seguimiento;
  });

  it('debería obtener un seguimiento por id', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/seguimientos/${idSeguimiento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.id_seguimiento).toEqual(idSeguimiento);
    expect(respuesta.body.pedido).toBeDefined();
    expect(respuesta.body.usuario).toBeDefined();
    expect(respuesta.body.usuario.persona).toBeDefined();
    expect(respuesta.body.datos_adicionales).toBeDefined();
  });

  it('debería crear seguimiento con acción determinada automáticamente', async () => {
    const datosCrearSeguimiento = {
      id_pedido: idPedido,
      id_usuario: idUsuario,
      estado_anterior: 'PENDIENTE',
      estado_nuevo: 'APROBADO', // Debe determinar automáticamente acción: APROBACION
      observaciones: 'Seguimiento con acción automática',
    };

    // Removemos la acción para que se determine automáticamente
    delete datosCrearSeguimiento['accion'];

    const respuesta = await request(app.getHttpServer())
      .post('/seguimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosCrearSeguimiento)
      .expect(201);
    
    expect(respuesta.body.estado_nuevo).toEqual('APROBADO');
    expect(respuesta.body.accion).toEqual('APROBACION'); // Debe determinarse automáticamente
  });

  it('debería fallar con errores de validación para datos inválidos', async () => {
    const datosSeguimientoInvalidos = {
      id_pedido: 'no-es-numero',
      estado_nuevo: '', // Requerido pero vacío
      accion: 'ACCION_INVALIDA',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/seguimientos')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .send(datosSeguimientoInvalidos)
      .expect(400);
    
    expect(respuesta.body.message).toBeDefined();
  });

  it('debería eliminar un seguimiento', async () => {
    await request(app.getHttpServer())
      .delete(`/seguimientos/${idSeguimiento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    // Verificar que el seguimiento ha sido eliminado
    await request(app.getHttpServer())
      .get(`/seguimientos/${idSeguimiento}`)
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(404);
  });

  it('debería obtener seguimientos con paginación', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/seguimientos?pagina=1&limite=3')
      .set('Authorization', `Bearer ${tokenJWT}`)
      .expect(200);
    
    expect(respuesta.body.data).toBeDefined();
    expect(respuesta.body.total).toBeDefined();
    expect(respuesta.body.pagina).toEqual(1);
    expect(respuesta.body.limite).toEqual(3);
    expect(respuesta.body.data.length).toBeLessThanOrEqual(3);
  });
});