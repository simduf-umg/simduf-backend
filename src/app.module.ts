import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from './modules/personas/personas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartamentosModule } from './modules/departamentos/departamentos.module';
import { MunicipiosModule } from './modules/municipios/municipios.module';
import { DistritosModule } from './modules/distritos/distritos.module';
import { AsignacionUsuarioModule } from './modules/asignacion-usuarios/asignacion-usuario.module';
import { ConcentracionesModule } from './modules/concentraciones/concentraciones.module';
import { DetallePedidosModule } from './modules/detalle-pedidos/detalle-pedidos.module';
import { InventariosModule } from './modules/inventarios/inventarios.module';
import { LotesModule } from './modules/lotes/lotes.module';
import { MedicamentosModule } from './modules/medicamentos/medicamentos.module';
import { MovimientosModule } from './modules/movimientos/movimientos.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PresentacionesModule } from './modules/presentaciones/presentaciones.module';
import { SeguimientosModule } from './modules/seguimientos/seguimientos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    PersonasModule,
    UsuariosModule,
    RolesModule,
    AuthModule,
    DepartamentosModule,
    MunicipiosModule,
    DistritosModule,
    AsignacionUsuarioModule,
    ConcentracionesModule,
    DetallePedidosModule,
    InventariosModule,
    LotesModule,
    MedicamentosModule,
    MovimientosModule,
    PedidosModule,
    PresentacionesModule,
    SeguimientosModule,
  ],
})
export class AppModule {}