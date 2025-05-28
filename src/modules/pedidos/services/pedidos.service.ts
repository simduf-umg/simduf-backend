import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pedido } from '../entities/pedido.entity';
import { CreatePedidoDto } from '../dtos/create-pedido.dto';
import { UpdatePedidoDto } from '../dtos/update-pedido.dto';
import { CambiarEstadoPedidoDto } from '../dtos/cambiar-estado-pedido.dto';
import { UsuariosService } from '../../usuarios/services/usuarios.service';
import { DetallePedidosService } from '../../detalle-pedidos/services/detalle-pedidos.service';
import { SeguimientosService } from '../../seguimientos/services/seguimientos.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidosRepository: Repository<Pedido>,
    private usuariosService: UsuariosService,
    private detallePedidosService: DetallePedidosService,
    private seguimientosService: SeguimientosService,
  ) {}

  async findAll(): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      relations: [
        'usuario_solicitante',
        'usuario_solicitante.persona',
        'usuario_autorizador',
        'usuario_autorizador.persona',
        'detalles',
        'detalles.medicamento',
        'seguimientos'
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
      where: { id_pedido: id },
      relations: [
        'usuario_solicitante',
        'usuario_solicitante.persona',
        'usuario_autorizador',
        'usuario_autorizador.persona',
        'detalles',
        'detalles.medicamento',
        'detalles.medicamento.presentacion',
        'detalles.medicamento.concentracion',
        'seguimientos',
        'seguimientos.usuario',
        'seguimientos.usuario.persona'
      ],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return pedido;
  }

  async findByUsuarioSolicitante(idUsuario: number): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { id_usuario_solicitante: idUsuario },
      relations: ['usuario_solicitante', 'usuario_autorizador', 'detalles'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findByUsuarioAutorizador(idUsuario: number): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { id_usuario_autorizador: idUsuario },
      relations: ['usuario_solicitante', 'usuario_autorizador', 'detalles'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findByEstado(estado: string): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { estado },
      relations: ['usuario_solicitante', 'usuario_autorizador', 'detalles'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findByPrioridad(prioridad: string): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { prioridad },
      relations: ['usuario_solicitante', 'detalles'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findByFechas(fechaInicio: Date, fechaFin: Date): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: {
        fecha_pedido: Between(fechaInicio, fechaFin),
      },
      relations: ['usuario_solicitante', 'usuario_autorizador', 'detalles'],
      order: { fecha_pedido: 'DESC' },
    });
  }

  async findPedidosPendientes(): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { estado: 'PENDIENTE' },
      relations: ['usuario_solicitante', 'detalles', 'detalles.medicamento'],
      order: { prioridad: 'ASC', fecha_creacion: 'ASC' },
    });
  }

  async findPedidosVencidos(): Promise<Pedido[]> {
    const fechaActual = new Date();
    return this.pedidosRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.usuario_solicitante', 'usuario_solicitante')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .where('pedido.fecha_limite_requerida < :fecha', { fecha: fechaActual })
      .andWhere('pedido.estado NOT IN (:...estados)', { estados: ['COMPLETADO', 'CANCELADO', 'RECHAZADO'] })
      .orderBy('pedido.fecha_limite_requerida', 'ASC')
      .getMany();
  }

  async findPedidosProximosVencer(dias: number = 3): Promise<Pedido[]> {
    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaActual.getDate() + dias);

    return this.pedidosRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.usuario_solicitante', 'usuario_solicitante')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .where('pedido.fecha_limite_requerida BETWEEN :fechaActual AND :fechaLimite', {
        fechaActual,
        fechaLimite,
      })
      .andWhere('pedido.estado NOT IN (:...estados)', { estados: ['COMPLETADO', 'CANCELADO', 'RECHAZADO'] })
      .orderBy('pedido.fecha_limite_requerida', 'ASC')
      .getMany();
  }

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    await this.usuariosService.findOne(createPedidoDto.id_usuario_solicitante);

    const { detalles, ...resto } = createPedidoDto;

    const pedidoData = {
      ...resto,
      fecha_pedido: new Date(),
      fecha_limite_requerida: createPedidoDto.fecha_limite_requerida
        ? new Date(createPedidoDto.fecha_limite_requerida)
        : undefined,
    };

    const pedido = this.pedidosRepository.create(pedidoData);
    const pedidoGuardado = await this.pedidosRepository.save(pedido);

    for (const detalle of detalles) {
      await this.detallePedidosService.create({
        id_pedido: pedidoGuardado.id_pedido,
        ...detalle,
      });
    }

    return this.findOne(pedidoGuardado.id_pedido);
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);

    if (pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden actualizar pedidos pendientes');
    }

    if (updatePedidoDto.fecha_limite_requerida) {
      pedido.fecha_limite_requerida = new Date(updatePedidoDto.fecha_limite_requerida);
    }

    Object.assign(pedido, updatePedidoDto);

    return this.pedidosRepository.save(pedido);
  }

  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoPedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);
    const estadoAnterior = pedido.estado;

    this.validarTransicionEstado(estadoAnterior, cambiarEstadoDto.estado);

    pedido.estado = cambiarEstadoDto.estado;

    if (cambiarEstadoDto.id_usuario_autorizador) {
      await this.usuariosService.findOne(cambiarEstadoDto.id_usuario_autorizador);
      pedido.id_usuario_autorizador = cambiarEstadoDto.id_usuario_autorizador;
    }

    if (cambiarEstadoDto.observaciones) {
      pedido.observaciones = cambiarEstadoDto.observaciones;
    }

    if (cambiarEstadoDto.motivo_rechazo) {
      pedido.motivo_rechazo = cambiarEstadoDto.motivo_rechazo;
    }

    const fechaActual = new Date();
    if (cambiarEstadoDto.estado === 'APROBADO') {
      pedido.fecha_autorizacion = fechaActual;
    } else if (cambiarEstadoDto.estado === 'COMPLETADO') {
      pedido.fecha_completado = fechaActual;
    }

    const pedidoActualizado = await this.pedidosRepository.save(pedido);

    return this.findOne(pedidoActualizado.id_pedido);
  }

  private validarTransicionEstado(estadoAnterior: string, estadoNuevo: string): void {
    const transicionesValidas = {
      'PENDIENTE': ['APROBADO', 'RECHAZADO', 'CANCELADO'],
      'APROBADO': ['EN_PROCESO', 'CANCELADO'],
      'EN_PROCESO': ['COMPLETADO', 'CANCELADO'],
      'RECHAZADO': ['PENDIENTE'],
      'COMPLETADO': [],
      'CANCELADO': ['PENDIENTE'],
    };

    if (!transicionesValidas[estadoAnterior]?.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${estadoAnterior} a ${estadoNuevo}`
      );
    }
  }

  async remove(id: number): Promise<void> {
    const pedido = await this.findOne(id);

    if (!['PENDIENTE', 'RECHAZADO', 'CANCELADO'].includes(pedido.estado)) {
      throw new BadRequestException('Solo se pueden eliminar pedidos pendientes, rechazados o cancelados');
    }

    await this.pedidosRepository.delete(pedido.id_pedido);
  }

  async getEstadisticasPedidos(fechaInicio?: Date, fechaFin?: Date) {
    const whereCondition = fechaInicio && fechaFin
      ? { fecha_pedido: Between(fechaInicio, fechaFin) }
      : {};

    const total = await this.pedidosRepository.count({ where: whereCondition });
    const pendientes = await this.pedidosRepository.count({ 
      where: { ...whereCondition, estado: 'PENDIENTE' }
    });
    const aprobados = await this.pedidosRepository.count({ 
      where: { ...whereCondition, estado: 'APROBADO' }
    });
    const rechazados = await this.pedidosRepository.count({ 
      where: { ...whereCondition, estado: 'RECHAZADO' }
    });
    const enProceso = await this.pedidosRepository.count({ 
      where: { ...whereCondition, estado: 'EN_PROCESO' }
    });
    const completados = await this.pedidosRepository.count({ 
      where: { ...whereCondition, estado: 'COMPLETADO' }
    });
    const cancelados = await this.pedidosRepository.count({ 
      where: { ...whereCondition, estado: 'CANCELADO' }
    });

    const prioridadAlta = await this.pedidosRepository.count({ 
      where: { ...whereCondition, prioridad: 'ALTA' }
    });
    const prioridadMedia = await this.pedidosRepository.count({ 
      where: { ...whereCondition, prioridad: 'MEDIA' }
    });
    const prioridadBaja = await this.pedidosRepository.count({ 
      where: { ...whereCondition, prioridad: 'BAJA' }
    });

    return {
      total,
      porEstado: {
        pendientes,
        aprobados,
        rechazados,
        enProceso,
        completados,
        cancelados,
      },
      porPrioridad: {
        alta: prioridadAlta,
        media: prioridadMedia,
        baja: prioridadBaja,
      },
    };
  }
}
