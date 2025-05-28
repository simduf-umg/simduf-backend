import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePedido } from '../../detalle-pedidos/entities/detalle-pedido.entity';

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
  @Column()
  id_usuario_autorizador: number;

  @ApiProperty({
    description: 'Fecha de solicitud',
    example: '2024-01-15',
  })
  @Column({ type: 'date' })
  fecha_solicitud: Date;

  @ApiProperty({
    description: 'Fecha de autorización',
    example: '2024-01-16',
  })
  @Column({ type: 'date', nullable: true })
  fecha_autorizacion: Date;

  @ApiProperty({
    description: 'Fecha despachada',
    example: '2024-01-17',
  })
  @Column({ type: 'date', nullable: true })
  fecha_despachada: Date;

  @ApiProperty({
    description: 'Fecha llegada distrito',
    example: '2024-01-18',
  })
  @Column({ type: 'date', nullable: true })
  fecha_llegada_distrito: Date;

  @ApiProperty({
    description: 'Estado del pedido',
    example: 'Pendiente, Aprobado, Rechazado',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO'],
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDIENTE',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO'],
  })
  estado: string;

  @ApiProperty({
    description: 'Observaciones del pedido',
    example: 'Pedido urgente para distrito central',
  })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Relaciones
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario_solicitante' })
  usuario_solicitante: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario_autorizador' })
  usuario_autorizador: Usuario;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido)
  detalles: DetallePedido[];
}