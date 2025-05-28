import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCantidadDto {
  @ApiProperty({
    description: 'Nueva cantidad disponible',
    example: 150,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad: number;
}