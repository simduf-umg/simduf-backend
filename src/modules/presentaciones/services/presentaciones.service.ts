import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presentacion } from '../entities/presentacion.entity';
import { CreatePresentacionDto } from '../dtos/create-presentacion.dto';
import { UpdatePresentacionDto } from '../dtos/update-presentacion.dto';

@Injectable()
export class PresentacionesService {
  constructor(
    @InjectRepository(Presentacion)
    private presentacionesRepository: Repository<Presentacion>,
  ) {}

  async findAll(): Promise<Presentacion[]> {
    return this.presentacionesRepository.find({
      relations: ['medicamentos'],
    });
  }

  async findOne(id: number): Promise<Presentacion> {
    const presentacion = await this.presentacionesRepository.findOne({
      where: { id_presentacion: id },
      relations: ['medicamentos'],
    });
    if (!presentacion) {
      throw new NotFoundException(`Presentación con ID ${id} no encontrada`);
    }
    return presentacion;
  }

  async create(createPresentacionDto: CreatePresentacionDto): Promise<Presentacion> {
    const presentacion = this.presentacionesRepository.create(createPresentacionDto);
    return this.presentacionesRepository.save(presentacion);
  }

  async update(
    id: number,
    updatePresentacionDto: UpdatePresentacionDto,
  ): Promise<Presentacion> {
    const presentacion = await this.findOne(id);
    
    Object.assign(presentacion, updatePresentacionDto);
    
    return this.presentacionesRepository.save(presentacion);
  }

  async remove(id: number): Promise<void> {
    const presentacion = await this.findOne(id);
    await this.presentacionesRepository.delete(presentacion.id_presentacion);
  }
}