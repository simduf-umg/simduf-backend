import { IsNotEmpty, IsNumber, Min } from 'class-validator';
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
}
