import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Distrito } from '../../distritos/entities/distrito.entity';

@Entity('seguimientos')
export class Seguimiento {
  @ApiProperty({ description: 'Identificador único del seguimiento', example: 1 })
  @PrimaryGeneratedColumn()
  id_seguimiento: number;

  @ApiProperty({ description: 'ID del usuario administrador', example: 1 })
  @Column()
  id_usuario_admin: number;

  @ApiProperty({ description: 'ID del distrito', example: 1 })
  @Column()
  id_distrito: number;

  @ApiProperty({ description: 'Fecha de la visita', example: '2024-01-15' })
  @Column({ type: 'date' })
  fecha_visita: Date;

  @ApiProperty({ description: 'Fortalezas observadas', example: 'Buena organización' })
  @Column({ type: 'text', nullable: true })
  fortalezas: string;

  @ApiProperty({ description: 'Debilidades observadas', example: 'Falta de insumos' })
  @Column({ type: 'text', nullable: true })
  debilidades: string;

  @ApiProperty({ description: 'Sugerencias', example: 'Mejorar almacenamiento' })
  @Column({ type: 'text', nullable: true })
  sugerencias: string;

  @ApiProperty({ description: 'Conclusiones', example: 'Visita satisfactoria' })
  @Column({ type: 'text', nullable: true })
  conclusiones: string;

  // Relaciones (opcional, si quieres acceder a los objetos relacionados)
  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'id_usuario_admin' })
  usuario_admin: Usuario;

  @ManyToOne(() => Distrito, { eager: false })
  @JoinColumn({ name: 'id_distrito' })
  distrito: Distrito;
}