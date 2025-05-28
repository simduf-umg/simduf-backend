import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';

@Entity('detalle_pedidos')
export class DetallePedido {
  @ApiProperty({
    description: 'Identificador único del detalle del pedido',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_detalle: number;

  @ApiProperty({
    description: 'ID del pedido',
    example: 1,
  })
  @Column()
  id_pedido: number;

  @ApiProperty({
    description: 'ID del medicamento',
    example: 1,
  })
  @Column()
  id_medicamento: number;

  @ApiProperty({
    description: 'Cantidad solicitada',
    example: 100,
  })
  @Column({ type: 'int' })
  cantidad_solicitada: number;

  @ApiProperty({
    description: 'Cantidad aprobada',
    example: 80,
  })
  @Column({ type: 'int', nullable: true })
  cantidad_aprobada: number;

  @ApiProperty({
    description: 'Cantidad entregada',
    example: 80,
  })
  @Column({ type: 'int', default: 0 })
  cantidad_entregada: number;

  @ApiProperty({
    description: 'Estado del detalle',
    example: 'PENDIENTE, APROBADO, PARCIAL, COMPLETADO, RECHAZADO',
    enum: ['PENDIENTE', 'APROBADO', 'PARCIAL', 'COMPLETADO', 'RECHAZADO'],
  })
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'PENDIENTE',
    enum: ['PENDIENTE', 'APROBADO', 'PARCIAL', 'COMPLETADO', 'RECHAZADO']
  })
  estado: string;

  @ApiProperty({
    description: 'Observaciones específicas del detalle',
    example: 'Preferir lote más reciente',
  })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ApiProperty({
    description: 'Motivo en caso de rechazo o reducción',
    example: 'Stock insuficiente',
  })
  @Column({ type: 'text', nullable: true })
  motivo_modificacion: string;

  @ApiProperty({
    description: 'Precio unitario en el momento del pedido',
    example: 2.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_unitario: number;

  @ApiProperty({
    description: 'Subtotal del detalle (cantidad_aprobada * precio_unitario)',
    example: 200.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @ApiProperty({
    description: 'Fecha de creación del detalle',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  fecha_creacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-16T15:45:00Z',
  })
  @UpdateDateColumn()
  fecha_actualizacion: Date;

  // Relación con Pedido
  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  // Relación con Medicamento
  @ManyToOne(() => Medicamento, (medicamento) => medicamento.id_medicamento)
  @JoinColumn({ name: 'id_medicamento' })
  medicamento: Medicamento;
}