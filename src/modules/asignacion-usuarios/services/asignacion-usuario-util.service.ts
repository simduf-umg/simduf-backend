import { Injectable } from '@nestjs/common';
import { AsignacionUsuarioService } from './asignacion-usuarios.service';

@Injectable()
export class AsignacionUsuarioUtilService {
  constructor(
    private asignacionUsuarioService: AsignacionUsuarioService,
  ) {}

  /**
   * Verifica si un usuario tiene acceso a un distrito específico
   */
  async usuarioTieneAccesoDistrito(userId: number, distritoId: number): Promise<boolean> {
    const asignaciones = await this.asignacionUsuarioService.findByUsuario(userId);
    
    return asignaciones.some(asignacion => asignacion.id_distrito === distritoId);
  }

  /**
   * Verifica si un usuario tiene acceso a un departamento específico
   */
  async usuarioTieneAccesoDepartamento(userId: number, departamentoId: number): Promise<boolean> {
    const asignaciones = await this.asignacionUsuarioService.findByUsuario(userId);
    
    return asignaciones.some(asignacion => asignacion.id_departamento === departamentoId);
  }

  /**
   * Obtiene todos los distritos a los que un usuario tiene acceso
   */
  async obtenerDistritosAccesibles(userId: number): Promise<number[]> {
    const asignaciones = await this.asignacionUsuarioService.findByUsuario(userId);
    
    return asignaciones
      .filter(asignacion => asignacion.id_distrito)
      .map(asignacion => asignacion.id_distrito);
  }

  /**
   * Obtiene todos los departamentos a los que un usuario tiene acceso
   */
  async obtenerDepartamentosAccesibles(userId: number): Promise<number[]> {
    const asignaciones = await this.asignacionUsuarioService.findByUsuario(userId);
    
    return asignaciones
      .filter(asignacion => asignacion.id_departamento)
      .map(asignacion => asignacion.id_departamento);
  }
}
