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
import { PersonasService } from '../services/personas.service';
import { Persona } from '../entities/persona.entity';
import { CreatePersonaDto } from '../dtos/create-persona.dto';
import { UpdatePersonaDto } from '../dtos/update-persona.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('personas')
@Controller('personas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PersonasController {
  constructor(private readonly personasService: PersonasService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las personas' })
  @ApiOkResponse({
    description: 'Lista de personas obtenida correctamente',
    type: [Persona],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(): Promise<Persona[]> {
    return this.personasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una persona por ID' })
  @ApiOkResponse({
    description: 'Persona encontrada correctamente',
    type: Persona,
  })
  @ApiNotFoundResponse({ description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Persona> {
    const persona = await this.personasService.findOne(id);
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return persona;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiCreatedResponse({
    description: 'Persona creada correctamente',
    type: Persona,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(@Body() createPersonaDto: CreatePersonaDto): Promise<Persona> {
    return this.personasService.create(createPersonaDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una persona por ID' })
  @ApiOkResponse({
    description: 'Persona actualizada correctamente',
    type: Persona,
  })
  @ApiNotFoundResponse({ description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ): Promise<Persona> {
    const persona = await this.personasService.findOne(id);
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una persona por ID' })
  @ApiOkResponse({ description: 'Persona eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const persona = await this.personasService.findOne(id);
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return this.personasService.remove(id);
  }
}