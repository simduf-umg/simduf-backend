import { IsNotEmpty, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsignacionUsuarioDto {
  @ApiProperty({
    description: 'ID del usuario a asignar',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  user_id: number;

  @ApiProperty({
    description: 'ID del departamento (requerido para administradores)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => !o.id_distrito)
  @IsNumber({}, { message: 'El ID del departamento debe ser un número' })
  id_departamento?: number;

  @ApiProperty({
    description: 'ID del distrito (requerido para encargados)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => !o.id_departamento)
  @IsNumber({}, { message: 'El ID del distrito debe ser un número' })
  id_distrito?: number;
}
