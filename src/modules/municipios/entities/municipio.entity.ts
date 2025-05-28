import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Departamento } from '../../departamentos/entities/departamento.entity';
import { Distrito } from '../../distritos/entities/distrito.entity';

@Entity('municipios')
export class Municipio {
  @ApiProperty({
    description: 'Identificador único del municipio',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_municipio: number;

  @ApiProperty({
    description: 'Nombre del municipio',
    example: 'Guatemala',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'ID del departamento al que pertenece',
    example: 1,
  })
  @Column()
  id_departamento: number;

  // Relación con Departamento
  @ManyToOne(() => Departamento, (departamento) => departamento.municipios)
  @JoinColumn({ name: 'id_departamento' })
  departamento: Departamento;

  // Relación con Distritos
  @OneToMany(() => Distrito, (distrito) => distrito.municipio)
  distritos: Distrito[];
}