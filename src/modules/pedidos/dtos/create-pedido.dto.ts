import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DetallePedidoDto {
  @ApiProperty({
    description: 'ID del medicamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del medicamento es requerido' })
  @IsNumber({}, { message: 'El ID del medicamento debe ser un número' })
  id_medicamento: number;

  @ApiProperty({
    description: 'Cantidad solicitada',
    example: 50,
  })
  @IsNotEmpty({ message: 'La cantidad solicitada es requerida' })
  @IsNumber({}, { message: 'La cantidad solicitada debe ser un número' })
  cantidad_solicitada: number;

  @ApiProperty({
    description: 'Observaciones específicas del item',
    example: 'Preferir lote más reciente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;
}

export class CreatePedidoDto {
  @ApiProperty({
    description: 'ID del usuario solicitante',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del usuario solicitante es requerido' })
  @IsNumber({}, { message: 'El ID del usuario solicitante debe ser un número' })
  id_usuario_solicitante: number;

  @ApiProperty({
    description: 'ID del usuario autorizador',
    example: 2,
  })
  @IsNotEmpty({ message: 'El ID del usuario autorizador es requerido' })
  @IsNumber({}, { message: 'El ID del usuario autorizador debe ser un número' })
  id_usuario_autorizador: number;

  @ApiProperty({
    description: 'Observaciones del pedido',
    example: 'Pedido urgente para distrito central',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;

  @ApiProperty({
    description: 'Detalles del pedido (medicamentos solicitados)',
    type: [DetallePedidoDto],
  })
  @IsNotEmpty({ message: 'Los detalles del pedido son requeridos' })
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un medicamento' })
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoDto)
  detalles: DetallePedidoDto[];
}
