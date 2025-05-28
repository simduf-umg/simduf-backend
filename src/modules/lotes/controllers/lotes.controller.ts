import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
} from '@nestjs/swagger';
import { LotesService } from '../services/lotes.service';
import { Lote } from '../entities/lote.entity';
import { CreateLoteDto } from '../dtos/create-lote.dto';
import { UpdateLoteDto } from '../dtos/update-lote.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('lotes')
@Controller('lotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los lotes' })
  @ApiOkResponse({
    description: 'Lista de lotes obtenida correctamente',
    type: [Lote],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Lote[]> {
    return this.lotesService.findAll();
  }

  @Get('caducados')
  @ApiOperation({ summary: 'Obtener lotes caducados' })
  @ApiOkResponse({
    description: 'Lista de lotes caducados obtenida correctamente',
    type: [Lote],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findLotesCaducados(): Promise<Lote[]> {
    return this.lotesService.findLotesCaducados();
  }

  @Get('proximos-caducar')
  @ApiOperation({ summary: 'Obtener lotes próximos a caducar' })
  @ApiQuery({ 
    name: 'dias', 
    required: false, 
    description: 'Días de anticipación (por defecto 30)',
    example: 30 
  })
  @ApiOkResponse({
    description: 'Lista de lotes próximos a caducar obtenida correctamente',
    type: [Lote],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findLotesProximosACaducar(@Query('dias') dias?: number): Promise<Lote[]> {
    return this.lotesService.findLotesProximosACaducar(dias);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  @ApiOkResponse({
    description: 'Lote encontrado correctamente',
    type: Lote,
  })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Lote> {
    return this.lotesService.findOne(id);
  }

  @Get('medicamento/:idMedicamento')
  @ApiOperation({ summary: 'Obtener lotes por medicamento' })
  @ApiOkResponse({
    description: 'Lotes del medicamento obtenidos correctamente',
    type: [Lote],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findByMedicamento(@Param('idMedicamento', ParseIntPipe) idMedicamento: number): Promise<Lote[]> {
    return this.lotesService.findByMedicamento(idMedicamento);
  }

  @Post()
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Crear un nuevo lote' })
  @ApiCreatedResponse({
    description: 'Lote creado correctamente',
    type: Lote,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createLoteDto: CreateLoteDto): Promise<Lote> {
    return this.lotesService.create(createLoteDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar un lote por ID' })
  @ApiOkResponse({
    description: 'Lote actualizado correctamente',
    type: Lote,
  })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoteDto: UpdateLoteDto,
  ): Promise<Lote> {
    return this.lotesService.update(id, updateLoteDto);
  }

  @Patch(':id/cantidad')
  @Roles('ADMIN', 'FARMACEUTICO')
  @ApiOperation({ summary: 'Actualizar cantidad de un lote' })
  @ApiOkResponse({
    description: 'Cantidad del lote actualizada correctamente',
    type: Lote,
  })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async updateCantidad(
    @Param('id', ParseIntPipe) id: number,
    @Body('cantidad') cantidad: number,
  ): Promise<Lote> {
    return this.lotesService.updateCantidad(id, cantidad);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un lote por ID' })
  @ApiOkResponse({ description: 'Lote eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Lote no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.lotesService.remove(id);
  }
}
