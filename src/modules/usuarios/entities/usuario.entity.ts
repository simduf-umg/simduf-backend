import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Persona } from '../../personas/entities/persona.entity';
import { Rol } from '../../roles/entities/rol.entity';

@Entity('usuarios')
export class Usuario {
  @ApiProperty({
    description: 'Identificador único del usuario',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  user_id: number;

  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'juanperez',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  correo: string;

  @ApiProperty({
    description: 'Contraseña encriptada del usuario',
    example: '$2b$10$abcdefghijklmnopqrstuvwxyz',
  })
  @Column({ type: 'varchar', length: 100 })
  contrasena: string;

  @ApiProperty({
    description: 'Fecha de registro del usuario',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @ApiProperty({
    description: 'Estado del usuario (activo/inactivo)',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ApiProperty({
    description: 'ID de la persona asociada al usuario',
    example: 1,
  })
  @Column()
  id_persona: number;

  @ManyToOne(() => Persona, (persona) => persona.usuarios)
  @JoinColumn({ name: 'id_persona' })
  persona: Persona;

  @ManyToMany(() => Rol, (rol) => rol.usuarios)
  @JoinTable({
    name: 'usuario_rol',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'id_rol',
      referencedColumnName: 'id_rol',
    },
  })
  roles: Rol[];
}