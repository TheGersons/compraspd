import { MinLength } from "class-validator";

export class ChangePasswordDto {
    @MinLength(8) newPassword!: string;
    @MinLength(8) oldPassword!: string;
}
//el usuario envia la nueva contraseña y la antigua
//el usuario no envia el id ni el email
//el id se obtiene del token