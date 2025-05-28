import { IsNotEmpty, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventarioDto {
  @ApiProperty({
    description: 'ID del medicamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del medicamento es requerido' })
  @IsNumber({}, { message: 'El ID del medicamento debe ser un número' })
  id_medicamento: number;

  @ApiProperty({
    description: 'ID del lote',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del lote es requerido' })
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  id_lote: number;

  @ApiProperty({
    description: 'ID del distrito',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del distrito es requerido' })
  @IsNumber({}, { message: 'El ID del distrito debe ser un número' })
  id_distrito: number;

  @ApiProperty({
    description: 'Cantidad disponible',
    example: 100,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad disponible debe ser un número' })
  @Min(0, { message: 'La cantidad disponible no puede ser negativa' })
  cantidad_disponible: number;

  @ApiProperty({
    description: 'Estado del inventario',
    example: 'DISPONIBLE',
    enum: ['DISPONIBLE', 'VENCIDO', 'AMARILLO', 'ROJO'],
    default: 'DISPONIBLE',
  })
  @IsOptional()
  @IsIn(['DISPONIBLE', 'VENCIDO', 'AMARILLO', 'ROJO'], {
    message: 'El estado debe ser DISPONIBLE, VENCIDO, AMARILLO o ROJO',
  })
  estado_inventario?: string = 'DISPONIBLE';

  @ApiProperty({
    description: 'Punto de reorden',
    example: 10,
    minimum: 0,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El punto de reorden debe ser un número' })
  @Min(0, { message: 'El punto de reorden no puede ser negativo' })
  punto_reorden?: number = 10;
}