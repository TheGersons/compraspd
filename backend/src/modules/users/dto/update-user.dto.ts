import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsString() @IsOptional() fullName?: string;
    @IsString() @IsOptional() department?: string;
    @IsString() @IsOptional() costCenter?: string;
    @IsString() @IsOptional() roleId?: string; // cambiar rol
    @IsBoolean() @IsOptional() isActive?: boolean;
}


//id -> no se puede actualizar
//email -> no se puede actualizar
//createdAt -> no se puede actualizar
//updatedAt -> se actualiza automatico
//passwordHash -> se puede actualizar