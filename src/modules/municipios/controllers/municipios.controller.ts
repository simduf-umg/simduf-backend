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
import { MunicipiosService } from '../services/municipios.service';
import { Municipio } from '../entities/municipio.entity';
import { CreateMunicipioDto } from '../dtos/create-municipio.dto';
import { UpdateMunicipioDto } from '../dtos/update-municipio.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('municipios')
@Controller('municipios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MunicipiosController {
  constructor(private readonly municipiosService: MunicipiosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los municipios' })
  @ApiOkResponse({
    description: 'Lista de municipios obtenida correctamente',
    type: [Municipio],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Municipio[]> {
    return this.municipiosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un municipio por ID' })
  @ApiOkResponse({
    description: 'Municipio encontrado correctamente',
    type: Municipio,
  })
  @ApiNotFoundResponse({ description: 'Municipio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Municipio> {
    const municipio = await this.municipiosService.findOne(id);
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }

  @Get('departamento/:idDepartamento')
  @ApiOperation({ summary: 'Obtener municipios por departamento' })
  @ApiOkResponse({
    description: 'Municipios del departamento obtenidos correctamente',
    type: [Municipio],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByDepartamento(@Param('idDepartamento', ParseIntPipe) idDepartamento: number): Promise<Municipio[]> {
    return this.municipiosService.findByDepartamento(idDepartamento);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo municipio' })
  @ApiCreatedResponse({
    description: 'Municipio creado correctamente',
    type: Municipio,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createMunicipioDto: CreateMunicipioDto): Promise<Municipio> {
    return this.municipiosService.create(createMunicipioDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un municipio por ID' })
  @ApiOkResponse({
    description: 'Municipio actualizado correctamente',
    type: Municipio,
  })
  @ApiNotFoundResponse({ description: 'Municipio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMunicipioDto: UpdateMunicipioDto,
  ): Promise<Municipio> {
    const municipio = await this.municipiosService.findOne(id);
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return this.municipiosService.update(id, updateMunicipioDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un municipio por ID' })
  @ApiOkResponse({ description: 'Municipio eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Municipio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const municipio = await this.municipiosService.findOne(id);
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return this.municipiosService.remove(id);
  }
}