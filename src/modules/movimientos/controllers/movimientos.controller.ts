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
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { MovimientosService } from '../services/movimientos.service';
import { Movimiento } from '../entities/movimiento.entity';
import { CreateMovimientoDto } from '../dtos/create-movimiento.dto';
import { UpdateMovimientoDto } from '../dtos/update-movimiento.dto';
import { CambiarEstadoDto } from '../dtos/cambiar-estado.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('movimientos')
@Controller('movimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los movimientos' })
  @ApiOkResponse({
    description: 'Lista de movimientos obtenida correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Movimiento[]> {
    return this.movimientosService.findAll();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de movimientos' })
  @ApiQuery({ name: 'fechaInicio', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'fechaFin', required: false, example: '2024-12-31' })
  @ApiOkResponse({ description: 'Estadísticas obtenidas correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getEstadisticas(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
    const fin = fechaFin ? new Date(fechaFin) : undefined;
    return this.movimientosService.getEstadisticasMovimientos(inicio, fin);
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Obtener movimientos pendientes' })
  @ApiOkResponse({
    description: 'Movimientos pendientes obtenidos correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findMovimientosPendientes(): Promise<Movimiento[]> {
    return this.movimientosService.findMovimientosPendientes();
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Obtener movimientos por tipo' })
  @ApiOkResponse({
    description: 'Movimientos por tipo obtenidos correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByTipo(@Param('tipo') tipo: string): Promise<Movimiento[]> {
    return this.movimientosService.findByTipo(tipo);
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener movimientos por estado' })
  @ApiOkResponse({
    description: 'Movimientos por estado obtenidos correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByEstado(@Param('estado') estado: string): Promise<Movimiento[]> {
    return this.movimientosService.findByEstado(estado);
  }

  @Get('inventario/:idInventario')
  @ApiOperation({ summary: 'Obtener movimientos por inventario' })
  @ApiOkResponse({
    description: 'Movimientos del inventario obtenidos correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByInventario(@Param('idInventario', ParseIntPipe) idInventario: number): Promise<Movimiento[]> {
    return this.movimientosService.findByInventario(idInventario);
  }

  @Get('usuario/:idUsuario')
  @ApiOperation({ summary: 'Obtener movimientos por usuario' })
  @ApiOkResponse({
    description: 'Movimientos del usuario obtenidos correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<Movimiento[]> {
    return this.movimientosService.findByUsuario(idUsuario);
  }

  @Get('fechas')
  @ApiOperation({ summary: 'Obtener movimientos por rango de fechas' })
  @ApiQuery({ name: 'fechaInicio', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'fechaFin', required: true, example: '2024-12-31' })
  @ApiOkResponse({
    description: 'Movimientos por fechas obtenidos correctamente',
    type: [Movimiento],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByFechas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<Movimiento[]> {
    return this.movimientosService.findByFechas(new Date(fechaInicio), new Date(fechaFin));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiOkResponse({
    description: 'Movimiento encontrado correctamente',
    type: Movimiento,
  })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Movimiento> {
    return this.movimientosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Crear un nuevo movimiento' })
  @ApiCreatedResponse({
    description: 'Movimiento creado correctamente',
    type: Movimiento,
  })
  @ApiBadRequestResponse({ description: 'Stock insuficiente o datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createMovimientoDto: CreateMovimientoDto): Promise<Movimiento> {
    return this.movimientosService.create(createMovimientoDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar un movimiento por ID' })
  @ApiOkResponse({
    description: 'Movimiento actualizado correctamente',
    type: Movimiento,
  })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden actualizar movimientos pendientes' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovimientoDto: UpdateMovimientoDto,
  ): Promise<Movimiento> {
    return this.movimientosService.update(id, updateMovimientoDto);
  }

  @Patch(':id/estado')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Cambiar estado de un movimiento' })
  @ApiOkResponse({
    description: 'Estado del movimiento cambiado correctamente',
    type: Movimiento,
  })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado' })
  @ApiBadRequestResponse({ description: 'Stock insuficiente para procesar' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoDto,
  ): Promise<Movimiento> {
    return this.movimientosService.cambiarEstado(id, cambiarEstadoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un movimiento por ID' })
  @ApiOkResponse({ description: 'Movimiento eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado' })
  @ApiBadRequestResponse({ description: 'No se puede eliminar un movimiento completado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.movimientosService.remove(id);
  }
}