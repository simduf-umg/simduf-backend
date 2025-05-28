import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventario } from '../entities/inventario.entity';
import { CreateInventarioDto } from '../dtos/create-inventario.dto';
import { UpdateInventarioDto } from '../dtos/update-inventario.dto';
import { MedicamentosService } from '../../medicamentos/services/medicamentos.service';
import { LotesService } from '../../lotes/services/lotes.service';
import { DistritosService } from '../../distritos/services/distritos.service';

@Injectable()
export class InventariosService {
  constructor(
    @InjectRepository(Inventario)
    private inventariosRepository: Repository<Inventario>,
    private medicamentosService: MedicamentosService,
    private lotesService: LotesService,
    private distritosService: DistritosService,
  ) {}

  async findAll(): Promise<Inventario[]> {
    return this.inventariosRepository.find({
      relations: [
        'medicamento', 
        'medicamento.presentacion', 
        'medicamento.concentracion',
        'lote',
        'distrito',
        'distrito.municipio',
        'distrito.municipio.departamento'
      ],
    });
  }

  async findOne(id: number): Promise<Inventario> {
    const inventario = await this.inventariosRepository.findOne({
      where: { id_inventario: id },
      relations: [
        'medicamento', 
        'medicamento.presentacion', 
        'medicamento.concentracion',
        'lote',
        'distrito',
        'distrito.municipio',
        'distrito.municipio.departamento'
      ],
    });
    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }
    return inventario;
  }

  async findByMedicamento(idMedicamento: number): Promise<Inventario[]> {
    return this.inventariosRepository.find({
      where: { id_medicamento: idMedicamento },
      relations: ['medicamento', 'lote', 'distrito'],
    });
  }

  async findByDistrito(idDistrito: number): Promise<Inventario[]> {
    return this.inventariosRepository.find({
      where: { id_distrito: idDistrito },
      relations: ['medicamento', 'lote', 'distrito'],
    });
  }

  async findByLote(idLote: number): Promise<Inventario[]> {
    return this.inventariosRepository.find({
      where: { id_lote: idLote },
      relations: ['medicamento', 'lote', 'distrito'],
    });
  }

  async findByEstado(estado: string): Promise<Inventario[]> {
    return this.inventariosRepository.find({
      where: { estado_inventario: estado },
      relations: ['medicamento', 'lote', 'distrito'],
    });
  }

  async findInventariosBajoStock(): Promise<Inventario[]> {
    return this.inventariosRepository
      .createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.medicamento', 'medicamento')
      .leftJoinAndSelect('inventario.lote', 'lote')
      .leftJoinAndSelect('inventario.distrito', 'distrito')
      .where('inventario.cantidad_disponible <= inventario.punto_reorden')
      .getMany();
  }

  async findInventariosVencidos(): Promise<Inventario[]> {
    const fechaActual = new Date();
    return this.inventariosRepository
      .createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.medicamento', 'medicamento')
      .leftJoinAndSelect('inventario.lote', 'lote')
      .leftJoinAndSelect('inventario.distrito', 'distrito')
      .where('lote.fecha_caducidad <= :fecha', { fecha: fechaActual })
      .getMany();
  }

  async findInventariosProximosVencer(dias: number = 30): Promise<Inventario[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);
    
    return this.inventariosRepository
      .createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.medicamento', 'medicamento')
      .leftJoinAndSelect('inventario.lote', 'lote')
      .leftJoinAndSelect('inventario.distrito', 'distrito')
      .where('lote.fecha_caducidad <= :fechaLimite', { fechaLimite })
      .andWhere('lote.fecha_caducidad > :fechaActual', { fechaActual: new Date() })
      .getMany();
  }

  async create(createInventarioDto: CreateInventarioDto): Promise<Inventario> {
    // Verificar que el medicamento existe
    await this.medicamentosService.findOne(createInventarioDto.id_medicamento);
    
    // Verificar que el lote existe
    await this.lotesService.findOne(createInventarioDto.id_lote);
    
    // Verificar que el distrito existe
    await this.distritosService.findOne(createInventarioDto.id_distrito);
    
    // Verificar que no existe inventario duplicado para el mismo medicamento, lote y distrito
    const inventarioExistente = await this.inventariosRepository.findOne({
      where: {
        id_medicamento: createInventarioDto.id_medicamento,
        id_lote: createInventarioDto.id_lote,
        id_distrito: createInventarioDto.id_distrito,
      },
    });
    
    if (inventarioExistente) {
      throw new ConflictException(
        `Ya existe un inventario para este medicamento, lote y distrito`
      );
    }
    
    const inventario = this.inventariosRepository.create(createInventarioDto);
    return this.inventariosRepository.save(inventario);
  }

  async update(id: number, updateInventarioDto: UpdateInventarioDto): Promise<Inventario> {
    const inventario = await this.findOne(id);
    
    if (updateInventarioDto.id_medicamento) {
      await this.medicamentosService.findOne(updateInventarioDto.id_medicamento);
      inventario.id_medicamento = updateInventarioDto.id_medicamento;
    }
    
    if (updateInventarioDto.id_lote) {
      await this.lotesService.findOne(updateInventarioDto.id_lote);
      inventario.id_lote = updateInventarioDto.id_lote;
    }
    
    if (updateInventarioDto.id_distrito) {
      await this.distritosService.findOne(updateInventarioDto.id_distrito);
      inventario.id_distrito = updateInventarioDto.id_distrito;
    }
    
    if (updateInventarioDto.cantidad_disponible !== undefined) {
      inventario.cantidad_disponible = updateInventarioDto.cantidad_disponible;
    }
    
    if (updateInventarioDto.estado_inventario) {
      inventario.estado_inventario = updateInventarioDto.estado_inventario;
    }
    
    if (updateInventarioDto.punto_reorden !== undefined) {
      inventario.punto_reorden = updateInventarioDto.punto_reorden;
    }
    
    return this.inventariosRepository.save(inventario);
  }

  async updateCantidad(id: number, nuevaCantidad: number): Promise<Inventario> {
    const inventario = await this.findOne(id);
    inventario.cantidad_disponible = nuevaCantidad;
    
    // Actualizar estado basado en la cantidad
    if (nuevaCantidad <= inventario.punto_reorden) {
      inventario.estado_inventario = 'ROJO';
    } else if (nuevaCantidad <= inventario.punto_reorden * 2) {
      inventario.estado_inventario = 'AMARILLO';
    } else {
      inventario.estado_inventario = 'DISPONIBLE';
    }
    
    return this.inventariosRepository.save(inventario);
  }

  async actualizarEstadosPorVencimiento(): Promise<void> {
    const fechaActual = new Date();
    const fechaProximoVencimiento = new Date();
    fechaProximoVencimiento.setDate(fechaActual.getDate() + 30);

    // Marcar como vencidos
    await this.inventariosRepository
      .createQueryBuilder()
      .update(Inventario)
      .set({ estado_inventario: 'VENCIDO' })
      .where('id_lote IN (SELECT id_lote FROM lotes WHERE fecha_caducidad <= :fecha)', {
        fecha: fechaActual,
      })
      .execute();

    // Marcar como próximos a vencer (amarillo)
    await this.inventariosRepository
      .createQueryBuilder()
      .update(Inventario)
      .set({ estado_inventario: 'AMARILLO' })
      .where('id_lote IN (SELECT id_lote FROM lotes WHERE fecha_caducidad > :fechaActual AND fecha_caducidad <= :fechaProximo)', {
        fechaActual,
        fechaProximo: fechaProximoVencimiento,
      })
      .andWhere('estado_inventario != :vencido', { vencido: 'VENCIDO' })
      .execute();
  }

  async remove(id: number): Promise<void> {
    const inventario = await this.findOne(id);
    await this.inventariosRepository.delete(inventario.id_inventario);
  }

  async getEstadisticasInventario() {
    const total = await this.inventariosRepository.count();
    const disponibles = await this.inventariosRepository.count({
      where: { estado_inventario: 'DISPONIBLE' }
    });
    const vencidos = await this.inventariosRepository.count({
      where: { estado_inventario: 'VENCIDO' }
    });
    const amarillos = await this.inventariosRepository.count({
      where: { estado_inventario: 'AMARILLO' }
    });
    const rojos = await this.inventariosRepository.count({
      where: { estado_inventario: 'ROJO' }
    });

    return {
      total,
      disponibles,
      vencidos,
      amarillos,
      rojos,
    };
  }
}