import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Request,
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
import { SeguimientosService } from '../services/seguimientos.service';
import { Seguimiento } from '../entities/seguimiento.entity';
import { CreateSeguimientoDto } from '../dtos/create-seguimiento.dto';
import { FiltrosSeguimientoDto } from '../dtos/filtros-seguimiento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('seguimientos')
@Controller('seguimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SeguimientosController {
  constructor(private readonly seguimientosService: SeguimientosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los seguimientos con filtros' })
  @ApiOkResponse({
    description: 'Lista de seguimientos obtenida correctamente',
    type: [Seguimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(@Query() filtros: FiltrosSeguimientoDto) {
    return this.seguimientosService.findAll(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un seguimiento por ID' })
  @ApiOkResponse({
    description: 'Seguimiento encontrado correctamente',
    type: Seguimiento,
  })
  @ApiNotFoundResponse({ description: 'Seguimiento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Seguimiento> {
    return this.seguimientosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Crear un nuevo seguimiento' })
  @ApiCreatedResponse({
    description: 'Seguimiento creado correctamente',
    type: Seguimiento,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(
    @Body() createSeguimientoDto: CreateSeguimientoDto,
  ): Promise<Seguimiento> {
    return this.seguimientosService.create(createSeguimientoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un seguimiento por ID' })
  @ApiOkResponse({ description: 'Seguimiento eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Seguimiento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.seguimientosService.remove(id);
  }
}