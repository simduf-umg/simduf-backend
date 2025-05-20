import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMIN',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @IsString({ message: 'El nombre del rol debe ser un texto' })
  @Length(2, 50, {
    message: 'El nombre del rol debe tener entre 2 y 50 caracteres',
  })
  nombre_rol: string;
}