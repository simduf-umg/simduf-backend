import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Municipio } from '../../municipios/entities/municipio.entity';

@Entity('distritos')
export class Distrito {
  @ApiProperty({
    description: 'Identificador único del distrito',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_distrito: number;

  @ApiProperty({
    description: 'Nombre del distrito',
    example: 'Distrito Central',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'ID del municipio al que pertenece',
    example: 1,
  })
  @Column()
  id_municipio: number;

  // Relación con Municipio
  @ManyToOne(() => Municipio, (municipio) => municipio.distritos)
  @JoinColumn({ name: 'id_municipio' })
  municipio: Municipio;

}