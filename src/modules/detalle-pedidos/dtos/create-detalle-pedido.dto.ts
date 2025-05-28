import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDetallePedidoDto {
  @ApiProperty({
    description: 'ID del pedido',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del pedido es requerido' })
  @IsNumber({}, { message: 'El ID del pedido debe ser un número' })
  id_pedido: number;

  @ApiProperty({
    description: 'ID del medicamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del medicamento es requerido' })
  @IsNumber({}, { message: 'El ID del medicamento debe ser un número' })
  id_medicamento: number;

  @ApiProperty({
    description: 'Cantidad solicitada',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'La cantidad solicitada es requerida' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad solicitada debe ser un número' })
  @Min(1, { message: 'La cantidad solicitada debe ser mayor a 0' })
  cantidad_solicitada: number;

  @ApiProperty({
    description: 'Observaciones específicas del detalle',
    example: 'Preferir lote más reciente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;

  @ApiProperty({
    description: 'Precio unitario en el momento del pedido',
    example: 2.50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario?: number;
}
