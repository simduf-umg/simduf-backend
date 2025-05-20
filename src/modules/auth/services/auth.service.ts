import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../../usuarios/services/usuarios.service';
import { LoginDto } from '../dtos/login.dto';
import { TokenDto } from '../dtos/token.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const usuario = await this.usuariosService.findByUsername(loginDto.username);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.contrasena,
      usuario.contrasena,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: usuario.user_id,
      username: usuario.username,
      roles: usuario.roles.map(rol => rol.nombre_rol),
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userId: number): Promise<any> {
    const usuario = await this.usuariosService.findOne(userId);

    if (!usuario || !usuario.activo) {
      return null;
    }

    return {
      id: usuario.user_id,
      username: usuario.username,
      roles: usuario.roles.map(rol => rol.nombre_rol),
    };
  }
}