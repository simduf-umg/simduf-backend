import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConcentracionDto {
  @ApiProperty({
    description: 'Valor de la concentración',
    example: '500',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El valor de la concentración es requerido' })
  @IsString({ message: 'El valor de la concentración debe ser un texto' })
  @Length(1, 50, {
    message: 'El valor de la concentración debe tener entre 1 y 50 caracteres',
  })
  valor: string;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'mg',
    minLength: 1,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'La unidad de medida es requerida' })
  @IsString({ message: 'La unidad de medida debe ser un texto' })
  @Length(1, 20, {
    message: 'La unidad de medida debe tener entre 1 y 20 caracteres',
  })
  unidad_medida: string;
}