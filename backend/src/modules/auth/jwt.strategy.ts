import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// Tipos para el payload JWT
type RawJwtPayload = { 
  sub?: unknown; 
  email?: unknown; 
  nombre?: unknown;
  role?: unknown; 
  jti?: unknown;
  iat?: unknown; 
  exp?: unknown;
};

// Tipo del usuario validado que se agregará a req.user
export type JwtUser = { 
  sub: string;      // ID del usuario
  email: string;    // Email del usuario
  nombre: string;   // Nombre del usuario
  role: string;     // Rol del usuario (normalizado a mayúsculas)
  jti?: string;     // Token ID para tracking
};

// Helper para validar strings
function isString(x: unknown): x is string { 
  return typeof x === 'string' && x.length > 0; 
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService) {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false, // Respetar fecha de expiración
    };
    super(opts);
  }

  /**
   * Valida el payload del JWT y devuelve el objeto usuario
   * que estará disponible en req.user
   */
  async validate(payload: RawJwtPayload): Promise<JwtUser> {
    this.logger.debug(`Validando token JWT para usuario: ${payload.sub}`);

    // 1. Validación estructural del payload
    if (!payload || !isString(payload.sub) || !isString(payload.email)) {
      this.logger.warn('Payload JWT inválido o incompleto');
      throw new UnauthorizedException('Token inválido');
    }

    // 2. Validar que el usuario exista y esté activo en la base de datos
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        activo: true,
        rol: {
          select: { nombre: true }
        }
      }
    });

    if (!usuario) {
      this.logger.warn(`Usuario no encontrado para token: ${payload.sub}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      this.logger.warn(`Usuario inactivo intentó usar token: ${payload.sub}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 3. Normalizar rol (mayúsculas para consistencia)
    const role = isString(payload.role) 
      ? payload.role.toUpperCase() 
      : usuario.rol?.nombre?.toUpperCase() || 'USER';

    const nombre = isString(payload.nombre) ? payload.nombre : '';

    // 4. Opcional: Validar JTI contra una blacklist (para logout/revocación)
    // if (payload.jti && await this.isTokenBlacklisted(payload.jti)) {
    //   throw new UnauthorizedException('Token revocado');
    // }

    this.logger.debug(`Token validado exitosamente para: ${payload.email}`);

    // 5. Devolver el objeto que estará en req.user
    return {
      sub: payload.sub,
      email: payload.email,
      nombre,
      role,
      jti: isString(payload.jti) ? payload.jti : undefined
    };
  }

  /**
   * (Opcional) Método para verificar si un token está en blacklist
   * Útil para implementar logout o revocación de tokens
   */
  // private async isTokenBlacklisted(jti: string): Promise<boolean> {
  //   // Implementar con Redis o tabla en DB
  //   return false;
  // }
}