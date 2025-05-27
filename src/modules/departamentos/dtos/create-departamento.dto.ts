import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartamentoDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Guatemala',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre del departamento es requerido' })
  @IsString({ message: 'El nombre del departamento debe ser un texto' })
  @Length(2, 100, {
    message: 'El nombre del departamento debe tener entre 2 y 100 caracteres',
  })
  nombre: string;
}