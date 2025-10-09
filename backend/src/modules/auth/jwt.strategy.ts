// src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

type RawJwt = { sub?: unknown; email?: unknown; role?: unknown; iat?: unknown; exp?: unknown };
type JwtUser = { sub: string; email: string; role: string };

function isString(x: unknown): x is string { return typeof x === 'string' && x.length > 0; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('JwtStrategy');

  constructor() {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,         // asegúrate que coincide con el usado al firmar
      ignoreExpiration: false,                     // respeta exp
      // issuer: 'compraspd',                       // opcional si firmas con iss
      // audience: 'compraspd-web',                 // opcional si firmas con aud
    };
    super(opts);
  }

  async validate(payload: RawJwt): Promise<JwtUser> {
    // 1) Chequeo estructural mínimo
    if (!payload || !isString(payload.sub) || !isString(payload.email)) {
      this.logger.warn('Payload inválido o incompleto');
      throw new UnauthorizedException('Token inválido');
    }

    // 2) Normaliza role
    const role = isString(payload.role) ? payload.role.toUpperCase() : '';

    // 3) (Opcional) Chequeos adicionales:
    // - bloquear usuarios desactivados consultando DB
    // - validar "token version" o "jti" contra una blacklist/whitelist
    // if (!(await this.usersService.isActive(payload.sub))) throw new UnauthorizedException();

    // 4) Devuelve el shape que verá req.user
    return { sub: payload.sub, email: payload.email, role };
  }
}
