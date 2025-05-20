import { Body, Controller, Post, UseGuards, Req, HttpCode, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { TokenDto } from '../dtos/token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiCreatedResponse({
    description: 'Token generado correctamente',
    type: TokenDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión e invalidar el token JWT' })
  @ApiOkResponse({ description: 'Sesión cerrada correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async logout(@Req() request: Request) {
    // Extraer el token del header
    const authHeader = request.headers.authorization;
    
    // Verificar que el header de autorización exista
    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó un token de autenticación');
    }
    
    const token = authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
    
    try {
      // Decodificar el token para obtener el tiempo de expiración
      const decodedToken = this.jwtService.decode(token);
      if (decodedToken && typeof decodedToken === 'object' && decodedToken.exp) {
        // Agregar el token a la blacklist
        this.tokenBlacklistService.blacklistToken(token, decodedToken.exp);
        return { message: 'Sesión cerrada correctamente' };
      }
    } catch (error) {
      return { message: 'Error al procesar el token' };
    }
    
    return { message: 'Sesión cerrada correctamente' };
  }
}