import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Inventario } from '../../inventarios/entities/inventario.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Lote } from '../../lotes/entities/lote.entity';

@Entity('movimientos')
export class Movimiento {
  @ApiProperty({
    description: 'Identificador único del movimiento',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id_movimiento: number;

  @ApiProperty({
    description: 'ID del inventario afectado',
    example: 1,
  })
  @Column()
  id_inventario: number;

  @ApiProperty({
    description: 'ID del lote asociado al movimiento',
    example: 1,
  })
  @Column()
  id_lote: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    example: 'ENTRADA',
    enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCION'],
  })
  @Column({ 
    type: 'varchar', 
    length: 20,
    enum: ['ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCION']
  })
  tipo: string;

  @ApiProperty({
    description: 'Cantidad del movimiento',
    example: 50,
  })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({
    description: 'Fecha del movimiento',
    example: '2024-01-15T10:30:00Z',
  })
  @Column({ type: 'timestamp' })
  fecha_movimiento: Date;

  @ApiProperty({
    description: 'Motivo del movimiento',
    example: 'Pedido, Solicitud',
  })
  @Column({ type: 'varchar', length: 200 })
  motivo: string;

  @ApiProperty({
    description: 'ID del usuario que registra el movimiento',
    example: 1,
  })
  @Column()
  user_id: number;

  // Relaciones
  @ManyToOne(() => Inventario)
  @JoinColumn({ name: 'id_inventario' })
  inventario: Inventario;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'id_lote' })
  lote: Lote;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;
}