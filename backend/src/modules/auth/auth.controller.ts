// src/auth/auth.controller.ts - VERSIÓN COMPLETA

import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Headers,
  Request,
  Ip
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-passwird.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  /**
   * Login - Autenticación de usuario
   * Crea sesión en DB y devuelve access + refresh tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ip?: string
  ) {
    this.logger.log(`Intento de login: ${dto.email}`);

    const usuario = await this.authService.validateUser(dto.email, dto.password);

    // Detectar dispositivo/navegador
    const metadata = this.parseUserAgent(userAgent);

    const result = await this.authService.sign(usuario, {
      ip,
      userAgent,
      dispositivo: metadata.dispositivo,
      navegador: metadata.navegador
    });

    this.logger.log(`Login exitoso: ${usuario.email} - Rol: ${usuario.rol?.nombre}`);

    return result;
  }

  /**
   * Me - Obtener información del usuario autenticado
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Información obtenida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async me(@Req() req: any) {
    const userId = req.user?.sub;
    this.logger.debug(`Usuario solicitando /me: ${userId}`);
    return this.authService.me(userId);
  }

  /**
   * Refresh - Renovar access token usando refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 200, description: 'Token renovado' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(@Body() body: { refresh_token: string }) {
    this.logger.log('Renovando token...');
    return this.authService.refreshToken(body.refresh_token);
  }

  /**
   * Logout - Cerrar sesión actual
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión actual' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  async logout(@Req() req: any) {
    const jti = req.user?.jti;
    this.logger.log(`Cerrando sesión: ${jti}`);
    return this.authService.logout(jti);
  }

  /**
   * Logout All - Cerrar todas las sesiones del usuario
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar todas las sesiones del usuario' })
  @ApiResponse({ status: 200, description: 'Todas las sesiones cerradas' })
  async logoutAll(@Req() req: any) {
    const userId = req.user?.sub;
    this.logger.log(`Cerrando todas las sesiones: ${userId}`);
    return this.authService.logoutAll(userId);
  }

  /**
   * List Sessions - Listar sesiones activas del usuario
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar sesiones activas' })
  @ApiResponse({ status: 200, description: 'Lista de sesiones' })
  async listSessions(@Req() req: any) {
    const userId = req.user?.sub;
    return this.authService.listSessions(userId);
  }

  /**
   * Revoke Session - Cerrar una sesión específica
   */
  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar una sesión específica' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    this.logger.log(`Usuario ${userId} cerrando sesión: ${sessionId}`);

    // Verificar que la sesión pertenece al usuario
    await this.authService.revokeSession(sessionId, userId);

    return { ok: true, message: 'Sesión cerrada' };
  }

  /**
   * Helper: Parse user agent string
   */
  private parseUserAgent(userAgent?: string) {
    if (!userAgent) {
      return { dispositivo: 'unknown', navegador: 'unknown' };
    }

    const ua = userAgent.toLowerCase();

    // Detectar dispositivo
    let dispositivo = 'web';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      dispositivo = 'mobile';
    } else if (ua.includes('electron')) {
      dispositivo = 'desktop';
    }

    // Detectar navegador
    let navegador = 'unknown';
    if (ua.includes('chrome')) navegador = 'Chrome';
    else if (ua.includes('firefox')) navegador = 'Firefox';
    else if (ua.includes('safari')) navegador = 'Safari';
    else if (ua.includes('edge')) navegador = 'Edge';

    return { dispositivo, navegador };
  }
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario actual' })
  async changePassword(@Body() dto: ChangePasswordDto, @Request() req: any) {
    return this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
  }
  @Post('reset-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email);
  }
}
