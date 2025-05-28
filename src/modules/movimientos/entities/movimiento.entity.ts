import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Inventario } from '../../inventarios/entities/inventario.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

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
    description: 'ID del usuario que realizó el movimiento',
    example: 1,
  })
  @Column()
  id_usuario: number;

  @ApiProperty({
    description: 'ID del lote asociado al movimiento',
    example: 1,
  })
  @Column()
  id_lote: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    example: 'Entrada, Salida',
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
    description: 'Motivo del movimiento',
    example: 'Pedido, Solicitud',
  })
  @Column({ type: 'varchar', length: 200 })
  motivo: string;

  @ApiProperty({
    description: 'Fecha del movimiento',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  fecha_movimiento: Date;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Movimiento autorizado por farmacia central',
  })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ApiProperty({
    description: 'Estado del movimiento',
    example: 'PENDIENTE, COMPLETADO, CANCELADO',
    enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO'],
  })
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'PENDIENTE',
    enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO']
  })
  estado: string;

  // Relación con Inventario
  @ManyToOne(() => Inventario, (inventario) => inventario.movimientos)
  @JoinColumn({ name: 'id_inventario' })
  inventario: Inventario;

  // Relación con Usuario
  @ManyToOne(() => Usuario, (usuario) => usuario.id_persona)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

}