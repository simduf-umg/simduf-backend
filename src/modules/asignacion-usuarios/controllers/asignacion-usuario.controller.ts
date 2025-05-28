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
import { AsignacionUsuarioService } from '../services/asignacion-usuarios.service';
import { AsignacionUsuario } from '../entities/asignacion-usuario.entity';
import { CreateAsignacionUsuarioDto } from '../dtos/create-asignacion-usuario.dto';
import { UpdateAsignacionUsuarioDto } from '../dtos/update-asignacion-usuario.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('asignacion-usuario')
@Controller('asignacion-usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AsignacionUsuarioController {
  constructor(private readonly asignacionUsuarioService: AsignacionUsuarioService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todas las asignaciones de usuarios' })
  @ApiOkResponse({
    description: 'Lista de asignaciones obtenida correctamente',
    type: [AsignacionUsuario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiOkResponse({
    description: 'Asignación encontrada correctamente',
    type: AsignacionUsuario,
  })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AsignacionUsuario> {
    return this.asignacionUsuarioService.findOne(id);
  }

  @Get('usuario/:userId')
  @ApiOperation({ summary: 'Obtener asignaciones por usuario' })
  @ApiOkResponse({
    description: 'Asignaciones del usuario obtenidas correctamente',
    type: [AsignacionUsuario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByUsuario(@Param('userId', ParseIntPipe) userId: number): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioService.findByUsuario(userId);
  }

  @Get('departamento/:idDepartamento')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener asignaciones por departamento' })
  @ApiOkResponse({
    description: 'Asignaciones del departamento obtenidas correctamente',
    type: [AsignacionUsuario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByDepartamento(@Param('idDepartamento', ParseIntPipe) idDepartamento: number): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioService.findByDepartamento(idDepartamento);
  }

  @Get('distrito/:idDistrito')
  @Roles('ADMIN', 'ENCARGADO')
  @ApiOperation({ summary: 'Obtener asignaciones por distrito' })
  @ApiOkResponse({
    description: 'Asignaciones del distrito obtenidas correctamente',
    type: [AsignacionUsuario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByDistrito(@Param('idDistrito', ParseIntPipe) idDistrito: number): Promise<AsignacionUsuario[]> {
    return this.asignacionUsuarioService.findByDistrito(idDistrito);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva asignación de usuario' })
  @ApiCreatedResponse({
    description: 'Asignación creada correctamente',
    type: AsignacionUsuario,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createAsignacionUsuarioDto: CreateAsignacionUsuarioDto): Promise<AsignacionUsuario> {
    return this.asignacionUsuarioService.create(createAsignacionUsuarioDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una asignación por ID' })
  @ApiOkResponse({
    description: 'Asignación actualizada correctamente',
    type: AsignacionUsuario,
  })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsignacionUsuarioDto: UpdateAsignacionUsuarioDto,
  ): Promise<AsignacionUsuario> {
    return this.asignacionUsuarioService.update(id, updateAsignacionUsuarioDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una asignación por ID' })
  @ApiOkResponse({ description: 'Asignación eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.asignacionUsuarioService.remove(id);
  }
}