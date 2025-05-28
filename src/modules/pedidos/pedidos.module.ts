import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { PedidosController } from './controllers/pedidos.controller';
import { PedidosService } from './services/pedidos.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { DetallePedidosModule } from '../detalle-pedidos/detalle-pedidos.module';
import { SeguimientosModule } from '../seguimientos/seguimientos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido]),
    UsuariosModule,
    DetallePedidosModule,
    SeguimientosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}