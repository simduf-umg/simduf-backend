import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Movimiento } from '../entities/movimiento.entity';
import { CreateMovimientoDto } from '../dtos/create-movimiento.dto';
import { UpdateMovimientoDto } from '../dtos/update-movimiento.dto';
import { CambiarEstadoDto } from '../dtos/cambiar-estado.dto';
import { InventariosService } from '../../inventarios/services/inventarios.service';
import { UsuariosService } from '../../usuarios/services/usuarios.service';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private movimientosRepository: Repository<Movimiento>,
    private inventariosService: InventariosService,
    private usuariosService: UsuariosService,
  ) {}

  async findAll(): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      relations: [
        'inventario',
        'inventario.medicamento',
        'inventario.lote',
        'inventario.distrito',
        'usuario',
        'usuario.persona',
        'detalles'
      ],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Movimiento> {
    const movimiento = await this.movimientosRepository.findOne({
      where: { id_movimiento: id },
      relations: [
        'inventario',
        'inventario.medicamento',
        'inventario.lote',
        'inventario.distrito',
        'usuario',
        'usuario.persona',
        'detalles'
      ],
    });
    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }
    return movimiento;
  }

  async findByInventario(idInventario: number): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: { id_inventario: idInventario },
      relations: ['inventario', 'usuario', 'usuario.persona'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByUsuario(idUsuario: number): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: { id_usuario: idUsuario },
      relations: ['inventario', 'inventario.medicamento', 'usuario'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByTipo(tipo: string): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: { tipo },
      relations: ['inventario', 'inventario.medicamento', 'usuario'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByEstado(estado: string): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: { estado },
      relations: ['inventario', 'inventario.medicamento', 'usuario'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByFechas(fechaInicio: Date, fechaFin: Date): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: {
        fecha_movimiento: Between(fechaInicio, fechaFin),
      },
      relations: ['inventario', 'inventario.medicamento', 'usuario'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findMovimientosPendientes(): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: { estado: 'PENDIENTE' },
      relations: ['inventario', 'inventario.medicamento', 'usuario'],
      order: { fecha_movimiento: 'ASC' },
    });
  }

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    // Verificar que el inventario existe
    const inventario = await this.inventariosService.findOne(createMovimientoDto.id_inventario);
    
    // Verificar que el usuario existe
    await this.usuariosService.findOne(createMovimientoDto.id_usuario);
    
    // Validar que hay suficiente stock para salidas
    if (createMovimientoDto.tipo === 'SALIDA' && 
        inventario.cantidad_disponible < createMovimientoDto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${inventario.cantidad_disponible}, Solicitado: ${createMovimientoDto.cantidad}`
      );
    }
    
    const movimiento = this.movimientosRepository.create(createMovimientoDto);
    const movimientoGuardado = await this.movimientosRepository.save(movimiento);
    
    // Si el movimiento se crea como COMPLETADO, actualizar el inventario automáticamente
    if (createMovimientoDto.estado === 'COMPLETADO') {
      await this.procesarMovimiento(movimientoGuardado.id_movimiento);
    }
    
    return movimientoGuardado;
  }

  async update(id: number, updateMovimientoDto: UpdateMovimientoDto): Promise<Movimiento> {
    const movimiento = await this.findOne(id);
    
    // Solo se puede actualizar si está pendiente
    if (movimiento.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden actualizar movimientos pendientes');
    }
    
    if (updateMovimientoDto.id_inventario) {
      await this.inventariosService.findOne(updateMovimientoDto.id_inventario);
      movimiento.id_inventario = updateMovimientoDto.id_inventario;
    }
    
    if (updateMovimientoDto.id_usuario) {
      await this.usuariosService.findOne(updateMovimientoDto.id_usuario);
      movimiento.id_usuario = updateMovimientoDto.id_usuario;
    }
    
    Object.assign(movimiento, updateMovimientoDto);
    
    return this.movimientosRepository.save(movimiento);
  }

  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoDto): Promise<Movimiento> {
    const movimiento = await this.findOne(id);
    
    const estadoAnterior = movimiento.estado;
    movimiento.estado = cambiarEstadoDto.estado;
    
    if (cambiarEstadoDto.observaciones) {
      movimiento.observaciones = cambiarEstadoDto.observaciones;
    }
    
    const movimientoActualizado = await this.movimientosRepository.save(movimiento);
    
    // Procesar el movimiento si se cambia a COMPLETADO
    if (estadoAnterior !== 'COMPLETADO' && cambiarEstadoDto.estado === 'COMPLETADO') {
      await this.procesarMovimiento(id);
    }
    
    // Revertir el movimiento si se cambia de COMPLETADO a CANCELADO
    if (estadoAnterior === 'COMPLETADO' && cambiarEstadoDto.estado === 'CANCELADO') {
      await this.revertirMovimiento(id);
    }
    
    return movimientoActualizado;
  }

  private async procesarMovimiento(idMovimiento: number): Promise<void> {
    const movimiento = await this.findOne(idMovimiento);
    const inventario = movimiento.inventario;
    
    let nuevaCantidad = inventario.cantidad_disponible;
    
    switch (movimiento.tipo) {
      case 'ENTRADA':
      case 'DEVOLUCION':
        nuevaCantidad += movimiento.cantidad;
        break;
      case 'SALIDA':
        nuevaCantidad -= movimiento.cantidad;
        if (nuevaCantidad < 0) {
          throw new BadRequestException('Stock insuficiente para procesar el movimiento');
        }
        break;
      case 'AJUSTE':
        nuevaCantidad = movimiento.cantidad; // La cantidad del ajuste es la nueva cantidad total
        break;
      case 'TRANSFERENCIA':
        nuevaCantidad -= movimiento.cantidad;
        if (nuevaCantidad < 0) {
          throw new BadRequestException('Stock insuficiente para la transferencia');
        }
        break;
    }
    
    await this.inventariosService.updateCantidad(inventario.id_inventario, nuevaCantidad);
  }

  private async revertirMovimiento(idMovimiento: number): Promise<void> {
    const movimiento = await this.findOne(idMovimiento);
    const inventario = movimiento.inventario;
    
    let nuevaCantidad = inventario.cantidad_disponible;
    
    // Revertir la operación original
    switch (movimiento.tipo) {
      case 'ENTRADA':
      case 'DEVOLUCION':
        nuevaCantidad -= movimiento.cantidad;
        if (nuevaCantidad < 0) {
          throw new BadRequestException('No se puede revertir: resultaría en cantidad negativa');
        }
        break;
      case 'SALIDA':
      case 'TRANSFERENCIA':
        nuevaCantidad += movimiento.cantidad;
        break;
      case 'AJUSTE':
        throw new BadRequestException('No se puede revertir un ajuste automáticamente');
    }
    
    await this.inventariosService.updateCantidad(inventario.id_inventario, nuevaCantidad);
  }

  async remove(id: number): Promise<void> {
    const movimiento = await this.findOne(id);
    
    // Solo se puede eliminar si está pendiente o cancelado
    if (movimiento.estado === 'COMPLETADO') {
      throw new BadRequestException('No se puede eliminar un movimiento completado');
    }
    
    await this.movimientosRepository.delete(movimiento.id_movimiento);
  }

  async getEstadisticasMovimientos(fechaInicio?: Date, fechaFin?: Date) {
    const whereCondition = fechaInicio && fechaFin 
      ? { fecha_movimiento: Between(fechaInicio, fechaFin) }
      : {};

    const total = await this.movimientosRepository.count({ where: whereCondition });
    const entradas = await this.movimientosRepository.count({ 
      where: { ...whereCondition, tipo: 'ENTRADA' }
    });
    const salidas = await this.movimientosRepository.count({ 
      where: { ...whereCondition, tipo: 'SALIDA' }
    });
    const transferencias = await this.movimientosRepository.count({ 
      where: { ...whereCondition, tipo: 'TRANSFERENCIA' }
    });
    const ajustes = await this.movimientosRepository.count({ 
      where: { ...whereCondition, tipo: 'AJUSTE' }
    });
    const devoluciones = await this.movimientosRepository.count({ 
      where: { ...whereCondition, tipo: 'DEVOLUCION' }
    });
    
    const pendientes = await this.movimientosRepository.count({ 
      where: { ...whereCondition, estado: 'PENDIENTE' }
    });
    const completados = await this.movimientosRepository.count({ 
      where: { ...whereCondition, estado: 'COMPLETADO' }
    });
    const cancelados = await this.movimientosRepository.count({ 
      where: { ...whereCondition, estado: 'CANCELADO' }
    });

    return {
      total,
      porTipo: {
        entradas,
        salidas,
        transferencias,
        ajustes,
        devoluciones,
      },
      porEstado: {
        pendientes,
        completados,
        cancelados,
      },
    };
  }
}