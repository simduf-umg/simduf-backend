import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from '../entities/lote.entity';
import { CreateLoteDto } from '../dtos/create-lote.dto';
import { UpdateLoteDto } from '../dtos/update-lote.dto';
import { MedicamentosService } from '../../medicamentos/services/medicamentos.service';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private lotesRepository: Repository<Lote>,
    private medicamentosService: MedicamentosService,
  ) {}

  async findAll(): Promise<Lote[]> {
    return this.lotesRepository.find({
      relations: ['medicamento', 'medicamento.presentacion', 'medicamento.concentracion'],
    });
  }

  async findOne(id: number): Promise<Lote> {
    const lote = await this.lotesRepository.findOne({
      where: { id_lote: id },
      relations: ['medicamento', 'medicamento.presentacion', 'medicamento.concentracion'],
    });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }
    return lote;
  }

  async findByMedicamento(idMedicamento: number): Promise<Lote[]> {
    return this.lotesRepository.find({
      where: { id_medicamento: idMedicamento },
      relations: ['medicamento', 'medicamento.presentacion', 'medicamento.concentracion'],
    });
  }

  async findLotesCaducados(): Promise<Lote[]> {
    const fechaActual = new Date();
    return this.lotesRepository
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.medicamento', 'medicamento')
      .where('lote.fecha_caducidad <= :fecha', { fecha: fechaActual })
      .getMany();
  }

  async findLotesProximosACaducar(dias: number = 30): Promise<Lote[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);
    
    return this.lotesRepository
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.medicamento', 'medicamento')
      .where('lote.fecha_caducidad <= :fecha', { fecha: fechaLimite })
      .andWhere('lote.fecha_caducidad > :fechaActual', { fechaActual: new Date() })
      .getMany();
  }

  async create(createLoteDto: CreateLoteDto): Promise<Lote> {
    // Verificar que el medicamento existe
    await this.medicamentosService.findOne(createLoteDto.id_medicamento);
    
    const lote = this.lotesRepository.create({
      ...createLoteDto,
      fecha_caducidad: new Date(createLoteDto.fecha_caducidad),
    });
    
    return this.lotesRepository.save(lote);
  }

  async update(id: number, updateLoteDto: UpdateLoteDto): Promise<Lote> {
    const lote = await this.findOne(id);
    
    if (updateLoteDto.id_medicamento) {
      // Verificar que el nuevo medicamento existe
      await this.medicamentosService.findOne(updateLoteDto.id_medicamento);
      lote.id_medicamento = updateLoteDto.id_medicamento;
    }
    
    if (updateLoteDto.numero_lote) {
      lote.numero_lote = updateLoteDto.numero_lote;
    }
    
    if (updateLoteDto.fecha_caducidad) {
      lote.fecha_caducidad = new Date(updateLoteDto.fecha_caducidad);
    }
    
    if (updateLoteDto.cantidad_actual !== undefined) {
      lote.cantidad_actual = updateLoteDto.cantidad_actual;
    }
    
    return this.lotesRepository.save(lote);
  }

  async updateCantidad(id: number, nuevaCantidad: number): Promise<Lote> {
    const lote = await this.findOne(id);
    lote.cantidad_actual = nuevaCantidad;
    return this.lotesRepository.save(lote);
  }

  async remove(id: number): Promise<void> {
    const lote = await this.findOne(id);
    await this.lotesRepository.delete(lote.id_lote);
  }
}