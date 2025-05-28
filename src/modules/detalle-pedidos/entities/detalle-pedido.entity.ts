import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';

@Entity('detalle_pedidos')
export class DetallePedido {
  @ApiProperty({ description: 'ID del detalle', example: 1 })
  @PrimaryGeneratedColumn()
  id_detalle: number;

  @ApiProperty({ description: 'ID del pedido', example: 1 })
  @Column()
  id_pedido: number;

  @ApiProperty({ description: 'ID del medicamento', example: 1 })
  @Column()
  id_medicamento: number;

  @ApiProperty({ description: 'Cantidad solicitada', example: 100 })
  @Column({ type: 'int' })
  cantidad_solicitada: number;

  @ApiProperty({ description: 'Cantidad disponible', example: 80 })
  @Column({ type: 'int', nullable: true })
  cantidad_disponible: number;

  @ApiProperty({ description: 'Cantidad aprobada', example: 80 })
  @Column({ type: 'int', nullable: true })
  cantidad_aprobada: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne(() => Medicamento)
  @JoinColumn({ name: 'id_medicamento' })
  medicamento: Medicamento;
}