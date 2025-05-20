import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({
    description: 'Nombre de la persona',
    example: 'Juan',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(2, 100, {
    message: 'El nombre debe tener entre 2 y 100 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido de la persona',
    example: 'Pérez',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @Length(2, 100, {
    message: 'El apellido debe tener entre 2 y 100 caracteres',
  })
  apellido: string;

  @ApiProperty({
    description: 'Fecha de nacimiento de la persona',
    example: '1990-01-01',
    type: String,
    format: 'date',
  })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha_nacimiento: string;
}