import { IsNotEmpty, IsString, Length, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMunicipioDto {
  @ApiProperty({
    description: 'Nombre del municipio',
    example: 'Guatemala',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre del municipio es requerido' })
  @IsString({ message: 'El nombre del municipio debe ser un texto' })
  @Length(2, 100, {
    message: 'El nombre del municipio debe tener entre 2 y 100 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'ID del departamento al que pertenece el municipio',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del departamento es requerido' })
  @IsNumber({}, { message: 'El ID del departamento debe ser un número' })
  id_departamento: number;
}