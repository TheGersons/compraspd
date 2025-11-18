import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

// Tipo extendido de Usuario con el nombre del rol
type UsuarioWithRoleName = {
  id: string;
  email: string;
  passwordHash: string;
  nombre: string;
  activo: boolean;
  departamentoId: string;
  rol: { nombre: string } | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService, 
    private jwt: JwtService
  ) {}

  /**
   * Valida las credenciales del usuario y carga su rol
   */
  async validateUser(email: string, pass: string): Promise<UsuarioWithRoleName> {
    this.logger.debug(`Intentando autenticar usuario: ${email}`);

    // Buscar usuario con su rol
    const usuario = await this.prisma.usuario.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        nombre: true,
        activo: true,
        departamentoId: true,
        rol: {
          select: { nombre: true }
        }
      }
    });

    // Validar existencia
    if (!usuario) {
      this.logger.warn(`Usuario no encontrado: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar que esté activo
    if (!usuario.activo) {
      this.logger.warn(`Usuario inactivo intentó iniciar sesión: ${email}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(pass, usuario.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta para usuario: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`Usuario autenticado exitosamente: ${email} - Rol: ${usuario.rol?.nombre}`);
    
    return usuario;
  }

  /**
   * Genera el token JWT con el payload del usuario
   */
  sign(usuario: UsuarioWithRoleName) {
    const roleName = usuario.rol?.nombre || 'USER';
    
    const payload = { 
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      role: roleName,
      jti: randomUUID() // Token ID único para tracking/revocación
    };

    this.logger.debug(`Generando token para usuario: ${usuario.email}`);

    const expiresIn = process.env.JWT_EXPIRES || '1d';

    return {
      access_token: this.jwt.sign(payload, { expiresIn }),
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        role: roleName
      }
    };
  }

  /**
   * Obtiene información del usuario actual (endpoint /me)
   */
  async me(userId: string) {
    this.logger.debug(`Obteniendo información del usuario: ${userId}`);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        departamentoId: true,
        activo: true,
        creado: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        departamento: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!usuario) {
      this.logger.warn(`Usuario no encontrado para /me: ${userId}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      this.logger.warn(`Usuario inactivo accedió a /me: ${userId}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    return usuario;
  }

  /**
   * Validar si un token es válido (útil para refresh tokens futuros)
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwt.verify(token);
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        select: { activo: true }
      });
      return usuario?.activo ?? false;
    } catch (error) {
      return false;
    }
  }
}