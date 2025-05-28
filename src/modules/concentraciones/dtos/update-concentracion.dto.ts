import { PartialType } from '@nestjs/swagger';
import { CreateConcentracionDto } from './create-concentracion.dto';

export class UpdateConcentracionDto extends PartialType(CreateConcentracionDto) {}
