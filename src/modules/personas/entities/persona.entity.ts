import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('personas')
export class Persona {
  @ApiProperty({
    description: 'Identificador único de la persona',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_persona: number;

  @ApiProperty({
    description: 'Nombre de la persona',
    example: 'Juan',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Apellido de la persona',
    example: 'Pérez',
  })
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @ApiProperty({
    description: 'Fecha de nacimiento de la persona',
    example: '1990-01-01',
  })
  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  // Relación con Usuarios
  @OneToMany(() => Usuario, (usuario) => usuario.persona)
  usuarios: Usuario[];
}