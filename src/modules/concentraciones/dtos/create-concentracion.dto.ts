import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConcentracionDto {
  @ApiProperty({
    description: 'Valor de la concentración',
    example: 500,
    type: Number,
  })
  @IsNotEmpty({ message: 'El valor de la concentración es requerido' })
  @IsNumber({}, { message: 'El valor de la concentración debe ser un número' })
  valor: number;

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