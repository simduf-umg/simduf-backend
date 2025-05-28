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
  ApiConflictResponse,
} from '@nestjs/swagger';
import { DetallePedidosService } from '../services/detalle-pedidos.service';
import { DetallePedido } from '../entities/detalle-pedido.entity';
import { CreateDetallePedidoDto } from '../dtos/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from '../dtos/update-detalle-pedido.dto';
import { AprobarDetalleDto } from '../dtos/aprobar-detalle.dto';
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
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetallePedidoDto: UpdateDetallePedidoDto,
  ): Promise<DetallePedido> {
    return this.detallePedidosService.update(id, updateDetallePedidoDto);
  }

  @Patch(':id/aprobar')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Aprobar o modificar la cantidad aprobada de un detalle de pedido' })
  @ApiOkResponse({
    description: 'Detalle de pedido aprobado/modificado correctamente',
    type: DetallePedido,
  })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDetalleDto: AprobarDetalleDto,
  ): Promise<DetallePedido> {
    return this.detallePedidosService.aprobar(id, aprobarDetalleDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un detalle de pedido por ID' })
  @ApiOkResponse({ description: 'Detalle de pedido eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Detalle de pedido no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.detallePedidosService.remove(id);
  }
}