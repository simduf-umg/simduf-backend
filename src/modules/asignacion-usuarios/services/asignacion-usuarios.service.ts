import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionUsuario } from '../entities/asignacion-usuario.entity';
import { CreateAsignacionUsuarioDto } from '../dtos/create-asignacion-usuario.dto';
import { UpdateAsignacionUsuarioDto } from '../dtos/update-asignacion-usuario.dto';
import { UsuariosService } from '../../usuarios/services/usuarios.service';
import { DepartamentosService } from '../../departamentos/services/departamentos.service';
import { DistritosService } from '../../distritos/services/distritos.service';

@Injectable()
export class AsignacionUsuarioService {
  constructor(
    @InjectRepository(AsignacionUsuario)
    private asignacionUsuarioRepository: Repository<AsignacionUsuario>,
    private usuariosService: UsuariosService,
    private departamentosService: DepartamentosService,
    private distritosService: DistritosService,
  ) {}

  async findAll(): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioRepository.find({
      relations: ['usuario', 'departamento', 'distrito'],
    });
  }

  async findOne(id: number): Promise<AsignacionUsuario> {
    const asignacion = await this.asignacionUsuarioRepository.findOne({
      where: { id_asignacion: id },
      relations: ['usuario', 'departamento', 'distrito'],
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  async findByUsuario(userId: number): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioRepository.find({
      where: { user_id: userId },
      relations: ['usuario', 'departamento', 'distrito'],
    });
  }

  async findByDepartamento(idDepartamento: number): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioRepository.find({
      where: { id_departamento: idDepartamento },
      relations: ['usuario', 'departamento', 'distrito'],
    });
  }

  async findByDistrito(idDistrito: number): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioRepository.find({
      where: { id_distrito: idDistrito },
      relations: ['usuario', 'departamento', 'distrito'],
    });
  }

  async create(createAsignacionUsuarioDto: CreateAsignacionUsuarioDto): Promise<AsignacionUsuario> {
    // Validar que se proporcione al menos un departamento o distrito
    if (!createAsignacionUsuarioDto.id_departamento && !createAsignacionUsuarioDto.id_distrito) {
      throw new BadRequestException('Se debe asignar al menos un departamento o distrito');
    }

    // Validar que no se asignen ambos al mismo tiempo
    if (createAsignacionUsuarioDto.id_departamento && createAsignacionUsuarioDto.id_distrito) {
      throw new BadRequestException('No se puede asignar departamento y distrito al mismo tiempo');
    }

    // Verificar que el usuario existe
    await this.usuariosService.findOne(createAsignacionUsuarioDto.user_id);

    // Verificar que el usuario no tenga ya una asignación
    const asignacionExistente = await this.asignacionUsuarioRepository.findOne({
      where: { user_id: createAsignacionUsuarioDto.user_id },
    });
    
    if (asignacionExistente) {
      throw new BadRequestException('El usuario ya tiene una asignación activa');
    }

    // Verificar que el departamento existe (si se proporciona)
    if (createAsignacionUsuarioDto.id_departamento) {
      await this.departamentosService.findOne(createAsignacionUsuarioDto.id_departamento);
    }

    // Verificar que el distrito existe (si se proporciona)
    if (createAsignacionUsuarioDto.id_distrito) {
      await this.distritosService.findOne(createAsignacionUsuarioDto.id_distrito);
    }

    const asignacion = this.asignacionUsuarioRepository.create(createAsignacionUsuarioDto);
    return this.asignacionUsuarioRepository.save(asignacion);
  }

  async update(
    id: number,
    updateAsignacionUsuarioDto: UpdateAsignacionUsuarioDto,
  ): Promise<AsignacionUsuario> {
    const asignacion = await this.findOne(id);

    // Validar restricciones de negocio si se están actualizando los campos
    if (updateAsignacionUsuarioDto.id_departamento !== undefined || 
        updateAsignacionUsuarioDto.id_distrito !== undefined) {
      
      const nuevoDepartamento = updateAsignacionUsuarioDto.id_departamento ?? asignacion.id_departamento;
      const nuevoDistrito = updateAsignacionUsuarioDto.id_distrito ?? asignacion.id_distrito;

      if (!nuevoDepartamento && !nuevoDistrito) {
        throw new BadRequestException('Se debe asignar al menos un departamento o distrito');
      }

      if (nuevoDepartamento && nuevoDistrito) {
        throw new BadRequestException('No se puede asignar departamento y distrito al mismo tiempo');
      }
    }

    // Verificar que el nuevo departamento existe (si se proporciona)
    if (updateAsignacionUsuarioDto.id_departamento) {
      await this.departamentosService.findOne(updateAsignacionUsuarioDto.id_departamento);
      asignacion.id_departamento = updateAsignacionUsuarioDto.id_departamento;
    }

    // Verificar que el nuevo distrito existe (si se proporciona)
    if (updateAsignacionUsuarioDto.id_distrito) {
      await this.distritosService.findOne(updateAsignacionUsuarioDto.id_distrito);
      asignacion.id_distrito = updateAsignacionUsuarioDto.id_distrito;
    }

    // Verificar que el nuevo usuario existe (si se proporciona)
    if (updateAsignacionUsuarioDto.user_id) {
      await this.usuariosService.findOne(updateAsignacionUsuarioDto.user_id);
      asignacion.user_id = updateAsignacionUsuarioDto.user_id;
    }

    return this.asignacionUsuarioRepository.save(asignacion);
  }

  async remove(id: number): Promise<void> {
    const asignacion = await this.findOne(id);
    await this.asignacionUsuarioRepository.delete(asignacion.id_asignacion);
  }
}