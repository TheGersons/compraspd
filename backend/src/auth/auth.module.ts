import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1d' } }),
  ],
  providers: [],
  exports: [JwtModule],
})
export class AuthModule {}
