import { IsNotEmpty, IsNumber, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AprobarDetalleDto {
  @ApiProperty({
    description: 'Cantidad aprobada',
    example: 80,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'La cantidad aprobada es requerida' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad aprobada debe ser un número' })
  @Min(0, { message: 'La cantidad aprobada no puede ser negativa' })
  cantidad_aprobada: number;

  @ApiProperty({
    description: 'Estado del detalle',
    example: 'APROBADO',
    enum: ['APROBADO', 'PARCIAL', 'RECHAZADO'],
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsIn(['APROBADO', 'PARCIAL', 'RECHAZADO'], {
    message: 'El estado debe ser APROBADO, PARCIAL o RECHAZADO',
  })
  estado: string;

  @ApiProperty({
    description: 'Motivo en caso de modificación o rechazo',
    example: 'Stock insuficiente, solo disponible cantidad parcial',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser un texto' })
  motivo_modificacion?: string;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Se entregará de lote más antiguo disponible',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;

  @ApiProperty({
    description: 'Precio unitario actualizado',
    example: 2.75,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario?: number;
}
