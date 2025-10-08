// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client'; // Importamos el tipo base User de Prisma

// Definimos un tipo que incluya el nombre del rol
type UserWithRoleName = User & { role: { name: string } | null };

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  /**
   * Valida las credenciales del usuario y carga el nombre de su rol.
   */
  async validateUser(email: string, pass: string): Promise<UserWithRoleName> {
    // 1. Cargamos el usuario e incluimos el nombre del rol relacionado
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: {
        role: {
          select: { name: true } // Asume que la tabla 'Role' tiene un campo 'name'
        }
      }
    }) as UserWithRoleName; // Hacemos un cast para usar el tipo extendido

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Retorna el objeto user que ahora contiene user.role.name
    return user; 
  }

  /**
   * Firma y genera el token, incluyendo el nombre del rol en el payload.
   */
  sign(user: UserWithRoleName) {
    // Obtenemos el nombre del rol o un string vacío si no existe la relación
    const roleName = user.role?.name || ''; 
    
    // 2. Incluimos el rol en el payload del JWT
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: roleName // <-- CLAVE: Rol de texto añadido al token
    };

    return {
      access_token: this.jwt.sign(payload),
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES || '1d',
    };
  }
}