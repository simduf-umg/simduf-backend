import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegistrarEntregaDto {
  @ApiProperty({
    description: 'Cantidad entregada',
    example: 80,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'La cantidad entregada es requerida' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad entregada debe ser un número' })
  @Min(0, { message: 'La cantidad entregada no puede ser negativa' })
  cantidad_entregada: number;

  @ApiProperty({
    description: 'Observaciones de la entrega',
    example: 'Entregado lote LOT-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;
}