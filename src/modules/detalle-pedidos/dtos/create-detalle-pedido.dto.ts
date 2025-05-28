import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
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
    description: 'Cantidad disponible',
    example: 80,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad disponible debe ser un número' })
  cantidad_disponible?: number;

  @ApiProperty({
    description: 'Cantidad aprobada',
    example: 80,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad aprobada debe ser un número' })
  cantidad_aprobada?: number;
}
