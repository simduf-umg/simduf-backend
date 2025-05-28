import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../entities/pedido.entity';
import { CreatePedidoDto } from '../dtos/create-pedido.dto';
import { UpdatePedidoDto } from '../dtos/update-pedido.dto';
import { CambiarEstadoPedidoDto } from '../dtos/cambiar-estado-pedido.dto';
import { UsuariosService } from '../../usuarios/services/usuarios.service';
import { DetallePedidosService } from '../../detalle-pedidos/services/detalle-pedidos.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidosRepository: Repository<Pedido>,
    private usuariosService: UsuariosService,
    private detallePedidosService: DetallePedidosService,
  ) {}

  async findAll(): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      relations: [
        'usuario_solicitante',
        'usuario_autorizador',
        'detalles',
        'detalles.medicamento',
      ],
      order: { fecha_solicitud: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
      where: { id_pedido: id },
      relations: [
        'usuario_solicitante',
        'usuario_autorizador',
        'detalles',
        'detalles.medicamento',
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
      order: { fecha_solicitud: 'DESC' },
    });
  }

  async findByUsuarioAutorizador(idUsuario: number): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { id_usuario_autorizador: idUsuario },
      relations: ['usuario_solicitante', 'usuario_autorizador', 'detalles'],
      order: { fecha_solicitud: 'DESC' },
    });
  }

  async findByEstado(estado: string): Promise<Pedido[]> {
    return this.pedidosRepository.find({
      where: { estado },
      relations: ['usuario_solicitante', 'usuario_autorizador', 'detalles'],
      order: { fecha_solicitud: 'DESC' },
    });
  }

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    await this.usuariosService.findOne(createPedidoDto.id_usuario_solicitante);
    await this.usuariosService.findOne(createPedidoDto.id_usuario_autorizador);

    const { detalles, ...resto } = createPedidoDto;

    const pedidoData = {
      ...resto,
      fecha_solicitud: new Date(),
      estado: 'PENDIENTE',
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

    Object.assign(pedido, updatePedidoDto);

    return this.pedidosRepository.save(pedido);
  }

  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoPedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);
    const estadoAnterior = pedido.estado;

    // Solo permitir transiciones válidas según el modelo
    const transicionesValidas = {
      'PENDIENTE': ['APROBADO', 'RECHAZADO'],
      'APROBADO': [],
      'RECHAZADO': ['PENDIENTE'],
    };

    if (!transicionesValidas[estadoAnterior]?.includes(cambiarEstadoDto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${estadoAnterior} a ${cambiarEstadoDto.estado}`
      );
    }

    pedido.estado = cambiarEstadoDto.estado;

    if (cambiarEstadoDto.id_usuario_autorizador) {
      await this.usuariosService.findOne(cambiarEstadoDto.id_usuario_autorizador);
      pedido.id_usuario_autorizador = cambiarEstadoDto.id_usuario_autorizador;
    }

    if (cambiarEstadoDto.observaciones) {
      pedido.observaciones = cambiarEstadoDto.observaciones;
    }

    if (cambiarEstadoDto.estado === 'APROBADO') {
      pedido.fecha_autorizacion = new Date();
    }

    await this.pedidosRepository.save(pedido);

    return this.findOne(pedido.id_pedido);
  }

  async remove(id: number): Promise<void> {
    const pedido = await this.findOne(id);

    if (!['PENDIENTE', 'RECHAZADO'].includes(pedido.estado)) {
      throw new BadRequestException('Solo se pueden eliminar pedidos pendientes o rechazados');
    }

    await this.pedidosRepository.delete(pedido.id_pedido);
  }

  async getEstadisticasPedidos(): Promise<any> {
    const total = await this.pedidosRepository.count();
    const pendientes = await this.pedidosRepository.count({ where: { estado: 'PENDIENTE' } });
    const aprobados = await this.pedidosRepository.count({ where: { estado: 'APROBADO' } });
    const rechazados = await this.pedidosRepository.count({ where: { estado: 'RECHAZADO' } });

    return {
      total,
      porEstado: {
        pendientes,
        aprobados,
        rechazados,
      },
    };
  }
}
