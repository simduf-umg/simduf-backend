import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'juanperez',
    minLength: 4,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  @Length(4, 50, {
    message: 'El nombre de usuario debe tener entre 4 y 50 caracteres',
  })
  username: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com',
    minLength: 5,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsString({ message: 'El correo debe ser un texto' })
  @Length(5, 100, {
    message: 'El correo debe tener entre 5 y 100 caracteres',
  })
  correo: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Contr@seña123',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @Length(8, 20, {
    message: 'La contraseña debe tener entre 8 y 20 caracteres',
  })
  contrasena: string;

  @ApiProperty({
    description: 'Estado del usuario (activo/inactivo)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un booleano' })
  activo?: boolean;

  @ApiProperty({
    description: 'ID de la persona asociada al usuario',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de persona es requerido' })
  @IsNumber({}, { message: 'El ID de persona debe ser un número' })
  id_persona: number;

  @ApiProperty({
    description: 'IDs de los roles asignados al usuario',
    example: [1, 2],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { each: true, message: 'Los IDs de roles deben ser números' })
  rolIds?: number[];
}