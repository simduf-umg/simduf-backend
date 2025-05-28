import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Municipio } from '../../municipios/entities/municipio.entity';

@Entity('departamentos')
export class Departamento {
  @ApiProperty({
    description: 'Identificador único del departamento',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_departamento: number;

  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Guatemala',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Relación con Municipios
  @OneToMany(() => Municipio, (municipio) => municipio.departamento)
  municipios: Municipio[];
}