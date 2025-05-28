import { IsNotEmpty, IsIn, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoPedidoDto {
  @ApiProperty({
    description: 'Nuevo estado del pedido',
    example: 'APROBADO',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'],
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsIn(['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'], {
    message: 'El estado debe ser PENDIENTE, APROBADO, RECHAZADO, EN_PROCESO, COMPLETADO o CANCELADO',
  })
  estado: string;

  @ApiProperty({
    description: 'ID del usuario que autoriza/rechaza',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario autorizador debe ser un número' })
  id_usuario_autorizador?: number;

  @ApiProperty({
    description: 'Observaciones del cambio de estado',
    example: 'Pedido aprobado, proceder con la entrega',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;

  @ApiProperty({
    description: 'Motivo en caso de rechazo',
    example: 'Stock insuficiente para algunos medicamentos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El motivo de rechazo debe ser un texto' })
  motivo_rechazo?: string;
}