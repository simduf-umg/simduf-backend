import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from '../entities/municipio.entity';
import { CreateMunicipioDto } from '../dtos/create-municipio.dto';
import { UpdateMunicipioDto } from '../dtos/update-municipio.dto';
import { DepartamentosService } from '../../departamentos/services/departamentos.service';

@Injectable()
export class MunicipiosService {
  constructor(
    @InjectRepository(Municipio)
    private municipiosRepository: Repository<Municipio>,
    private departamentosService: DepartamentosService,
  ) {}

  async findAll(): Promise<Municipio[]> {
    return this.municipiosRepository.find({
      relations: ['departamento'],
    });
  }

  async findOne(id: number): Promise<Municipio> {
    const municipio = await this.municipiosRepository.findOne({
      where: { id_municipio: id },
      relations: ['departamento'],
    });
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }

  async findByDepartamento(idDepartamento: number): Promise<Municipio[]> {
    return this.municipiosRepository.find({
      where: { id_departamento: idDepartamento },
      relations: ['departamento'],
    });
  }

  async create(createMunicipioDto: CreateMunicipioDto): Promise<Municipio> {
    // Verificar que el departamento existe
    await this.departamentosService.findOne(createMunicipioDto.id_departamento);
    
    const municipio = this.municipiosRepository.create(createMunicipioDto);
    return this.municipiosRepository.save(municipio);
  }

  async update(
    id: number,
    updateMunicipioDto: UpdateMunicipioDto,
  ): Promise<Municipio> {
    const municipio = await this.findOne(id);
    
    if (updateMunicipioDto.nombre) {
      municipio.nombre = updateMunicipioDto.nombre;
    }
    
    if (updateMunicipioDto.id_departamento) {
      // Verificar que el nuevo departamento existe
      await this.departamentosService.findOne(updateMunicipioDto.id_departamento);
      municipio.id_departamento = updateMunicipioDto.id_departamento;
    }
    
    return this.municipiosRepository.save(municipio);
  }

  async remove(id: number): Promise<void> {
    const municipio = await this.findOne(id);
    await this.municipiosRepository.delete(municipio.id_municipio);
  }
}