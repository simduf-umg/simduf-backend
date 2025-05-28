import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distrito } from './entities/distrito.entity';
import { DistritosController } from './controllers/distritos.controller';
import { DistritosService } from './services/distritos.service';
import { MunicipiosModule } from '../municipios/municipios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Distrito]),
    MunicipiosModule,
  ],
  controllers: [DistritosController],
  providers: [DistritosService],
  exports: [DistritosService],
})
export class DistritosModule {}