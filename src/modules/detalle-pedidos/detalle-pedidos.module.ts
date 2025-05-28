import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { DetallePedidosController } from './controllers/detalle-pedidos.controller';
import { DetallePedidosService } from './services/detalle-pedidos.service';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallePedido]),
    MedicamentosModule,
  ],
  controllers: [DetallePedidosController],
  providers: [DetallePedidosService],
  exports: [DetallePedidosService],
})
export class DetallePedidosModule {}