import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';
import { Lote } from '../../lotes/entities/lote.entity';
import { Distrito } from '../../distritos/entities/distrito.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('inventarios')
export class Inventario {
  @ApiProperty({
    description: 'Identificador único del inventario',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_inventario: number;

  @ApiProperty({
    description: 'ID del medicamento',
    example: 1,
  })
  @Column()
  id_medicamento: number;

  @ApiProperty({
    description: 'ID del lote',
    example: 1,
  })
  @Column()
  id_lote: number;

  @ApiProperty({
    description: 'ID del distrito',
    example: 1,
  })
  @Column()
  id_distrito: number;

  @ApiProperty({
    description: 'Cantidad disponible',
    example: 100,
  })
  @Column({ type: 'int', default: 0 })
  cantidad_disponible: number;

  @ApiProperty({
    description: 'Estado del inventario',
    example: 'Vencido, Amarillo, Rojo',
    enum: ['DISPONIBLE', 'VENCIDO', 'AMARILLO', 'ROJO'],
  })
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'DISPONIBLE',
    enum: ['DISPONIBLE', 'VENCIDO', 'AMARILLO', 'ROJO']
  })
  estado_inventario: string;

  @ApiProperty({
    description: 'Punto de reorden',
    example: 10,
  })
  @Column({ type: 'int', default: 10 })
  punto_reorden: number;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  fecha_creacion: Date;

  // Relación con Medicamento
  @ManyToOne(() => Medicamento, (medicamento) => medicamento.inventarios)
  @JoinColumn({ name: 'id_medicamento' })
  medicamento: Medicamento;

  // Relación con Lote
  @ManyToOne(() => Lote, (lote) => lote.inventarios)
  @JoinColumn({ name: 'id_lote' })
  lote: Lote;

  // Relación con Distrito
  @ManyToOne(() => Distrito, (distrito) => distrito.id_distrito)
  @JoinColumn({ name: 'id_distrito' })
  distrito: Distrito;

  // Relación con Movimientos
  @OneToMany(() => Movimiento, (movimiento) => movimiento.inventario)
  movimientos: Movimiento[];
}