// src/auth/auth.service.ts - VERSIÓN ACTUALIZADA CON SESIONES

import { Injectable, UnauthorizedException, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { MailService } from '../Mail/mail.service';

type UsuarioWithRoleName = {
  id: string;
  email: string;
  passwordHash: string;
  nombre: string;
  activo: boolean;
  departamentoId: string;
  rol: { nombre: string } | null;
};

type LoginMetadata = {
  ip?: string;
  userAgent?: string;
  dispositivo?: string;
  navegador?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly mailService: MailService,
  ) { }

  /**
 * Generar contraseña temporal segura
 */
  private generateTempPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%&*';
    const all = lowercase + uppercase + numbers + special;

    // Asegurar al menos uno de cada tipo
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Completar el resto
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Mezclar caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Restablecer contraseña - envía contraseña temporal por email
   */
  async resetPassword(email: string) {
    // Buscar usuario por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
      }
    });

    // Por seguridad, siempre respondemos igual (no revelar si existe el email)
    if (!usuario || !usuario.activo) {
      // Simulamos un pequeño delay para no revelar si existe o no
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'Si el correo existe, recibirás una contraseña temporal' };
    }

    // Generar contraseña temporal
    const tempPassword = this.generateTempPassword(12);

    // Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    // Actualizar en base de datos
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash,
        actualizado: new Date(),
      }
    });

    // Enviar email
    const emailSent = await this.mailService.sendPasswordResetEmail(
      usuario.email,
      tempPassword,
      usuario.nombre
    );

    if (!emailSent) {
      throw new Error('Error al enviar el correo. Intenta de nuevo.');
    }

    return { message: 'Si el correo existe, recibirás una contraseña temporal' };
  }

  /**
   * Valida las credenciales del usuario
   */
  async validateUser(email: string, pass: string): Promise<UsuarioWithRoleName> {
    this.logger.debug(`Intentando autenticar usuario: ${email}`);

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

    if (!usuario) {
      this.logger.warn(`Usuario no encontrado: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      this.logger.warn(`Usuario inactivo: ${email}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(pass, usuario.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`Usuario autenticado: ${email}`);
    return usuario;
  }

  // AGREGAR ESTOS MÉTODOS A auth.service.ts

  /**
   * Genera tokens y crea sesión en DB
   * IMPORTANTE: Cierra sesiones anteriores del mismo dispositivo
   */
  async sign(usuario: UsuarioWithRoleName, metadata?: LoginMetadata) {
    const roleName = usuario.rol?.nombre || 'USER';

    // 1. CERRAR SESIONES ANTERIORES DEL MISMO DISPOSITIVO
    // Esto evita sesiones duplicadas
    if (metadata?.userAgent) {
      await this.prisma.sesion.updateMany({
        where: {
          usuarioId: usuario.id,
          userAgent: metadata.userAgent,
          activa: true
        },
        data: { activa: false }
      });

      this.logger.log(`Sesiones anteriores cerradas para: ${usuario.email}`);
    }

    // Generar IDs únicos
    const jti = randomUUID();
    const refreshJti = randomUUID();

    // Configuración de expiración
    const accessTokenExpiry = process.env.JWT_EXPIRES as any || '15m';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES as any || '7d';

    // Payload del access token
    const accessPayload = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      role: roleName,
      jti: jti
    };

    // Payload del refresh token
    const refreshPayload = {
      sub: usuario.id,
      jti: refreshJti,
      type: 'refresh'
    };

    // Generar tokens
    const accessToken = this.jwt.sign(accessPayload, { expiresIn: accessTokenExpiry });
    const refreshToken = this.jwt.sign(refreshPayload, { expiresIn: refreshTokenExpiry });

    // Calcular fechas de expiración
    const now = new Date();
    const accessExpiry = new Date(now.getTime() + this.parseExpiry(accessTokenExpiry));
    const refreshExpiry = new Date(now.getTime() + this.parseExpiry(refreshTokenExpiry));

    // 2. LIMITAR NÚMERO DE SESIONES ACTIVAS (opcional)
    // Mantener máximo 5 sesiones activas por usuario
    const sesionesActivas = await this.prisma.sesion.count({
      where: {
        usuarioId: usuario.id,
        activa: true
      }
    });

    if (sesionesActivas >= 5) {
      // Cerrar la sesión más antigua
      const sesionMasAntigua = await this.prisma.sesion.findFirst({
        where: {
          usuarioId: usuario.id,
          activa: true
        },
        orderBy: { creado: 'asc' }
      });

      if (sesionMasAntigua) {
        await this.prisma.sesion.update({
          where: { id: sesionMasAntigua.id },
          data: { activa: false }
        });

        this.logger.log(`Sesión antigua cerrada para mantener límite de 5`);
      }
    }

    // 3. Guardar nueva sesión en DB
    await this.prisma.sesion.create({
      data: {
        usuarioId: usuario.id,
        token: accessToken,
        jti: jti,
        refreshToken: refreshToken,
        userAgent: metadata?.userAgent,
        ip: metadata?.ip,
        dispositivo: metadata?.dispositivo,
        navegador: metadata?.navegador,
        expiraEn: accessExpiry,
        refreshExpiraEn: refreshExpiry,
        activa: true
      }
    });

    this.logger.log(`Nueva sesión creada para: ${usuario.email} (JTI: ${jti})`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: accessTokenExpiry,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        role: roleName
      }
    };
  }

  /**
   * NUEVO: Limpia sesiones expiradas automáticamente
   * Llamar al inicio de la aplicación
   */
  async cleanExpiredSessions() {
    try {
      const now = new Date();

      const result = await this.prisma.sesion.updateMany({
        where: {
          OR: [
            { expiraEn: { lt: now } },
            { refreshExpiraEn: { lt: now } }
          ],
          activa: true
        },
        data: { activa: false }
      });

      this.logger.log(`Sesiones expiradas limpiadas: ${result.count}`);

      return { count: result.count };
    } catch (error) {
      this.logger.error('Error al limpiar sesiones:', error);
      return { count: 0 };
    }
  }

  /**
   * NUEVO: Elimina físicamente sesiones inactivas viejas (más de 30 días)
   * Para mantener la tabla limpia
   */
  async deleteOldSessions() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.sesion.deleteMany({
        where: {
          activa: false,
          actualizado: { lt: thirtyDaysAgo }
        }
      });

      this.logger.log(`Sesiones antiguas eliminadas: ${result.count}`);

      return { count: result.count };
    } catch (error) {
      this.logger.error('Error al eliminar sesiones antiguas:', error);
      return { count: 0 };
    }
  }



  /**
   * Renueva el access token usando un refresh token válido
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verificar refresh token
      const payload = this.jwt.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar sesión en DB
      const sesion = await this.prisma.sesion.findUnique({
        where: { refreshToken },
        include: {
          usuario: {
            include: {
              rol: {
                select: { nombre: true }
              }
            }
          }
        }
      });

      if (!sesion || !sesion.activa) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      // Verificar que no haya expirado
      if (new Date() > sesion.refreshExpiraEn) {
        await this.prisma.sesion.update({
          where: { id: sesion.id },
          data: { activa: false }
        });
        throw new UnauthorizedException('Sesión expirada');
      }

      // Generar nuevo access token
      const newJti = randomUUID();
      const accessTokenExpiry = process.env.JWT_EXPIRES as any || '15m';

      const accessPayload = {
        sub: sesion.usuario.id,
        email: sesion.usuario.email,
        nombre: sesion.usuario.nombre,
        role: sesion.usuario.rol?.nombre || 'USER',
        jti: newJti
      };

      const newAccessToken = this.jwt.sign(accessPayload, { expiresIn: accessTokenExpiry });
      const accessExpiry = new Date(Date.now() + this.parseExpiry(accessTokenExpiry));

      // Actualizar sesión con nuevo access token
      await this.prisma.sesion.update({
        where: { id: sesion.id },
        data: {
          token: newAccessToken,
          jti: newJti,
          expiraEn: accessExpiry,
          ultimoAcceso: new Date()
        }
      });

      this.logger.log(`Token renovado para: ${sesion.usuario.email}`);

      return {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: accessTokenExpiry
      };
    } catch (error) {
      this.logger.error('Error al renovar token:', error);
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  /**
   * Valida que una sesión esté activa en DB
   */
  async validateSession(jti: string): Promise<boolean> {
    const sesion = await this.prisma.sesion.findUnique({
      where: { jti },
      select: {
        activa: true,
        expiraEn: true
      }
    });

    if (!sesion || !sesion.activa) {
      return false;
    }

    // Verificar expiración
    if (new Date() > sesion.expiraEn) {
      await this.prisma.sesion.update({
        where: { jti },
        data: { activa: false }
      });
      return false;
    }

    // Actualizar último acceso
    await this.prisma.sesion.update({
      where: { jti },
      data: { ultimoAcceso: new Date() }
    });

    return true;
  }

  /**
   * Cierra sesión invalidando el token en DB
   */
  async logout(jti: string) {
    try {
      await this.prisma.sesion.updateMany({
        where: { jti },
        data: { activa: false }
      });

      this.logger.log(`Sesión cerrada: ${jti}`);

      return { ok: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      this.logger.error('Error al cerrar sesión:', error);
      throw new UnauthorizedException('Error al cerrar sesión');
    }
  }

  /**
   * Cierra todas las sesiones de un usuario
   */
  async logoutAll(usuarioId: string) {
    await this.prisma.sesion.updateMany({
      where: {
        usuarioId,
        activa: true
      },
      data: { activa: false }
    });

    this.logger.log(`Todas las sesiones cerradas para usuario: ${usuarioId}`);

    return { ok: true, message: 'Todas las sesiones cerradas' };
  }

  /**
   * Lista sesiones activas de un usuario
   */
  async listSessions(usuarioId: string) {
    return this.prisma.sesion.findMany({
      where: {
        usuarioId,
        activa: true
      },
      select: {
        id: true,
        dispositivo: true,
        navegador: true,
        ip: true,
        creado: true,
        ultimoAcceso: true,
        expiraEn: true
      },
      orderBy: { ultimoAcceso: 'desc' }
    });
  }
  /**
       * Obtiene información del usuario actual
   */
  async me(userId: string) {
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

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return usuario;
  }

  /**
   * Revoca una sesión específica (solo si pertenece al usuario)
   */
  async revokeSession(sessionId: string, usuarioId: string) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: sessionId },
      select: { usuarioId: true }
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (sesion.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para cerrar esta sesión');
    }

    await this.prisma.sesion.update({
      where: { id: sessionId },
      data: { activa: false }
    });

    this.logger.log(`Sesión revocada: ${sessionId}`);

    return { ok: true, message: 'Sesión cerrada' };
  }

  /**
   * Helper: Convierte string de expiración a milisegundos
   */
  private parseExpiry(expiry: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // Default 15 minutos

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  // AGREGAR ESTE MÉTODO A auth.service.ts

  /**
   * Obtiene estadísticas de sesiones para reportes
   */
  async getSessionStats() {
    try {
      const [
        activeSessions,
        uniqueUsers,
        webSessions,
        mobileSessions,
        desktopSessions
      ] = await Promise.all([
        // Total de sesiones activas
        this.prisma.sesion.count({
          where: { activa: true }
        }),

        // Usuarios únicos con sesión activa
        this.prisma.sesion.groupBy({
          by: ['usuarioId'],
          where: { activa: true },
          _count: true
        }),

        // Sesiones web
        this.prisma.sesion.count({
          where: {
            activa: true,
            dispositivo: 'web'
          }
        }),

        // Sesiones móviles
        this.prisma.sesion.count({
          where: {
            activa: true,
            dispositivo: 'mobile'
          }
        }),

        // Sesiones desktop
        this.prisma.sesion.count({
          where: {
            activa: true,
            dispositivo: 'desktop'
          }
        })
      ]);

      return {
        activeSessions,
        uniqueUsers: uniqueUsers.length,
        webSessions,
        mobileSessions,
        desktopSessions
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas de sesiones:', error);
      return {
        activeSessions: 0,
        uniqueUsers: 0,
        webSessions: 0,
        mobileSessions: 0,
        desktopSessions: 0
      };
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Obtener usuario con su hash de contraseña
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      }
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        actualizado: new Date()
      }
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
