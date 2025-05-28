import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Movimiento } from '../entities/movimiento.entity';
import { CreateMovimientoDto } from '../dtos/create-movimiento.dto';
import { UpdateMovimientoDto } from '../dtos/update-movimiento.dto';
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
        'lote'
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
        'lote'
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
      relations: ['inventario', 'usuario', 'usuario.persona', 'lote'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByUsuario(user_id: number): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: { user_id },
      relations: ['inventario', 'inventario.medicamento', 'usuario', 'lote'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByTipo(tipo: string): Promise<Movimiento[]> {
    if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
      throw new BadRequestException('Tipo de movimiento inválido');
    }
    return this.movimientosRepository.find({
      where: { tipo },
      relations: ['inventario', 'inventario.medicamento', 'usuario', 'lote'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async findByFechas(fechaInicio: Date, fechaFin: Date): Promise<Movimiento[]> {
    return this.movimientosRepository.find({
      where: {
        fecha_movimiento: Between(fechaInicio, fechaFin),
      },
      relations: ['inventario', 'inventario.medicamento', 'usuario', 'lote'],
      order: { fecha_movimiento: 'DESC' },
    });
  }

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    // Verificar que el inventario existe
    await this.inventariosService.findOne(createMovimientoDto.id_inventario);

    // Verificar que el usuario existe
    await this.usuariosService.findOne(createMovimientoDto.user_id);

    // Validar que hay suficiente stock para salidas
    if (
      createMovimientoDto.tipo === 'SALIDA'
    ) {
      const inventario = await this.inventariosService.findOne(createMovimientoDto.id_inventario);
      if (inventario.cantidad_disponible < createMovimientoDto.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${inventario.cantidad_disponible}, Solicitado: ${createMovimientoDto.cantidad}`
        );
      }
      // Actualizar inventario
      await this.inventariosService.updateCantidad(
        inventario.id_inventario,
        inventario.cantidad_disponible - createMovimientoDto.cantidad
      );
    }

    if (createMovimientoDto.tipo === 'ENTRADA') {
      const inventario = await this.inventariosService.findOne(createMovimientoDto.id_inventario);
      await this.inventariosService.updateCantidad(
        inventario.id_inventario,
        inventario.cantidad_disponible + createMovimientoDto.cantidad
      );
    }

    const movimiento = this.movimientosRepository.create(createMovimientoDto);
    return this.movimientosRepository.save(movimiento);
  }

  async update(id: number, updateMovimientoDto: UpdateMovimientoDto): Promise<Movimiento> {
    const movimiento = await this.findOne(id);

    if (updateMovimientoDto.id_inventario) {
      await this.inventariosService.findOne(updateMovimientoDto.id_inventario);
      movimiento.id_inventario = updateMovimientoDto.id_inventario;
    }

    if (updateMovimientoDto.user_id) {
      await this.usuariosService.findOne(updateMovimientoDto.user_id);
      movimiento.user_id = updateMovimientoDto.user_id;
    }

    Object.assign(movimiento, updateMovimientoDto);

    return this.movimientosRepository.save(movimiento);
  }

  async remove(id: number): Promise<void> {
    const movimiento = await this.findOne(id);
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

    return {
      total,
      porTipo: {
        entradas,
        salidas,
      }
    };
  }
}