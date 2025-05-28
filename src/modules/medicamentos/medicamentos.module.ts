import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicamento } from './entities/medicamento.entity';
import { MedicamentosController } from './controllers/medicamentos.controller';
import { MedicamentosService } from './services/medicamentos.service';
import { PresentacionesModule } from '../presentaciones/presentaciones.module';
import { ConcentracionesModule } from '../concentraciones/concentraciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicamento]),
    PresentacionesModule,
    ConcentracionesModule,
  ],
  controllers: [MedicamentosController],
  providers: [MedicamentosService],
  exports: [MedicamentosService],
})
export class MedicamentosModule {}