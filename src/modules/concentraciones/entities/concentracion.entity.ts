import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';

@Entity('concentraciones')
export class Concentracion {
  @ApiProperty({
    description: 'Identificador único de la concentración',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_concentracion: number;

  @ApiProperty({
    description: 'Valor de la concentración',
    example: '500',
  })
  @Column({ type: 'varchar', length: 50 })
  valor: string;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'mg, ml, etc.',
  })
  @Column({ type: 'varchar', length: 20 })
  unidad_medida: string;

  // Relación con Medicamentos
  @OneToMany(() => Medicamento, (medicamento) => medicamento.concentracion)
  medicamentos: Medicamento[];
}