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
import { RolesService } from '../services/roles.service';
import { Rol } from '../entities/rol.entity';
import { CreateRolDto } from '../dtos/create-rol.dto';
import { UpdateRolDto } from '../dtos/update-rol.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiOkResponse({
    description: 'Lista de roles obtenida correctamente',
    type: [Rol],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Rol[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiOkResponse({
    description: 'Rol encontrado correctamente',
    type: Rol,
  })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Rol> {
    const rol = await this.rolesService.findOne(id);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiCreatedResponse({
    description: 'Rol creado correctamente',
    type: Rol,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createRolDto: CreateRolDto): Promise<Rol> {
    return this.rolesService.create(createRolDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un rol por ID' })
  @ApiOkResponse({
    description: 'Rol actualizado correctamente',
    type: Rol,
  })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ): Promise<Rol> {
    const rol = await this.rolesService.findOne(id);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return this.rolesService.update(id, updateRolDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un rol por ID' })
  @ApiOkResponse({ description: 'Rol eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const rol = await this.rolesService.findOne(id);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return this.rolesService.remove(id);
  }
}