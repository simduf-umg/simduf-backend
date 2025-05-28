import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { InventariosController } from './controllers/inventarios.controller';
import { InventariosService } from './services/inventarios.service';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { LotesModule } from '../lotes/lotes.module';
import { DistritosModule } from '../distritos/distritos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventario]),
    MedicamentosModule,
    LotesModule,
    DistritosModule,
  ],
  controllers: [InventariosController],
  providers: [InventariosService],
  exports: [InventariosService],
})
export class InventariosModule {}