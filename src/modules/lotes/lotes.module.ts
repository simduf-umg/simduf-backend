import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { LotesController } from './controllers/lotes.controller';
import { LotesService } from './services/lotes.service';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lote]),
    MedicamentosModule,
  ],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService],
})
export class LotesModule {}