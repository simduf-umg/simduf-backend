import { IsNotEmpty, IsString, Length, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicamentoDto {
  @ApiProperty({
    description: 'Nombre del medicamento',
    example: 'Paracetamol',
    minLength: 2,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'El nombre del medicamento es requerido' })
  @IsString({ message: 'El nombre del medicamento debe ser un texto' })
  @Length(2, 200, {
    message: 'El nombre del medicamento debe tener entre 2 y 200 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'Código único del medicamento',
    example: 'PAR-500-TAB',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El código del medicamento es requerido' })
  @IsString({ message: 'El código del medicamento debe ser un texto' })
  @Length(3, 100, {
    message: 'El código del medicamento debe tener entre 3 y 100 caracteres',
  })
  codigo: string;

  @ApiProperty({
    description: 'Descripción del medicamento',
    example: 'Analgésico y antipirético',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'ID de la presentación',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la presentación es requerido' })
  @IsNumber({}, { message: 'El ID de la presentación debe ser un número' })
  id_presentacion: number;

  @ApiProperty({
    description: 'ID de la concentración',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la concentración es requerido' })
  @IsNumber({}, { message: 'El ID de la concentración debe ser un número' })
  id_concentracion: number;
}