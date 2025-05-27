import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';
import { MunicipiosController } from './controllers/municipios.controller';
import { MunicipiosService } from './services/municipios.service';
import { DepartamentosModule } from '../departamentos/departamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Municipio]),
    DepartamentosModule,
  ],
  controllers: [MunicipiosController],
  providers: [MunicipiosService],
  exports: [MunicipiosService],
})
export class MunicipiosModule {}