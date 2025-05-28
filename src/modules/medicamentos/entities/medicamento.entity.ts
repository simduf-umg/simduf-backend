import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Presentacion } from '../../presentaciones/entities/presentacion.entity';
import { Concentracion } from '../../concentraciones/entities/concentracion.entity';
import { Lote } from '../../lotes/entities/lote.entity';
import { Inventario } from '../../inventarios/entities/inventario.entity';

@Entity('medicamentos')
export class Medicamento {
  @ApiProperty({
    description: 'Identificador único del medicamento',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_medicamento: number;

  @ApiProperty({
    description: 'Nombre del medicamento',
    example: 'Paracetamol',
  })
  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @ApiProperty({
    description: 'Código único del medicamento',
    example: 'PAR-500-TAB',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string;

  @ApiProperty({
    description: 'Descripción del medicamento',
    example: 'Analgésico y antipirético',
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({
    description: 'ID de la presentación',
    example: 1,
  })
  @Column()
  id_presentacion: number;

  @ApiProperty({
    description: 'ID de la concentración',
    example: 1,
  })
  @Column()
  id_concentracion: number;

  // Relación con Presentación
  @ManyToOne(() => Presentacion, (presentacion) => presentacion.medicamentos)
  @JoinColumn({ name: 'id_presentacion' })
  presentacion: Presentacion;

  // Relación con Concentración
  @ManyToOne(() => Concentracion, (concentracion) => concentracion.medicamentos)
  @JoinColumn({ name: 'id_concentracion' })
  concentracion: Concentracion;

  // Relación con Lotes
  @OneToMany(() => Lote, (lote) => lote.medicamento)
  lotes: Lote[];

  // Relación con Inventarios
  @OneToMany(() => Inventario, (inventario) => inventario.medicamento)
  inventarios: Inventario[];
}