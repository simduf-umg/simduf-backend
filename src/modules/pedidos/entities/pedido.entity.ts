import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePedido } from '../../detalle-pedidos/entities/detalle-pedido.entity';
import { Seguimiento } from '../../seguimientos/entities/seguimiento.entity';

@Entity('pedidos')
export class Pedido {
  @ApiProperty({
    description: 'Identificador único del pedido',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_pedido: number;

  @ApiProperty({
    description: 'ID del usuario solicitante',
    example: 1,
  })
  @Column()
  id_usuario_solicitante: number;

  @ApiProperty({
    description: 'ID del usuario autorizador',
    example: 2,
  })
  @Column({ nullable: true })
  id_usuario_autorizador: number;

  @ApiProperty({
    description: 'Fecha del pedido',
    example: '2024-01-15',
  })
  @Column({ type: 'date' })
  fecha_pedido: Date;

  @ApiProperty({
    description: 'Fecha límite requerida',
    example: '2024-01-20',
  })
  @Column({ type: 'date', nullable: true })
  fecha_limite_requerida: Date;

  @ApiProperty({
    description: 'Estado del pedido',
    example: 'Pendiente, Aprobado, Rechazado, En proceso, Completado',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'],
  })
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'PENDIENTE',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO']
  })
  estado: string;

  @ApiProperty({
    description: 'Observaciones del pedido',
    example: 'Pedido urgente para distrito central',
  })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ApiProperty({
    description: 'Motivo en caso de rechazo',
    example: 'Stock insuficiente',
  })
  @Column({ type: 'text', nullable: true })
  motivo_rechazo: string;

  @ApiProperty({
    description: 'Prioridad del pedido',
    example: 'ALTA, MEDIA, BAJA',
    enum: ['ALTA', 'MEDIA', 'BAJA'],
  })
  @Column({ 
    type: 'varchar', 
    length: 10, 
    default: 'MEDIA',
    enum: ['ALTA', 'MEDIA', 'BAJA']
  })
  prioridad: string;

  @ApiProperty({
    description: 'Fecha de autorización',
    example: '2024-01-16T10:30:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  fecha_autorizacion: Date;

  @ApiProperty({
    description: 'Fecha de completado',
    example: '2024-01-18T15:45:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  fecha_completado: Date;

  @ApiProperty({
    description: 'Fecha de creación del pedido',
    example: '2024-01-15T08:00:00Z',
  })
  @CreateDateColumn()
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-16T10:30:00Z',
  })
  @UpdateDateColumn()
  fecha_actualizacion: Date;

  // Relación con Usuario Solicitante
  @ManyToOne(() => Usuario, (usuario) => usuario.id_persona)
  @JoinColumn({ name: 'id_usuario_solicitante' })
  usuario_solicitante: Usuario;

  // Relación con Usuario Autorizador
  @ManyToOne(() => Usuario, (usuario) => usuario.id_persona)
  @JoinColumn({ name: 'id_usuario_autorizador' })
  usuario_autorizador: Usuario;

  // Relación con Detalle de Pedidos
  @OneToMany(() => DetallePedido, (detalle) => detalle.id_pedido)
  detalles: DetallePedido[];

}