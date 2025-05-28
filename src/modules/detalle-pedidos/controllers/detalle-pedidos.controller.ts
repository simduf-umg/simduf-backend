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
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { DetallePedidosService } from '../services/detalle-pedidos.service';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { CreateDetallePedidoDto } from '../dtos/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from '../dtos/update-detalle-pedido.dto';
import { AprobarDetalleDto } from '../dtos/aprobar-detalle.dto';
import { RegistrarEntregaDto } from '../dtos/registrar-entrega.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('detalle-pedidos')
@Controller('detalle-pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DetallePedidosController {
  constructor(private readonly detallePedidosService: DetallePedidosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los detalles de pedidos' })
  @ApiOkResponse({
    description: 'Lista de detalles de pedidos obtenida correctamente',
    type: [DetallePedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<DetallePedido[]> {
    return this.detallePedidosService.findAll();
  }

  @Get('pendientes-aprobacion')
  @ApiOperation({ summary: 'Obtener detalles pendientes de aprobación' })
  @ApiOkResponse({
    description: 'Detalles pendientes de aprobación obtenidos correctamente',
    type: [DetallePedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findDetallesPendientesAprobacion(): Promise<DetallePedido[]> {
    return this.detallePedidosService.findDetallesPendientesAprobacion();
  }

  @Get('pendientes-entrega')
  @ApiOperation({ summary: 'Obtener detalles pendientes de entrega' })
  @ApiOkResponse({
    description: 'Detalles pendientes de entrega obtenidos correctamente',
    type: [DetallePedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findDetallesPendientesEntrega(): Promise<DetallePedido[]> {
    return this.detallePedidosService.findDetallesPendientesEntrega();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de detalles de pedidos' })
  @ApiOkResponse({ description: 'Estadísticas obtenidas correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getEstadisticas() {
    return this.detallePedidosService.getEstadisticasDetalle();
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener detalles por estado' })
  @ApiOkResponse({
    description: 'Detalles por estado obtenidos correctamente',
    type: [DetallePedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByEstado(@Param('estado') estado: string): Promise<DetallePedido[]> {
    return this.detallePedidosService.findByEstado(estado);
  }

  @Get('pedido/:idPedido')
  @ApiOperation({ summary: 'Obtener detalles por pedido' })
  @ApiOkResponse({
    description: 'Detalles del pedido obtenidos correctamente',
    type: [DetallePedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByPedido(@Param('idPedido', ParseIntPipe) idPedido: number): Promise<DetallePedido[]> {
    return this.detallePedidosService.findByPedido(idPedido);
  }

  @Get('pedido/:idPedido/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de un pedido específico' })
  @ApiOkResponse({ description: 'Estadísticas del pedido obtenidas correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getEstadisticasPedido(@Param('idPedido', ParseIntPipe) idPedido: number) {
    return this.detallePedidosService.getEstadisticasDetalle(idPedido);
  }

  @Get('pedido/:idPedido/completitud')
  @ApiOperation({ summary: 'Verificar completitud de un pedido' })
  @ApiOkResponse({ description: 'Estado de completitud verificado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async verificarCompletitudPedido(@Param('idPedido', ParseIntPipe) idPedido: number): Promise<{ completo: boolean }> {
    const completo = await this.detallePedidosService.verificarCompletitudPedido(idPedido);
    return { completo };
  }

  @Get('medicamento/:idMedicamento')
  @ApiOperation({ summary: 'Obtener detalles por medicamento' })
  @ApiOkResponse({
    description: 'Detalles del medicamento obtenidos correctamente',
    type: [DetallePedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByMedicamento(@Param('idMedicamento', ParseIntPipe) idMedicamento: number): Promise<DetallePedido[]> {
    return this.detallePedidosService.findByMedicamento(idMedicamento);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle de pedido por ID' })
  @ApiOkResponse({
    description: 'Detalle de pedido encontrado correctamente',
    type: DetallePedido,
  })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DetallePedido> {
    return this.detallePedidosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Crear un nuevo detalle de pedido' })
  @ApiCreatedResponse({
    description: 'Detalle de pedido creado correctamente',
    type: DetallePedido,
  })
  @ApiConflictResponse({ description: 'El medicamento ya está incluido en este pedido' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createDetallePedidoDto: CreateDetallePedidoDto): Promise<DetallePedido> {
    return this.detallePedidosService.create(createDetallePedidoDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar un detalle de pedido por ID' })
  @ApiOkResponse({
    description: 'Detalle de pedido actualizado correctamente',
    type: DetallePedido,
  })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden actualizar detalles pendientes de pedidos pendientes' })
  @ApiConflictResponse({ description: 'El medicamento ya está incluido en este pedido' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetallePedidoDto: UpdateDetallePedidoDto,
  ): Promise<DetallePedido> {
    return this.detallePedidosService.update(id, updateDetallePedidoDto);
  }

  @Patch(':id/aprobar')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Aprobar o modificar un detalle de pedido' })
  @ApiOkResponse({
    description: 'Detalle de pedido aprobado/modificado correctamente',
    type: DetallePedido,
  })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden aprobar detalles pendientes o parciales' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDetalleDto: AprobarDetalleDto,
  ): Promise<DetallePedido> {
    return this.detallePedidosService.aprobar(id, aprobarDetalleDto);
  }

  @Patch(':id/entregar')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Registrar entrega de un detalle de pedido' })
  @ApiOkResponse({
    description: 'Entrega registrada correctamente',
    type: DetallePedido,
  })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden entregar detalles aprobados o parciales' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async registrarEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Body() registrarEntregaDto: RegistrarEntregaDto,
  ): Promise<DetallePedido> {
    return this.detallePedidosService.registrarEntrega(id, registrarEntregaDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un detalle de pedido por ID' })
  @ApiOkResponse({ description: 'Detalle de pedido eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden eliminar detalles pendientes de pedidos pendientes' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.detallePedidosService.remove(id);
  }
}