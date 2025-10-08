import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Definimos la estructura completa del payload que esperamos del JWT
type JwtPayload = { 
    sub: string; 
    email: string;
    role: string; // <-- AÑADIDO: Ahora se espera que el token traiga el rol
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Se ajusta el tipo de payload para incluir 'role'
  async validate(payload: JwtPayload) {
    // Retorna el objeto que será inyectado en el Request y en los Services (UserJwt)
    return { 
      sub: payload.sub, 
      email: payload.email,
      role: payload.role // <-- DEVOLVEMOS EL ROL
    };
  }
}