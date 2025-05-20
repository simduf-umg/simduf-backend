// test/auth/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Controlador de Autenticación (e2e)', () => {
  let app: INestApplication;
  let tokenJWT: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería autenticar al usuario y devolver un token JWT', async () => {
    const datosLogin = {
      username: 'admin',
      contrasena: 'Admin123!',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send(datosLogin)
      .expect(201);
    
    expect(respuesta.body.access_token).toBeDefined();
    tokenJWT = respuesta.body.access_token;
  });

  it('debería fallar la autenticación con credenciales incorrectas', async () => {
    const datosLogin = {
      username: 'admin',
      contrasena: 'ContraseñaIncorrecta',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(datosLogin)
      .expect(401);
  });

  it('debería fallar con errores de validación para datos de login inválidos', async () => {
    const datosLoginInvalidos = {
      username: '',
      contrasena: '',
    };

    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send(datosLoginInvalidos)
      .expect(400);
    
    // Verificamos que hay algún tipo de mensaje de error en el formato esperado
    expect(Array.isArray(respuesta.body.message)).toBe(true);
    expect(respuesta.body.message.length).toBeGreaterThan(0);
    
    // Verificamos que los mensajes específicos estén presentes
    expect(respuesta.body.message).toContain("El nombre de usuario es requerido");
    expect(respuesta.body.message).toContain("La contraseña es requerida");
  });
});