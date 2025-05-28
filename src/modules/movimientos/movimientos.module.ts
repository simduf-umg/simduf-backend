import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from './entities/movimiento.entity';
import { MovimientosController } from './controllers/movimientos.controller';
import { MovimientosService } from './services/movimientos.service';
import { InventariosModule } from '../inventarios/inventarios.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movimiento]),
    InventariosModule,
    UsuariosModule,
  ],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}