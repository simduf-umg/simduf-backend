import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from '../entities/persona.entity';
import { CreatePersonaDto } from '../dtos/create-persona.dto';
import { UpdatePersonaDto } from '../dtos/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private personasRepository: Repository<Persona>,
  ) { }

  async findAll(): Promise<Persona[]> {
    return this.personasRepository.find();
  }

  async findOne(id: number): Promise<Persona> {
    const persona = await this.personasRepository.findOneBy({ id_persona: id });
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return persona;
  }

  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    const persona = this.personasRepository.create({
      ...createPersonaDto,
      fecha_nacimiento: new Date(createPersonaDto.fecha_nacimiento),
    });
    return this.personasRepository.save(persona);
  }

  async update(
    id: number,
    updatePersonaDto: UpdatePersonaDto,
  ): Promise<Persona> {
    const persona = await this.findOne(id);

    if (updatePersonaDto.nombre) {
      persona.nombre = updatePersonaDto.nombre;
    }

    if (updatePersonaDto.apellido) {
      persona.apellido = updatePersonaDto.apellido;
    }

    if (updatePersonaDto.fecha_nacimiento) {
      persona.fecha_nacimiento = new Date(updatePersonaDto.fecha_nacimiento);
    }

    return this.personasRepository.save(persona);
  }

  async remove(id: number): Promise<void> {
    const persona = await this.findOne(id);
    await this.personasRepository.delete(persona.id_persona);
  }
}