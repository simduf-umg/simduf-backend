import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicamento } from '../entities/medicamento.entity';
import { CreateMedicamentoDto } from '../dtos/create-medicamento.dto';
import { UpdateMedicamentoDto } from '../dtos/update-medicamento.dto';
import { PresentacionesService } from '../../presentaciones/services/presentaciones.service';
import { ConcentracionesService } from '../../concentraciones/services/concentraciones.service';

@Injectable()
export class MedicamentosService {
  constructor(
    @InjectRepository(Medicamento)
    private medicamentosRepository: Repository<Medicamento>,
    private presentacionesService: PresentacionesService,
    private concentracionesService: ConcentracionesService,
  ) {}

  async findAll(): Promise<Medicamento[]> {
    return this.medicamentosRepository.find({
      relations: ['presentacion', 'concentracion', 'lotes'],
    });
  }

  async findOne(id: number): Promise<Medicamento> {
    const medicamento = await this.medicamentosRepository.findOne({
      where: { id_medicamento: id },
      relations: ['presentacion', 'concentracion', 'lotes'],
    });
    if (!medicamento) {
      throw new NotFoundException(`Medicamento con ID ${id} no encontrado`);
    }
    return medicamento;
  }

  async findByCodigo(codigo: string): Promise<Medicamento> {
    const medicamento = await this.medicamentosRepository.findOne({
      where: { codigo },
      relations: ['presentacion', 'concentracion', 'lotes'],
    });
    if (!medicamento) {
      throw new NotFoundException(`Medicamento con código ${codigo} no encontrado`);
    }
    return medicamento;
  }

  async findByNombre(nombre: string): Promise<Medicamento[]> {
    return this.medicamentosRepository
      .createQueryBuilder('medicamento')
      .leftJoinAndSelect('medicamento.presentacion', 'presentacion')
      .leftJoinAndSelect('medicamento.concentracion', 'concentracion')
      .leftJoinAndSelect('medicamento.lotes', 'lotes')
      .where('medicamento.nombre ILIKE :nombre', { nombre: `%${nombre}%` })
      .getMany();
  }

  async findByPresentacion(idPresentacion: number): Promise<Medicamento[]> {
    return this.medicamentosRepository.find({
      where: { id_presentacion: idPresentacion },
      relations: ['presentacion', 'concentracion', 'lotes'],
    });
  }

  async findByConcentracion(idConcentracion: number): Promise<Medicamento[]> {
    return this.medicamentosRepository.find({
      where: { id_concentracion: idConcentracion },
      relations: ['presentacion', 'concentracion', 'lotes'],
    });
  }

  async create(createMedicamentoDto: CreateMedicamentoDto): Promise<Medicamento> {
    // Verificar que la presentación existe
    await this.presentacionesService.findOne(createMedicamentoDto.id_presentacion);
    
    // Verificar que la concentración existe
    await this.concentracionesService.findOne(createMedicamentoDto.id_concentracion);
    
    // Verificar que el código no esté duplicado
    const medicamentoExistente = await this.medicamentosRepository.findOne({
      where: { codigo: createMedicamentoDto.codigo },
    });
    
    if (medicamentoExistente) {
      throw new ConflictException(`Ya existe un medicamento con el código ${createMedicamentoDto.codigo}`);
    }
    
    const medicamento = this.medicamentosRepository.create(createMedicamentoDto);
    return this.medicamentosRepository.save(medicamento);
  }

  async update(id: number, updateMedicamentoDto: UpdateMedicamentoDto): Promise<Medicamento> {
    const medicamento = await this.findOne(id);
    
    if (updateMedicamentoDto.id_presentacion) {
      // Verificar que la nueva presentación existe
      await this.presentacionesService.findOne(updateMedicamentoDto.id_presentacion);
      medicamento.id_presentacion = updateMedicamentoDto.id_presentacion;
    }
    
    if (updateMedicamentoDto.id_concentracion) {
      // Verificar que la nueva concentración existe
      await this.concentracionesService.findOne(updateMedicamentoDto.id_concentracion);
      medicamento.id_concentracion = updateMedicamentoDto.id_concentracion;
    }
    
    if (updateMedicamentoDto.codigo && updateMedicamentoDto.codigo !== medicamento.codigo) {
      // Verificar que el nuevo código no esté duplicado
      const medicamentoExistente = await this.medicamentosRepository.findOne({
        where: { codigo: updateMedicamentoDto.codigo },
      });
      
      if (medicamentoExistente) {
        throw new ConflictException(`Ya existe un medicamento con el código ${updateMedicamentoDto.codigo}`);
      }
      medicamento.codigo = updateMedicamentoDto.codigo;
    }
    
    if (updateMedicamentoDto.nombre) {
      medicamento.nombre = updateMedicamentoDto.nombre;
    }
    
    if (updateMedicamentoDto.descripcion !== undefined) {
      medicamento.descripcion = updateMedicamentoDto.descripcion;
    }
    
    return this.medicamentosRepository.save(medicamento);
  }

  async remove(id: number): Promise<void> {
    const medicamento = await this.findOne(id);
    await this.medicamentosRepository.delete(medicamento.id_medicamento);
  }

  async getMedicamentosConStock(): Promise<Medicamento[]> {
    return this.medicamentosRepository
      .createQueryBuilder('medicamento')
      .leftJoinAndSelect('medicamento.presentacion', 'presentacion')
      .leftJoinAndSelect('medicamento.concentracion', 'concentracion')
      .leftJoinAndSelect('medicamento.lotes', 'lotes')
      .where('lotes.cantidad_actual > 0')
      .getMany();
  }

  async getMedicamentosSinStock(): Promise<Medicamento[]> {
    return this.medicamentosRepository
      .createQueryBuilder('medicamento')
      .leftJoinAndSelect('medicamento.presentacion', 'presentacion')
      .leftJoinAndSelect('medicamento.concentracion', 'concentracion')
      .leftJoin('medicamento.lotes', 'lotes')
      .where('lotes.id_lote IS NULL OR lotes.cantidad_actual = 0')
      .getMany();
  }
}