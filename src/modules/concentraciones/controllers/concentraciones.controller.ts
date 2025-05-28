import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ConcentracionesService } from '../services/concentraciones.service';
import { Concentracion } from '../entities/concentracion.entity';
import { CreateConcentracionDto } from '../dtos/create-concentracion.dto';
import { UpdateConcentracionDto } from '../dtos/update-concentracion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('concentraciones')
@Controller('concentraciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConcentracionesController {
  constructor(private readonly concentracionesService: ConcentracionesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las concentraciones' })
  @ApiOkResponse({
    description: 'Lista de concentraciones obtenida correctamente',
    type: [Concentracion],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Concentracion[]> {
    return this.concentracionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una concentración por ID' })
  @ApiOkResponse({
    description: 'Concentración encontrada correctamente',
    type: Concentracion,
  })
  @ApiNotFoundResponse({ description: 'Concentración no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Concentracion> {
    return this.concentracionesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva concentración' })
  @ApiCreatedResponse({
    description: 'Concentración creada correctamente',
    type: Concentracion,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createConcentracionDto: CreateConcentracionDto): Promise<Concentracion> {
    return this.concentracionesService.create(createConcentracionDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una concentración por ID' })
  @ApiOkResponse({
    description: 'Concentración actualizada correctamente',
    type: Concentracion,
  })
  @ApiNotFoundResponse({ description: 'Concentración no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConcentracionDto: UpdateConcentracionDto,
  ): Promise<Concentracion> {
    return this.concentracionesService.update(id, updateConcentracionDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una concentración por ID' })
  @ApiOkResponse({ description: 'Concentración eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Concentración no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.concentracionesService.remove(id);
  }
}