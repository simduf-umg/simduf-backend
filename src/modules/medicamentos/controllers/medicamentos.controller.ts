import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { MedicamentosService } from '../services/medicamentos.service';
import { Medicamento } from '../entities/medicamento.entity';
import { CreateMedicamentoDto } from '../dtos/create-medicamento.dto';
import { UpdateMedicamentoDto } from '../dtos/update-medicamento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('medicamentos')
@Controller('medicamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MedicamentosController {
  constructor(private readonly medicamentosService: MedicamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los medicamentos' })
  @ApiOkResponse({
    description: 'Lista de medicamentos obtenida correctamente',
    type: [Medicamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Medicamento[]> {
    return this.medicamentosService.findAll();
  }

  @Get('con-stock')
  @ApiOperation({ summary: 'Obtener medicamentos con stock disponible' })
  @ApiOkResponse({
    description: 'Lista de medicamentos con stock obtenida correctamente',
    type: [Medicamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getMedicamentosConStock(): Promise<Medicamento[]> {
    return this.medicamentosService.getMedicamentosConStock();
  }

  @Get('sin-stock')
  @ApiOperation({ summary: 'Obtener medicamentos sin stock' })
  @ApiOkResponse({
    description: 'Lista de medicamentos sin stock obtenida correctamente',
    type: [Medicamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getMedicamentosSinStock(): Promise<Medicamento[]> {
    return this.medicamentosService.getMedicamentosSinStock();
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar medicamentos por nombre' })
  @ApiQuery({ 
    name: 'nombre', 
    required: true, 
    description: 'Nombre del medicamento a buscar',
    example: 'Paracetamol' 
  })
  @ApiOkResponse({
    description: 'Medicamentos encontrados correctamente',
    type: [Medicamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByNombre(@Query('nombre') nombre: string): Promise<Medicamento[]> {
    return this.medicamentosService.findByNombre(nombre);
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Obtener medicamento por código' })
  @ApiOkResponse({
    description: 'Medicamento encontrado correctamente',
    type: Medicamento,
  })
  @ApiNotFoundResponse({ description: 'Medicamento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByCodigo(@Param('codigo') codigo: string): Promise<Medicamento> {
    return this.medicamentosService.findByCodigo(codigo);
  }

  @Get('presentacion/:idPresentacion')
  @ApiOperation({ summary: 'Obtener medicamentos por presentación' })
  @ApiOkResponse({
    description: 'Medicamentos de la presentación obtenidos correctamente',
    type: [Medicamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByPresentacion(@Param('idPresentacion', ParseIntPipe) idPresentacion: number): Promise<Medicamento[]> {
    return this.medicamentosService.findByPresentacion(idPresentacion);
  }

  @Get('concentracion/:idConcentracion')
  @ApiOperation({ summary: 'Obtener medicamentos por concentración' })
  @ApiOkResponse({
    description: 'Medicamentos de la concentración obtenidos correctamente',
    type: [Medicamento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByConcentracion(@Param('idConcentracion', ParseIntPipe) idConcentracion: number): Promise<Medicamento[]> {
    return this.medicamentosService.findByConcentracion(idConcentracion);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medicamento por ID' })
  @ApiOkResponse({
    description: 'Medicamento encontrado correctamente',
    type: Medicamento,
  })
  @ApiNotFoundResponse({ description: 'Medicamento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Medicamento> {
    return this.medicamentosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Crear un nuevo medicamento' })
  @ApiCreatedResponse({
    description: 'Medicamento creado correctamente',
    type: Medicamento,
  })
  @ApiConflictResponse({ description: 'El código del medicamento ya existe' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createMedicamentoDto: CreateMedicamentoDto): Promise<Medicamento> {
    return this.medicamentosService.create(createMedicamentoDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar un medicamento por ID' })
  @ApiOkResponse({
    description: 'Medicamento actualizado correctamente',
    type: Medicamento,
  })
  @ApiNotFoundResponse({ description: 'Medicamento no encontrado' })
  @ApiConflictResponse({ description: 'El código del medicamento ya existe' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicamentoDto: UpdateMedicamentoDto,
  ): Promise<Medicamento> {
    return this.medicamentosService.update(id, updateMedicamentoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un medicamento por ID' })
  @ApiOkResponse({ description: 'Medicamento eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Medicamento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.medicamentosService.remove(id);
  }
}