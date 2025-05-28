import { IsNotEmpty, IsString, Length, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLoteDto {
  @ApiProperty({
    description: 'ID del medicamento al que pertenece el lote',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del medicamento es requerido' })
  @IsNumber({}, { message: 'El ID del medicamento debe ser un número' })
  id_medicamento: number;

  @ApiProperty({
    description: 'Número del lote',
    example: 'LOT-2024-001',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El número del lote es requerido' })
  @IsString({ message: 'El número del lote debe ser un texto' })
  @Length(3, 100, {
    message: 'El número del lote debe tener entre 3 y 100 caracteres',
  })
  numero_lote: string;
  
  @ApiProperty({
    description: 'Fecha de caducidad',
    example: '2025-12-31',
  })
  @IsNotEmpty({ message: 'La fecha de fabricacion es requerida' })
  @IsDateString({}, { message: 'La fecha de fabricacion debe ser una fecha válida' })
  fecha_fabricacion: Date;

  @ApiProperty({
    description: 'Fecha de caducidad',
    example: '2025-12-31',
  })
  @IsNotEmpty({ message: 'La fecha de caducidad es requerida' })
  @IsDateString({}, { message: 'La fecha de caducidad debe ser una fecha válida' })
  fecha_caducidad: Date;

  @ApiProperty({
    description: 'Cantidad inicial del lote',
    example: 500,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad inicial debe ser un número' })
  cantidad_inicial: number = 0;

  @ApiProperty({
    description: 'Cantidad actual disponible',
    example: 500,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad actual debe ser un número' })
  cantidad_actual: number = 0;
}