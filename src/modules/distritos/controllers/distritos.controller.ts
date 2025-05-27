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
import { DistritosService } from '../services/distritos.service';
import { Distrito } from '../entities/distrito.entity';
import { CreateDistritoDto } from '../dtos/create-distrito.dto';
import { UpdateDistritoDto } from '../dtos/update-distrito.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('distritos')
@Controller('distritos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DistritosController {
  constructor(private readonly distritosService: DistritosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los distritos' })
  @ApiOkResponse({
    description: 'Lista de distritos obtenida correctamente',
    type: [Distrito],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Distrito[]> {
    return this.distritosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un distrito por ID' })
  @ApiOkResponse({
    description: 'Distrito encontrado correctamente',
    type: Distrito,
  })
  @ApiNotFoundResponse({ description: 'Distrito no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Distrito> {
    const distrito = await this.distritosService.findOne(id);
    if (!distrito) {
      throw new NotFoundException(`Distrito con ID ${id} no encontrado`);
    }
    return distrito;
  }

  @Get('municipio/:idMunicipio')
  @ApiOperation({ summary: 'Obtener distritos por municipio' })
  @ApiOkResponse({
    description: 'Distritos del municipio obtenidos correctamente',
    type: [Distrito],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByMunicipio(@Param('idMunicipio', ParseIntPipe) idMunicipio: number): Promise<Distrito[]> {
    return this.distritosService.findByMunicipio(idMunicipio);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo distrito' })
  @ApiCreatedResponse({
    description: 'Distrito creado correctamente',
    type: Distrito,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createDistritoDto: CreateDistritoDto): Promise<Distrito> {
    return this.distritosService.create(createDistritoDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un distrito por ID' })
  @ApiOkResponse({
    description: 'Distrito actualizado correctamente',
    type: Distrito,
  })
  @ApiNotFoundResponse({ description: 'Distrito no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistritoDto: UpdateDistritoDto,
  ): Promise<Distrito> {
    const distrito = await this.distritosService.findOne(id);
    if (!distrito) {
      throw new NotFoundException(`Distrito con ID ${id} no encontrado`);
    }
    return this.distritosService.update(id, updateDistritoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un distrito por ID' })
  @ApiOkResponse({ description: 'Distrito eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Distrito no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const distrito = await this.distritosService.findOne(id);
    if (!distrito) {
      throw new NotFoundException(`Distrito con ID ${id} no encontrado`);
    }
    return this.distritosService.remove(id);
  }
}