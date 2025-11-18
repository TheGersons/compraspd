import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Req, 
  UseGuards, 
  Logger,
  HttpCode,
  HttpStatus
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

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  /**
   * Login - Autenticación de usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      properties: {
        access_token: { type: 'string' },
        token_type: { type: 'string', example: 'Bearer' },
        expires_in: { type: 'string', example: '1d' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            nombre: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas o usuario inactivo' 
  })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Intento de login: ${dto.email}`);
    
    const usuario = await this.authService.validateUser(dto.email, dto.password);
    const token = this.authService.sign(usuario);
    
    this.logger.log(`Login exitoso: ${usuario.email} - Rol: ${usuario.rol?.nombre}`);
    
    return token;
  }

  /**
   * Me - Obtener información del usuario autenticado
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del usuario obtenida exitosamente',
    schema: {
      properties: {
        id: { type: 'string' },
        nombre: { type: 'string' },
        email: { type: 'string' },
        departamentoId: { type: 'string' },
        activo: { type: 'boolean' },
        creado: { type: 'string', format: 'date-time' },
        rol: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' }
          }
        },
        departamento: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o expirado' 
  })
  async me(@Req() req: any) {
    const userId = req.user?.sub;
    
    this.logger.debug(`Usuario solicitando /me: ${userId}`);
    
    return this.authService.me(userId);
  }

  /**
   * (Opcional) Logout - Revocar token
   * Requiere implementar blacklist de tokens
   */
  // @Post('logout')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Cerrar sesión (revocar token)' })
  // @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  // async logout(@Req() req: any) {
  //   const jti = req.user?.jti;
  //   // Implementar blacklist de tokens aquí
  //   // await this.authService.blacklistToken(jti);
  //   return { ok: true, message: 'Sesión cerrada' };
  // }

  /**
   * (Opcional) Refresh Token - Renovar token de acceso
   */
  // @Post('refresh')
  // @ApiOperation({ summary: 'Renovar token de acceso' })
  // @ApiResponse({ status: 200, description: 'Token renovado' })
  // async refresh(@Body() dto: RefreshTokenDto) {
  //   return this.authService.refreshToken(dto.refresh_token);
  // }
}