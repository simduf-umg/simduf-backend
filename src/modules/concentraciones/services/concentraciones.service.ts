import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concentracion } from '../entities/concentracion.entity';
import { CreateConcentracionDto } from '../dtos/create-concentracion.dto';
import { UpdateConcentracionDto } from '../dtos/update-concentracion.dto';

@Injectable()
export class ConcentracionesService {
  constructor(
    @InjectRepository(Concentracion)
    private concentracionesRepository: Repository<Concentracion>,
  ) {}

  async findAll(): Promise<Concentracion[]> {
    return this.concentracionesRepository.find({
      relations: ['medicamentos'],
    });
  }

  async findOne(id: number): Promise<Concentracion> {
    const concentracion = await this.concentracionesRepository.findOne({
      where: { id_concentracion: id },
      relations: ['medicamentos'],
    });
    if (!concentracion) {
      throw new NotFoundException(`Concentración con ID ${id} no encontrada`);
    }
    return concentracion;
  }

  async create(createConcentracionDto: CreateConcentracionDto): Promise<Concentracion> {
    const concentracion = this.concentracionesRepository.create(createConcentracionDto);
    return this.concentracionesRepository.save(concentracion);
  }

  async update(
    id: number,
    updateConcentracionDto: UpdateConcentracionDto,
  ): Promise<Concentracion> {
    const concentracion = await this.findOne(id);
    
    Object.assign(concentracion, updateConcentracionDto);
    
    return this.concentracionesRepository.save(concentracion);
  }

  async remove(id: number): Promise<void> {
    const concentracion = await this.findOne(id);
    await this.concentracionesRepository.delete(concentracion.id_concentracion);
  }
}