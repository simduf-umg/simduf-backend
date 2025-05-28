import { IsNotEmpty, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del movimiento',
    example: 'COMPLETADO',
    enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO'],
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsIn(['PENDIENTE', 'COMPLETADO', 'CANCELADO'], {
    message: 'El estado debe ser PENDIENTE, COMPLETADO o CANCELADO',
  })
  estado: string;

  @ApiProperty({
    description: 'Observaciones del cambio de estado',
    example: 'Movimiento completado exitosamente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;
}