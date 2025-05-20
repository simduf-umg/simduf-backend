import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';
import { CreateRolDto } from '../dtos/create-rol.dto';
import { UpdateRolDto } from '../dtos/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
  ) { }

  async findAll(): Promise<Rol[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Rol | null> {
    return this.rolesRepository.findOneBy({ id_rol: id });
  }

  async findByNombre(nombre: string): Promise<Rol | null> {
    return this.rolesRepository.findOneBy({ nombre_rol: nombre });
  }

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const rol = this.rolesRepository.create(createRolDto);
    return this.rolesRepository.save(rol);
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    if (updateRolDto.nombre_rol) {
      rol.nombre_rol = updateRolDto.nombre_rol;
    }

    return this.rolesRepository.save(rol);
  }

  async remove(id: number): Promise<void> {
    await this.rolesRepository.delete(id);
  }
}