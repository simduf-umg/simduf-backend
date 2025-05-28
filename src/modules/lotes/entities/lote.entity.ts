import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';
import { Inventario } from '../../inventarios/entities/inventario.entity';

@Entity('lotes')
export class Lote {
  @ApiProperty({
    description: 'Identificador único del lote',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_lote: number;

  @ApiProperty({
    description: 'ID del medicamento al que pertenece',
    example: 1,
  })
  @Column()
  id_medicamento: number;

  @ApiProperty({
    description: 'Número del lote',
    example: 'LOT-2024-001',
  })
  @Column({ type: 'varchar', length: 100 })
  numero_lote: string;

  @ApiProperty({
    description: 'Fecha de fabricación',
    example: '2025-12-31',
  })
  @Column({ type: 'date' })
  fecha_fabricacion: Date;

  @ApiProperty({
    description: 'Fecha de caducidad',
    example: '2025-12-31',
  })
  @Column({ type: 'date' })
  fecha_caducidad: Date;

  @ApiProperty({
    description: 'Cantidad inicial del lote',
    example: 500,
  })
  @Column({ type: 'int', default: 0 })
  cantidad_inicial: number;

  @ApiProperty({
    description: 'Cantidad actual disponible',
    example: 500,
  })
  @Column({ type: 'int', default: 0 })
  cantidad_actual: number;

  // Relación con Medicamento
  @ManyToOne(() => Medicamento, (medicamento) => medicamento.lotes)
  @JoinColumn({ name: 'id_medicamento' })
  medicamento: Medicamento;

  // Relación con Inventarios
  @OneToMany(() => Inventario, (inventario) => inventario.lote)
  inventarios: Inventario[];
}