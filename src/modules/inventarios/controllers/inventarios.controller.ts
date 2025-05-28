import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { InventariosService } from '../services/inventarios.service';
import { Inventario } from '../entities/inventario.entity';
import { CreateInventarioDto } from '../dtos/create-inventario.dto';
import { UpdateInventarioDto } from '../dtos/update-inventario.dto';
import { UpdateCantidadDto } from '../dtos/update-cantidad.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('inventarios')
@Controller('inventarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventariosController {
  constructor(private readonly inventariosService: InventariosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los inventarios' })
  @ApiOkResponse({
    description: 'Lista de inventarios obtenida correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Inventario[]> {
    return this.inventariosService.findAll();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas del inventario' })
  @ApiOkResponse({ description: 'Estadísticas obtenidas correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getEstadisticas() {
    return this.inventariosService.getEstadisticasInventario();
  }

  @Get('bajo-stock')
  @ApiOperation({ summary: 'Obtener inventarios con bajo stock' })
  @ApiOkResponse({
    description: 'Inventarios con bajo stock obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findInventariosBajoStock(): Promise<Inventario[]> {
    return this.inventariosService.findInventariosBajoStock();
  }

  @Get('vencidos')
  @ApiOperation({ summary: 'Obtener inventarios vencidos' })
  @ApiOkResponse({
    description: 'Inventarios vencidos obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findInventariosVencidos(): Promise<Inventario[]> {
    return this.inventariosService.findInventariosVencidos();
  }

  @Get('proximos-vencer')
  @ApiOperation({ summary: 'Obtener inventarios próximos a vencer' })
  @ApiQuery({ 
    name: 'dias', 
    required: false, 
    description: 'Días de anticipación (por defecto 30)',
    example: 30 
  })
  @ApiOkResponse({
    description: 'Inventarios próximos a vencer obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findInventariosProximosVencer(@Query('dias') dias?: number): Promise<Inventario[]> {
    return this.inventariosService.findInventariosProximosVencer(dias);
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener inventarios por estado' })
  @ApiOkResponse({
    description: 'Inventarios por estado obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByEstado(@Param('estado') estado: string): Promise<Inventario[]> {
    return this.inventariosService.findByEstado(estado);
  }

  @Get('medicamento/:idMedicamento')
  @ApiOperation({ summary: 'Obtener inventarios por medicamento' })
  @ApiOkResponse({
    description: 'Inventarios del medicamento obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByMedicamento(@Param('idMedicamento', ParseIntPipe) idMedicamento: number): Promise<Inventario[]> {
    return this.inventariosService.findByMedicamento(idMedicamento);
  }

  @Get('distrito/:idDistrito')
  @ApiOperation({ summary: 'Obtener inventarios por distrito' })
  @ApiOkResponse({
    description: 'Inventarios del distrito obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByDistrito(@Param('idDistrito', ParseIntPipe) idDistrito: number): Promise<Inventario[]> {
    return this.inventariosService.findByDistrito(idDistrito);
  }

  @Get('lote/:idLote')
  @ApiOperation({ summary: 'Obtener inventarios por lote' })
  @ApiOkResponse({
    description: 'Inventarios del lote obtenidos correctamente',
    type: [Inventario],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByLote(@Param('idLote', ParseIntPipe) idLote: number): Promise<Inventario[]> {
    return this.inventariosService.findByLote(idLote);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un inventario por ID' })
  @ApiOkResponse({
    description: 'Inventario encontrado correctamente',
    type: Inventario,
  })
  @ApiNotFoundResponse({ description: 'Inventario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Inventario> {
    return this.inventariosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Crear un nuevo inventario' })
  @ApiCreatedResponse({
    description: 'Inventario creado correctamente',
    type: Inventario,
  })
  @ApiConflictResponse({ description: 'Ya existe inventario para medicamento, lote y distrito' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createInventarioDto: CreateInventarioDto): Promise<Inventario> {
    return this.inventariosService.create(createInventarioDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar un inventario por ID' })
  @ApiOkResponse({
    description: 'Inventario actualizado correctamente',
    type: Inventario,
  })
  @ApiNotFoundResponse({ description: 'Inventario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventarioDto: UpdateInventarioDto,
  ): Promise<Inventario> {
    return this.inventariosService.update(id, updateInventarioDto);
  }

  @Patch(':id/cantidad')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar cantidad de un inventario' })
  @ApiOkResponse({
    description: 'Cantidad del inventario actualizada correctamente',
    type: Inventario,
  })
  @ApiNotFoundResponse({ description: 'Inventario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async updateCantidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCantidadDto: UpdateCantidadDto,
  ): Promise<Inventario> {
    return this.inventariosService.updateCantidad(id, updateCantidadDto.cantidad);
  }

  @Patch('actualizar-estados-vencimiento')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar estados por vencimiento' })
  @ApiOkResponse({ description: 'Estados actualizados correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async actualizarEstadosPorVencimiento(): Promise<{ message: string }> {
    await this.inventariosService.actualizarEstadosPorVencimiento();
    return { message: 'Estados actualizados correctamente' };
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un inventario por ID' })
  @ApiOkResponse({ description: 'Inventario eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Inventario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.inventariosService.remove(id);
  }
}