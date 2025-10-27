// backend/src/followups/dto/create-followup.dto.ts
import { IsString, MinLength } from 'class-validator';
export class CreateFollowupDto {
  @IsString() @MinLength(1)
  body!: string; // mensaje
}
