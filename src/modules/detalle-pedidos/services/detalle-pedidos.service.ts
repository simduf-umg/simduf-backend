import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { CreateDetallePedidoDto } from '../dtos/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from '../dtos/update-detalle-pedido.dto';
import { AprobarDetalleDto } from '../dtos/aprobar-detalle.dto';
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
      relations: ['pedido', 'medicamento'],
      order: { id_detalle: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DetallePedido> {
    const detalle = await this.detallePedidosRepository.findOne({
      where: { id_detalle: id },
      relations: ['pedido', 'medicamento'],
    });
    if (!detalle) {
      throw new NotFoundException(`Detalle de pedido con ID ${id} no encontrado`);
    }
    return detalle;
  }

  async findByPedido(idPedido: number): Promise<DetallePedido[]> {
    return this.detallePedidosRepository.find({
      where: { id_pedido: idPedido },
      relations: ['medicamento'],
      order: { id_detalle: 'ASC' },
    });
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
    return this.detallePedidosRepository.save(detalle);
  }

  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto): Promise<DetallePedido> {
    const detalle = await this.findOne(id);
    Object.assign(detalle, updateDetallePedidoDto);
    return this.detallePedidosRepository.save(detalle);
  }

  async aprobar(id: number, aprobarDetalleDto: AprobarDetalleDto): Promise<DetallePedido> {
    const detalle = await this.findOne(id);

    // Validar cantidad aprobada
    if (aprobarDetalleDto.cantidad_aprobada > detalle.cantidad_solicitada) {
      throw new ConflictException('La cantidad aprobada no puede ser mayor a la solicitada');
    }

    detalle.cantidad_aprobada = aprobarDetalleDto.cantidad_aprobada;
    return this.detallePedidosRepository.save(detalle);
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.findOne(id);
    await this.detallePedidosRepository.delete(detalle.id_detalle);
  }
}