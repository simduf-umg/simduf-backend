import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';

@Entity('presentaciones')
export class Presentacion {
  @ApiProperty({
    description: 'Identificador único de la presentación',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_presentacion: number;

  @ApiProperty({
    description: 'Nombre de la presentación',
    example: 'Tabletas',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Descripción de la presentación',
    example: 'Dosis, Gel, Pastillas, etc.',
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Relación con Medicamentos
  @OneToMany(() => Medicamento, (medicamento) => medicamento.presentacion)
  medicamentos: Medicamento[];
}