import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePresentacionDto {
  @ApiProperty({
    description: 'Nombre de la presentación',
    example: 'Tabletas',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre de la presentación es requerido' })
  @IsString({ message: 'El nombre de la presentación debe ser un texto' })
  @Length(2, 100, {
    message: 'El nombre de la presentación debe tener entre 2 y 100 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripción de la presentación',
    example: 'Dosis, Gel, Pastillas, etc.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}