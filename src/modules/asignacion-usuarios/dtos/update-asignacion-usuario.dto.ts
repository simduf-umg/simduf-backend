import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionUsuarioDto } from './create-asignacion-usuario.dto';

export class UpdateAsignacionUsuarioDto extends PartialType(CreateAsignacionUsuarioDto) {}
