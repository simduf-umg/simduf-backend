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
import { PresentacionesService } from '../services/presentaciones.service';
import { Presentacion } from '../entities/presentacion.entity';
import { CreatePresentacionDto } from '../dtos/create-presentacion.dto';
import { UpdatePresentacionDto } from '../dtos/update-presentacion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('presentaciones')
@Controller('presentaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PresentacionesController {
  constructor(private readonly presentacionesService: PresentacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las presentaciones' })
  @ApiOkResponse({
    description: 'Lista de presentaciones obtenida correctamente',
    type: [Presentacion],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Presentacion[]> {
    return this.presentacionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una presentación por ID' })
  @ApiOkResponse({
    description: 'Presentación encontrada correctamente',
    type: Presentacion,
  })
  @ApiNotFoundResponse({ description: 'Presentación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Presentacion> {
    return this.presentacionesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva presentación' })
  @ApiCreatedResponse({
    description: 'Presentación creada correctamente',
    type: Presentacion,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createPresentacionDto: CreatePresentacionDto): Promise<Presentacion> {
    return this.presentacionesService.create(createPresentacionDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una presentación por ID' })
  @ApiOkResponse({
    description: 'Presentación actualizada correctamente',
    type: Presentacion,
  })
  @ApiNotFoundResponse({ description: 'Presentación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePresentacionDto: UpdatePresentacionDto,
  ): Promise<Presentacion> {
    return this.presentacionesService.update(id, updatePresentacionDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una presentación por ID' })
  @ApiOkResponse({ description: 'Presentación eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Presentación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.presentacionesService.remove(id);
  }
}