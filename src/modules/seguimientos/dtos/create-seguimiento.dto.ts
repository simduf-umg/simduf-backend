import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSeguimientoDto {
  @ApiProperty({
    description: 'ID del usuario administrador',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del usuario administrador es requerido' })
  @IsNumber({}, { message: 'El ID del usuario administrador debe ser un número' })
  id_usuario_admin: number;

  @ApiProperty({
    description: 'ID del distrito',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del distrito es requerido' })
  @IsNumber({}, { message: 'El ID del distrito debe ser un número' })
  id_distrito: number;

  @ApiProperty({
    description: 'Fecha de la visita',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'La fecha de visita es requerida' })
  @IsDateString({}, { message: 'La fecha de visita debe ser una fecha válida' })
  fecha_visita: Date;

  @ApiProperty({
    description: 'Fortalezas observadas',
    example: 'Buena organización',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las fortalezas deben ser un texto' })
  fortalezas?: string;

  @ApiProperty({
    description: 'Debilidades observadas',
    example: 'Falta de insumos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las debilidades deben ser un texto' })
  debilidades?: string;

  @ApiProperty({
    description: 'Sugerencias',
    example: 'Mejorar almacenamiento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las sugerencias deben ser un texto' })
  sugerencias?: string;

  @ApiProperty({
    description: 'Conclusiones',
    example: 'Visita satisfactoria',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las conclusiones deben ser un texto' })
  conclusiones?: string;
}