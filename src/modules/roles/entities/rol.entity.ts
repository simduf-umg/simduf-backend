import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('roles')
export class Rol {
  @ApiProperty({
    description: 'Identificador único del rol',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_rol: number;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMIN',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  nombre_rol: string;

  @ManyToMany(() => Usuario, (usuario) => usuario.roles)
  usuarios: Usuario[];
}