import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Departamento } from '../../departamentos/entities/departamento.entity';
import { Distrito } from '../../distritos/entities/distrito.entity';

@Entity('asignacion_usuario')
export class AsignacionUsuario {
  @ApiProperty({
    description: 'Identificador único de la asignación',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_asignacion: number;

  @ApiProperty({
    description: 'ID del usuario asignado',
    example: 1,
  })
  @Column()
  user_id: number;

  @ApiProperty({
    description: 'ID del departamento (solo para administradores)',
    example: 1,
    required: false,
  })
  @Column({ nullable: true })
  id_departamento: number;

  @ApiProperty({
    description: 'ID del distrito (solo para encargados)',
    example: 1,
    required: false,
  })
  @Column({ nullable: true })
  id_distrito: number;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.id_persona)
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;

  @ManyToOne(() => Departamento, (departamento) => departamento.id_departamento, { nullable: true })
  @JoinColumn({ name: 'id_departamento' })
  departamento: Departamento;

  @ManyToOne(() => Distrito, (distrito) => distrito.id_distrito, { nullable: true })
  @JoinColumn({ name: 'id_distrito' })
  distrito: Distrito;
}