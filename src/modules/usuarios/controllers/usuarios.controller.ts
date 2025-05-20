import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsuariosService } from '../services/usuarios.service';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiOkResponse({
    description: 'Lista de usuarios obtenida correctamente',
    type: [Usuario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiOkResponse({
    description: 'Perfil de usuario obtenido correctamente',
    type: Usuario,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getProfile(@CurrentUser() user: any): Promise<Usuario> {
    const usuario = await this.usuariosService.findOne(user.id);
    if (!usuario) {
      throw new NotFoundException(`Usuario no encontrado`);
    }
    return usuario;
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiOkResponse({
    description: 'Usuario encontrado correctamente',
    type: Usuario,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    const usuario = await this.usuariosService.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente',
    type: Usuario,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiOkResponse({
    description: 'Usuario actualizado correctamente',
    type: Usuario,
  })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.usuariosService.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Put(':id/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Cambiar la contraseña de un usuario específico' })
  @ApiOkResponse({
    description: 'Contraseña actualizada correctamente',
    type: Usuario,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<Usuario> {
    return this.usuariosService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiOkResponse({ description: 'Usuario eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const usuario = await this.usuariosService.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.usuariosService.remove(id);
  }
}