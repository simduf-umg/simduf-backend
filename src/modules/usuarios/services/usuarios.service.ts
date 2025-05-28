import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { PersonasService } from '../../personas/services/personas.service';
import { RolesService } from '../../roles/services/roles.service';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private usuariosRepository: Repository<Usuario>,
        private personasService: PersonasService,
        private rolesService: RolesService,
    ) { }

    async findAll(): Promise<Usuario[]> {
        return this.usuariosRepository.find({
            relations: ['persona', 'roles'],
        });
    }

    async findOne(id: number): Promise<Usuario | null> {
        return this.usuariosRepository.findOne({
            where: { user_id: id },
            relations: ['persona', 'roles'],
        });
    }

    async findByUsername(username: string): Promise<Usuario | null> {
        return this.usuariosRepository.findOne({
            where: { username },
            relations: ['persona', 'roles'],
        });
    }

    async findByCorreo(correo: string): Promise<Usuario | null> {
        return this.usuariosRepository.findOne({
            where: { correo },
            relations: ['persona', 'roles'],
        });
    }

    async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
        // Verificar si la persona existe
        const persona = await this.personasService.findOne(createUsuarioDto.id_persona);
        if (!persona) {
            throw new NotFoundException(
                `Persona con ID ${createUsuarioDto.id_persona} no encontrada`,
            );
        }

        // Verificar si el username ya existe
        const existingUser = await this.findByUsername(createUsuarioDto.username);
        if (existingUser) {
            throw new ConflictException(`El nombre de usuario '${createUsuarioDto.username}' ya existe`);
        }

        // Verificar si el correo ya existe
        const existingCorreo = await this.findByCorreo(createUsuarioDto.correo);
        if (existingCorreo) {
            throw new ConflictException(`El correo '${createUsuarioDto.correo}' ya está registrado`);
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(createUsuarioDto.contrasena, 10);

        // Crear el usuario
        const usuario = this.usuariosRepository.create({
            ...createUsuarioDto,
            contrasena: hashedPassword,
        });

        // Asignar roles si se proporcionaron
        if (createUsuarioDto.rolIds && createUsuarioDto.rolIds.length > 0) {
            const roles = await Promise.all(
                createUsuarioDto.rolIds.map(async id => {
                    const rol = await this.rolesService.findOne(id);
                    if (!rol) {
                        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
                    }
                    return rol;
                })
            );

            usuario.roles = roles;
        }

        return this.usuariosRepository.save(usuario);
    }

    async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
        const usuario = await this.findOne(id);
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        // Verificar si la persona existe si se proporciona
        if (updateUsuarioDto.id_persona) {
            const persona = await this.personasService.findOne(updateUsuarioDto.id_persona);
            if (!persona) {
                throw new NotFoundException(
                    `Persona con ID ${updateUsuarioDto.id_persona} no encontrada`,
                );
            }
            usuario.id_persona = updateUsuarioDto.id_persona;
        }

        // Verificar si el username ya existe si se proporciona
        if (updateUsuarioDto.username && updateUsuarioDto.username !== usuario.username) {
            const existingUser = await this.findByUsername(updateUsuarioDto.username);
            if (existingUser) {
                throw new ConflictException(`El nombre de usuario '${updateUsuarioDto.username}' ya existe`);
            }
            usuario.username = updateUsuarioDto.username;
        }

        // Verificar si el correo ya existe si se proporciona
        if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
            const existingCorreo = await this.findByCorreo(updateUsuarioDto.correo);
            if (existingCorreo) {
                throw new ConflictException(`El correo '${updateUsuarioDto.correo}' ya está registrado`);
            }
            usuario.correo = updateUsuarioDto.correo;
        }

        // Actualizar campos básicos
        if (updateUsuarioDto.activo !== undefined) {
            usuario.activo = updateUsuarioDto.activo;
        }

        // Actualizar roles si se proporcionaron
        if (updateUsuarioDto.rolIds && updateUsuarioDto.rolIds.length > 0) {
            const roles = await Promise.all(
                updateUsuarioDto.rolIds.map(async id => {
                    const rol = await this.rolesService.findOne(id);
                    if (!rol) {
                        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
                    }
                    return rol;
                })
            );

            usuario.roles = roles;
        }

        return this.usuariosRepository.save(usuario);
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<Usuario> {
        // Buscar el usuario
        const usuario = await this.usuariosRepository.findOne({
            where: { user_id: id }
        });

        // Verificar que el usuario existe
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        // Verificar la contraseña actual
        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.contrasenaActual,
            usuario.contrasena,
        );

        if (!isPasswordValid) {
            throw new BadRequestException('La contraseña actual es incorrecta');
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(changePasswordDto.nuevaContrasena, 10);
        usuario.contrasena = hashedPassword;

        // Guardar el usuario actualizado
        return this.usuariosRepository.save(usuario);
    }
    async remove(id: number): Promise<void> {
        const usuario = await this.findOne(id);
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        await this.usuariosRepository.delete(id);
    }
}