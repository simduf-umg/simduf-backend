import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distrito } from '../entities/distrito.entity';
import { CreateDistritoDto } from '../dtos/create-distrito.dto';
import { UpdateDistritoDto } from '../dtos/update-distrito.dto';
import { MunicipiosService } from '../../municipios/services/municipios.service';

@Injectable()
export class DistritosService {
  constructor(
    @InjectRepository(Distrito)
    private distritosRepository: Repository<Distrito>,
    private municipiosService: MunicipiosService,
  ) {}

  async findAll(): Promise<Distrito[]> {
    return this.distritosRepository.find({
      relations: ['municipio', 'municipio.departamento'],
    });
  }

  async findOne(id: number): Promise<Distrito> {
    const distrito = await this.distritosRepository.findOne({
      where: { id_distrito: id },
      relations: ['municipio', 'municipio.departamento'],
    });
    if (!distrito) {
      throw new NotFoundException(`Distrito con ID ${id} no encontrado`);
    }
    return distrito;
  }

  async findByMunicipio(idMunicipio: number): Promise<Distrito[]> {
    return this.distritosRepository.find({
      where: { id_municipio: idMunicipio },
      relations: ['municipio', 'municipio.departamento'],
    });
  }

  async create(createDistritoDto: CreateDistritoDto): Promise<Distrito> {
    // Verificar que el municipio existe
    await this.municipiosService.findOne(createDistritoDto.id_municipio);
    
    const distrito = this.distritosRepository.create(createDistritoDto);
    return this.distritosRepository.save(distrito);
  }

  async update(
    id: number,
    updateDistritoDto: UpdateDistritoDto,
  ): Promise<Distrito> {
    const distrito = await this.findOne(id);
    
    if (updateDistritoDto.nombre) {
      distrito.nombre = updateDistritoDto.nombre;
    }
    
    if (updateDistritoDto.id_municipio) {
      // Verificar que el nuevo municipio existe
      await this.municipiosService.findOne(updateDistritoDto.id_municipio);
      distrito.id_municipio = updateDistritoDto.id_municipio;
    }
    
    return this.distritosRepository.save(distrito);
  }

  async remove(id: number): Promise<void> {
    const distrito = await this.findOne(id);
    await this.distritosRepository.delete(distrito.id_distrito);
  }
}