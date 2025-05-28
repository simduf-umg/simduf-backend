import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionUsuario } from './entities/asignacion-usuario.entity';
import { AsignacionUsuarioController } from './controllers/asignacion-usuario.controller';
import { AsignacionUsuarioService } from './services/asignacion-usuarios.service';
import { AsignacionUsuarioUtilService } from './services/asignacion-usuario-util.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { DepartamentosModule } from '../departamentos/departamentos.module';
import { DistritosModule } from '../distritos/distritos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionUsuario]),
    UsuariosModule,
    DepartamentosModule,
    DistritosModule,
  ],
  controllers: [AsignacionUsuarioController],
  providers: [
    AsignacionUsuarioService,
    AsignacionUsuarioUtilService,
  ],
  exports: [
    AsignacionUsuarioService,
    AsignacionUsuarioUtilService,
  ],
})
export class AsignacionUsuarioModule {}
