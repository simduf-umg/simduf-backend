import { IsNotEmpty, IsString, Length, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDistritoDto {
  @ApiProperty({
    description: 'Nombre del distrito',
    example: 'Distrito Central',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre del distrito es requerido' })
  @IsString({ message: 'El nombre del distrito debe ser un texto' })
  @Length(2, 100, {
    message: 'El nombre del distrito debe tener entre 2 y 100 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'ID del municipio al que pertenece el distrito',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del municipio es requerido' })
  @IsNumber({}, { message: 'El ID del municipio debe ser un número' })
  id_municipio: number;
}