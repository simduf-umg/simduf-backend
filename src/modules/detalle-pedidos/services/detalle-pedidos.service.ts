import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { CreateDetallePedidoDto } from '../dtos/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from '../dtos/update-detalle-pedido.dto';
import { AprobarDetalleDto } from '../dtos/aprobar-detalle.dto';
import { RegistrarEntregaDto } from '../dtos/registrar-entrega.dto';
import { PedidosService } from '../../pedidos/services/pedidos.service';
import { MedicamentosService } from '../../medicamentos/services/medicamentos.service';

@Injectable()
export class DetallePedidosService {
  constructor(
    @InjectRepository(DetallePedido)
    private detallePedidosRepository: Repository<DetallePedido>,
    private medicamentosService: MedicamentosService,
  ) {}

  async findAll(): Promise<DetallePedido[]> {
    return this.detallePedidosRepository.find({
      relations: [
        'pedido',
        'pedido.usuario_solicitante',
        'pedido.usuario_solicitante.persona',
        'medicamento',
        'medicamento.presentacion',
        'medicamento.concentracion'
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DetallePedido> {
    const detalle = await this.detallePedidosRepository.findOne({
      where: { id_detalle: id },
      relations: [
        'pedido',
        'pedido.usuario_solicitante',
        'pedido.usuario_solicitante.persona',
        'pedido.usuario_autorizador',
        'pedido.usuario_autorizador.persona',
        'medicamento',
        'medicamento.presentacion',
        'medicamento.concentracion'
      ],
    });
    if (!detalle) {
      throw new NotFoundException(`Detalle de pedido con ID ${id} no encontrado`);
    }
    return detalle;
  }

  async findByPedido(idPedido: number): Promise<DetallePedido[]> {
    return this.detallePedidosRepository.find({
      where: { id_pedido: idPedido },
      relations: [
        'medicamento',
        'medicamento.presentacion',
        'medicamento.concentracion'
      ],
      order: { fecha_creacion: 'ASC' },
    });
  }

  async findByMedicamento(idMedicamento: number): Promise<DetallePedido[]> {
    return this.detallePedidosRepository.find({
      where: { id_medicamento: idMedicamento },
      relations: [
        'pedido',
        'pedido.usuario_solicitante',
        'medicamento'
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findByEstado(estado: string): Promise<DetallePedido[]> {
    return this.detallePedidosRepository.find({
      where: { estado },
      relations: [
        'pedido',
        'pedido.usuario_solicitante',
        'medicamento',
        'medicamento.presentacion'
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findDetallesPendientesAprobacion(): Promise<DetallePedido[]> {
    return this.detallePedidosRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.pedido', 'pedido')
      .leftJoinAndSelect('detalle.medicamento', 'medicamento')
      .leftJoinAndSelect('medicamento.presentacion', 'presentacion')
      .where('detalle.estado = :estado', { estado: 'PENDIENTE' })
      .andWhere('pedido.estado IN (:...estados)', { estados: ['APROBADO', 'EN_PROCESO'] })
      .orderBy('pedido.prioridad', 'ASC')
      .addOrderBy('detalle.fecha_creacion', 'ASC')
      .getMany();
  }

  async findDetallesPendientesEntrega(): Promise<DetallePedido[]> {
    return this.detallePedidosRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.pedido', 'pedido')
      .leftJoinAndSelect('detalle.medicamento', 'medicamento')
      .where('detalle.estado IN (:...estados)', { estados: ['APROBADO', 'PARCIAL'] })
      .andWhere('detalle.cantidad_entregada < detalle.cantidad_aprobada')
      .orderBy('pedido.prioridad', 'ASC')
      .addOrderBy('detalle.fecha_actualizacion', 'ASC')
      .getMany();
  }

  async create(createDetallePedidoDto: CreateDetallePedidoDto): Promise<DetallePedido> {
    // Verificar que el medicamento existe
    await this.medicamentosService.findOne(createDetallePedidoDto.id_medicamento);
    
    // Verificar que no existe ya este medicamento en el mismo pedido
    const detalleExistente = await this.detallePedidosRepository.findOne({
      where: {
        id_pedido: createDetallePedidoDto.id_pedido,
        id_medicamento: createDetallePedidoDto.id_medicamento,
      },
    });
    
    if (detalleExistente) {
      throw new ConflictException(
        `El medicamento ya está incluido en este pedido. Use la actualización para modificar la cantidad.`
      );
    }
    
    const detalle = this.detallePedidosRepository.create(createDetallePedidoDto);
    
    // Calcular subtotal si se proporciona precio
    if (createDetallePedidoDto.precio_unitario) {
      detalle.subtotal = createDetallePedidoDto.cantidad_solicitada * createDetallePedidoDto.precio_unitario;
    }
    
    return this.detallePedidosRepository.save(detalle);
  }

  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto): Promise<DetallePedido> {
    const detalle = await this.findOne(id);
    
    // Solo se puede actualizar si está pendiente
    if (detalle.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden actualizar detalles pendientes');
    }
    
    // Solo se puede actualizar si el pedido está pendiente
    if (detalle.pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden actualizar detalles de pedidos pendientes');
    }
    
    if (updateDetallePedidoDto.id_medicamento && updateDetallePedidoDto.id_medicamento !== detalle.id_medicamento) {
      await this.medicamentosService.findOne(updateDetallePedidoDto.id_medicamento);
      
      // Verificar que el nuevo medicamento no esté ya en el pedido
      const detalleExistente = await this.detallePedidosRepository.findOne({
        where: {
          id_pedido: detalle.id_pedido,
          id_medicamento: updateDetallePedidoDto.id_medicamento,
        },
      });
      
      if (detalleExistente && detalleExistente.id_detalle !== id) {
        throw new ConflictException('El medicamento ya está incluido en este pedido');
      }
    }
    
    Object.assign(detalle, updateDetallePedidoDto);
    
    // Recalcular subtotal si cambia cantidad o precio
    if (detalle.precio_unitario && (updateDetallePedidoDto.cantidad_solicitada || updateDetallePedidoDto.precio_unitario)) {
      detalle.subtotal = detalle.cantidad_solicitada * detalle.precio_unitario;
    }
    
    return this.detallePedidosRepository.save(detalle);
  }

  async aprobar(id: number, aprobarDetalleDto: AprobarDetalleDto): Promise<DetallePedido> {
    const detalle = await this.findOne(id);
    
    // Validar que se puede aprobar
    if (!['PENDIENTE', 'PARCIAL'].includes(detalle.estado)) {
      throw new BadRequestException('Solo se pueden aprobar detalles pendientes o parciales');
    }
    
    // Validar cantidad aprobada
    if (aprobarDetalleDto.cantidad_aprobada > detalle.cantidad_solicitada) {
      throw new BadRequestException('La cantidad aprobada no puede ser mayor a la solicitada');
    }
    
    // Actualizar detalle
    detalle.cantidad_aprobada = aprobarDetalleDto.cantidad_aprobada;
    detalle.estado = aprobarDetalleDto.estado;
    
    if (aprobarDetalleDto.motivo_modificacion) {
      detalle.motivo_modificacion = aprobarDetalleDto.motivo_modificacion;
    }
    
    if (aprobarDetalleDto.observaciones) {
      detalle.observaciones = aprobarDetalleDto.observaciones;
    }
    
    if (aprobarDetalleDto.precio_unitario !== undefined) {
      detalle.precio_unitario = aprobarDetalleDto.precio_unitario;
    }
    
    // Calcular subtotal
    if (detalle.precio_unitario && detalle.cantidad_aprobada) {
      detalle.subtotal = detalle.cantidad_aprobada * detalle.precio_unitario;
    }
    
    return this.detallePedidosRepository.save(detalle);
  }

  async registrarEntrega(id: number, registrarEntregaDto: RegistrarEntregaDto): Promise<DetallePedido> {
    const detalle = await this.findOne(id);
    
    // Validar que se puede entregar
    if (!['APROBADO', 'PARCIAL'].includes(detalle.estado)) {
      throw new BadRequestException('Solo se pueden entregar detalles aprobados o parciales');
    }
    
    // Validar cantidad entregada
    const cantidadTotalEntregada = detalle.cantidad_entregada + registrarEntregaDto.cantidad_entregada;
    if (cantidadTotalEntregada > detalle.cantidad_aprobada) {
      throw new BadRequestException(
        `La cantidad total entregada (${cantidadTotalEntregada}) no puede ser mayor a la aprobada (${detalle.cantidad_aprobada})`
      );
    }
    
    // Actualizar cantidad entregada
    detalle.cantidad_entregada = cantidadTotalEntregada;
    
    // Actualizar observaciones si se proporcionan
    if (registrarEntregaDto.observaciones) {
      const observacionesActuales = detalle.observaciones || '';
      detalle.observaciones = observacionesActuales 
        ? `${observacionesActuales} | ${registrarEntregaDto.observaciones}`
        : registrarEntregaDto.observaciones;
    }
    
    // Actualizar estado según entrega
    if (detalle.cantidad_entregada === detalle.cantidad_aprobada) {
      detalle.estado = 'COMPLETADO';
    } else if (detalle.cantidad_entregada > 0) {
      detalle.estado = 'PARCIAL';
    }
    
    return this.detallePedidosRepository.save(detalle);
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.findOne(id);
    
    // Solo se puede eliminar si está pendiente
    if (detalle.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden eliminar detalles pendientes');
    }
    
    // Solo se puede eliminar si el pedido está pendiente
    if (detalle.pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden eliminar detalles de pedidos pendientes');
    }
    
    await this.detallePedidosRepository.delete(detalle.id_detalle);
  }

  async getEstadisticasDetalle(idPedido?: number) {
    const whereCondition = idPedido ? { id_pedido: idPedido } : {};

    const total = await this.detallePedidosRepository.count({ where: whereCondition });
    const pendientes = await this.detallePedidosRepository.count({ 
      where: { ...whereCondition, estado: 'PENDIENTE' }
    });
    const aprobados = await this.detallePedidosRepository.count({ 
      where: { ...whereCondition, estado: 'APROBADO' }
    });
    const parciales = await this.detallePedidosRepository.count({ 
      where: { ...whereCondition, estado: 'PARCIAL' }
    });
    const completados = await this.detallePedidosRepository.count({ 
      where: { ...whereCondition, estado: 'COMPLETADO' }
    });
    const rechazados = await this.detallePedidosRepository.count({ 
      where: { ...whereCondition, estado: 'RECHAZADO' }
    });

    // Estadísticas de cantidades
    const resultado = await this.detallePedidosRepository
      .createQueryBuilder('detalle')
      .select([
        'SUM(detalle.cantidad_solicitada) as totalSolicitado',
        'SUM(detalle.cantidad_aprobada) as totalAprobado',
        'SUM(detalle.cantidad_entregada) as totalEntregado',
        'SUM(detalle.subtotal) as montoTotal'
      ])
      .where(idPedido ? 'detalle.id_pedido = :idPedido' : '1=1', { idPedido })
      .getRawOne();

    return {
      total,
      porEstado: {
        pendientes,
        aprobados,
        parciales,
        completados,
        rechazados,
      },
      cantidades: {
        totalSolicitado: parseInt(resultado.totalSolicitado) || 0,
        totalAprobado: parseInt(resultado.totalAprobado) || 0,
        totalEntregado: parseInt(resultado.totalEntregado) || 0,
        montoTotal: parseFloat(resultado.montoTotal) || 0,
      },
    };
  }

  async verificarCompletitudPedido(idPedido: number): Promise<boolean> {
    const detalles = await this.findByPedido(idPedido);
    return detalles.every(detalle => 
      ['COMPLETADO', 'RECHAZADO'].includes(detalle.estado) || 
      detalle.cantidad_entregada === detalle.cantidad_aprobada
    );
  }
}