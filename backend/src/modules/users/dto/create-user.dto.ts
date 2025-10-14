import { IsEmail, IsNotEmpty, IsOptional, IsString, isUppercase, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail() email!: string;
    @MinLength(8) password!: string;
    @IsString() @IsNotEmpty() fullName!: string;

    @IsString()  departmentId!: string;
    @IsString() @IsOptional() costCenter?: string;

    @IsString() roleId!: string; // un rol 
    // por usuario
}


//id -> autogenerado
//email -> el usuario lo ingresa
//createdAt -> autogenerado
//updatedAt -> autogenerado
//costCenter -> opcional
//department -> opcional
//fullName -> el usuario lo ingresa
//isActive -> autogenerado
//passwordHash -> autogenerado
//roleId -> el usuario lo ingresa
