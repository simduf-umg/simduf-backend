import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltrosSeguimientoDto {
  @ApiProperty({
    description: 'ID del seguimiento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del seguimiento debe ser un número' })
  id_seguimiento?: number;

  @ApiProperty({
    description: 'ID del usuario administrador',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del usuario administrador debe ser un número' })
  id_usuario_admin?: number;

  @ApiProperty({
    description: 'ID del distrito',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del distrito debe ser un número' })
  id_distrito?: number;

  @ApiProperty({
    description: 'Fecha de inicio (visita)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fecha_inicio?: string;

  @ApiProperty({
    description: 'Fecha de fin (visita)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fecha_fin?: string;

  @ApiProperty({
    description: 'Página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  pagina?: number = 1;

  @ApiProperty({
    description: 'Límite de resultados por página',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  limite?: number = 20;
}