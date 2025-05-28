import { IsNotEmpty, IsString, Length, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMovimientoDto {
  @ApiProperty({
    description: 'ID del inventario afectado',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del inventario es requerido' })
  @IsNumber({}, { message: 'El ID del inventario debe ser un número' })
  id_inventario: number;

  @ApiProperty({
    description: 'ID del usuario que realiza el movimiento',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  id_usuario: number;

  @ApiProperty({
    description: 'ID del lote asociado al movimiento',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del lote es requerido' })
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  id_lote: number;
  
  @ApiProperty({
    description: 'Tipo de movimiento',
    example: 'ENTRADA',
    enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCION'],
  })
  @IsNotEmpty({ message: 'El tipo de movimiento es requerido' })
  @IsIn(['ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCION'], {
    message: 'El tipo debe ser ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE o DEVOLUCION',
  })
  tipo: string;

  @ApiProperty({
    description: 'Cantidad del movimiento',
    example: 50,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @ApiProperty({
    description: 'Motivo del movimiento',
    example: 'Reposición de stock',
    minLength: 5,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  @IsString({ message: 'El motivo debe ser un texto' })
  @Length(5, 200, {
    message: 'El motivo debe tener entre 5 y 200 caracteres',
  })
  motivo: string;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Movimiento autorizado por farmacia central',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;

  @ApiProperty({
    description: 'Fecha del movimiento',
    example: '2024-01-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'La fecha del movimiento es requerida' })
  @IsString({ message: 'La fecha del movimiento debe ser una cadena de texto' })
  fecha_movimiento: Date;

  @ApiProperty({
    description: 'Estado del movimiento',
    example: 'PENDIENTE',
    enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO'],
    default: 'PENDIENTE',
  })
  @IsOptional()
  @IsIn(['PENDIENTE', 'COMPLETADO', 'CANCELADO'], {
    message: 'El estado debe ser PENDIENTE, COMPLETADO o CANCELADO',
  })
  estado?: string = 'PENDIENTE';
}