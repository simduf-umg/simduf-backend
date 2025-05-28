import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concentracion } from './entities/concentracion.entity';
import { ConcentracionesController } from './controllers/concentraciones.controller';
import { ConcentracionesService } from './services/concentraciones.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Concentracion]),
  ],
  controllers: [ConcentracionesController],
  providers: [ConcentracionesService],
  exports: [ConcentracionesService],
})
export class ConcentracionesModule {}