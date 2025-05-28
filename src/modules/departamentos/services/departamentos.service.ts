import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from '../entities/departamento.entity';
import { CreateDepartamentoDto } from '../dtos/create-departamento.dto';
import { UpdateDepartamentoDto } from '../dtos/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private departamentosRepository: Repository<Departamento>,
  ) {}

  async findAll(): Promise<Departamento[]> {
    return this.departamentosRepository.find();
  }

  async findOne(id: number): Promise<Departamento> {
    const departamento = await this.departamentosRepository.findOneBy({ id_departamento: id });
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return departamento;
  }

  async create(createDepartamentoDto: CreateDepartamentoDto): Promise<Departamento> {
    const departamento = this.departamentosRepository.create(createDepartamentoDto);
    return this.departamentosRepository.save(departamento);
  }

  async update(
    id: number,
    updateDepartamentoDto: UpdateDepartamentoDto,
  ): Promise<Departamento> {
    const departamento = await this.findOne(id);
    
    if (updateDepartamentoDto.nombre) {
      departamento.nombre = updateDepartamentoDto.nombre;
    }
    
    return this.departamentosRepository.save(departamento);
  }

  async remove(id: number): Promise<void> {
    const departamento = await this.findOne(id);
    await this.departamentosRepository.delete(departamento.id_departamento);
  }
}