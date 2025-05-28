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
} from '@nestjs/swagger';
import { PedidosService } from '../services/pedidos.service';
import { Pedido } from '../entities/pedido.entity';
import { CreatePedidoDto } from '../dtos/create-pedido.dto';
import { UpdatePedidoDto } from '../dtos/update-pedido.dto';
import { CambiarEstadoPedidoDto } from '../dtos/cambiar-estado-pedido.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('pedidos')
@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  @ApiOkResponse({
    description: 'Lista de pedidos obtenida correctamente',
    type: [Pedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Pedido[]> {
    return this.pedidosService.findAll();
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener pedidos por estado' })
  @ApiOkResponse({
    description: 'Pedidos por estado obtenidos correctamente',
    type: [Pedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByEstado(@Param('estado') estado: string): Promise<Pedido[]> {
    return this.pedidosService.findByEstado(estado);
  }

  @Get('usuario-solicitante/:idUsuario')
  @ApiOperation({ summary: 'Obtener pedidos por usuario solicitante' })
  @ApiOkResponse({
    description: 'Pedidos del usuario solicitante obtenidos correctamente',
    type: [Pedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByUsuarioSolicitante(@Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<Pedido[]> {
    return this.pedidosService.findByUsuarioSolicitante(idUsuario);
  }

  @Get('usuario-autorizador/:idUsuario')
  @ApiOperation({ summary: 'Obtener pedidos por usuario autorizador' })
  @ApiOkResponse({
    description: 'Pedidos del usuario autorizador obtenidos correctamente',
    type: [Pedido],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByUsuarioAutorizador(@Param('idUsuario', ParseIntPipe) idUsuario: number): Promise<Pedido[]> {
    return this.pedidosService.findByUsuarioAutorizador(idUsuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiOkResponse({
    description: 'Pedido encontrado correctamente',
    type: Pedido,
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.pedidosService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO', 'USUARIO')
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiCreatedResponse({
    description: 'Pedido creado correctamente',
    type: Pedido,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    return this.pedidosService.create(createPedidoDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar un pedido por ID' })
  @ApiOkResponse({
    description: 'Pedido actualizado correctamente',
    type: Pedido,
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden actualizar pedidos pendientes' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ): Promise<Pedido> {
    return this.pedidosService.update(id, updatePedidoDto);
  }

  @Patch(':id/estado')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Cambiar estado de un pedido' })
  @ApiOkResponse({
    description: 'Estado del pedido cambiado correctamente',
    type: Pedido,
  })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Transición de estado inválida' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoPedidoDto,
  ): Promise<Pedido> {
    return this.pedidosService.cambiarEstado(id, cambiarEstadoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un pedido por ID' })
  @ApiOkResponse({ description: 'Pedido eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  @ApiBadRequestResponse({ description: 'Solo se pueden eliminar pedidos pendientes o rechazados' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pedidosService.remove(id);
  }
}