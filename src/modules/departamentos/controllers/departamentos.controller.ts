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
import { DepartamentosService } from '../services/departamentos.service';
import { Departamento } from '../entities/departamento.entity';
import { CreateDepartamentoDto } from '../dtos/create-departamento.dto';
import { UpdateDepartamentoDto } from '../dtos/update-departamento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('departamentos')
@Controller('departamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  @ApiOkResponse({
    description: 'Lista de departamentos obtenida correctamente',
    type: [Departamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Departamento[]> {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiOkResponse({
    description: 'Departamento encontrado correctamente',
    type: Departamento,
  })
  @ApiNotFoundResponse({ description: 'Departamento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Departamento> {
    const departamento = await this.departamentosService.findOne(id);
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return departamento;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiCreatedResponse({
    description: 'Departamento creado correctamente',
    type: Departamento,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createDepartamentoDto: CreateDepartamentoDto): Promise<Departamento> {
    return this.departamentosService.create(createDepartamentoDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un departamento por ID' })
  @ApiOkResponse({
    description: 'Departamento actualizado correctamente',
    type: Departamento,
  })
  @ApiNotFoundResponse({ description: 'Departamento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto,
  ): Promise<Departamento> {
    const departamento = await this.departamentosService.findOne(id);
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un departamento por ID' })
  @ApiOkResponse({ description: 'Departamento eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Departamento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const departamento = await this.departamentosService.findOne(id);
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return this.departamentosService.remove(id);
  }
}