import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presentacion } from './entities/presentacion.entity';
import { PresentacionesController } from './controllers/presentaciones.controller';
import { PresentacionesService } from './services/presentaciones.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Presentacion]),
  ],
  controllers: [PresentacionesController],
  providers: [PresentacionesService],
  exports: [PresentacionesService],
})
export class PresentacionesModule {}