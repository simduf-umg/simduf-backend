import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seguimiento } from '../entities/seguimiento.entity';
import { CreateSeguimientoDto } from '../dtos/create-seguimiento.dto';

@Injectable()
export class SeguimientosService {
  constructor(
    @InjectRepository(Seguimiento)
    private seguimientosRepository: Repository<Seguimiento>,
  ) {}

  async findAll(): Promise<Seguimiento[]> {
    return this.seguimientosRepository.find({
      relations: ['usuario_admin', 'distrito'],
      order: { fecha_visita: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Seguimiento> {
    const seguimiento = await this.seguimientosRepository.findOne({
      where: { id_seguimiento: id },
      relations: ['usuario_admin', 'distrito'],
    });
    if (!seguimiento) {
      throw new NotFoundException(`Seguimiento con ID ${id} no encontrado`);
    }
    return seguimiento;
  }

  async create(createSeguimientoDto: CreateSeguimientoDto): Promise<Seguimiento> {
    const seguimiento = this.seguimientosRepository.create(createSeguimientoDto);
    return this.seguimientosRepository.save(seguimiento);
  }

  async remove(id: number): Promise<void> {
    const seguimiento = await this.findOne(id);
    await this.seguimientosRepository.delete(seguimiento.id_seguimiento);
  }
}