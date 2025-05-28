import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Seguimiento } from '../entities/seguimiento.entity';
import { CreateSeguimientoDto } from '../dtos/create-seguimiento.dto';
import { FiltrosSeguimientoDto } from '../dtos/filtros-seguimiento.dto';

@Injectable()
export class SeguimientosService {
  constructor(
    @InjectRepository(Seguimiento)
    private seguimientosRepository: Repository<Seguimiento>,
  ) {}

  async findAll(filtros?: FiltrosSeguimientoDto): Promise<{ data: Seguimiento[]; total: number; pagina: number; limite: number }> {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const skip = (pagina - 1) * limite;

    const queryBuilder = this.seguimientosRepository
      .createQueryBuilder('seguimiento')
      .leftJoinAndSelect('seguimiento.usuario_admin', 'usuario_admin')
      .leftJoinAndSelect('seguimiento.distrito', 'distrito');

    if (filtros?.id_seguimiento) {
      queryBuilder.andWhere('seguimiento.id_seguimiento = :id_seguimiento', { id_seguimiento: filtros.id_seguimiento });
    }
    if (filtros?.id_usuario_admin) {
      queryBuilder.andWhere('seguimiento.id_usuario_admin = :id_usuario_admin', { id_usuario_admin: filtros.id_usuario_admin });
    }
    if (filtros?.id_distrito) {
      queryBuilder.andWhere('seguimiento.id_distrito = :id_distrito', { id_distrito: filtros.id_distrito });
    }
    if (filtros?.fecha_inicio && filtros?.fecha_fin) {
      queryBuilder.andWhere('seguimiento.fecha_visita BETWEEN :fecha_inicio AND :fecha_fin', {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
      });
    } else if (filtros?.fecha_inicio) {
      queryBuilder.andWhere('seguimiento.fecha_visita >= :fecha_inicio', { fecha_inicio: filtros.fecha_inicio });
    } else if (filtros?.fecha_fin) {
      queryBuilder.andWhere('seguimiento.fecha_visita <= :fecha_fin', { fecha_fin: filtros.fecha_fin });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('seguimiento.fecha_visita', 'DESC')
      .skip(skip)
      .take(limite)
      .getMany();

    return { data, total, pagina, limite };
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