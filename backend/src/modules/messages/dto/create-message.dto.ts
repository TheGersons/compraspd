import { IsOptional, IsString, MinLength } from 'class-validator';


export class CreateMessageDto {
    @IsString()
    threadId!: string;


    @IsOptional()
    @IsString()
    body?: string;


    @IsOptional()
    attachments?: { fileName: string; mimeType: string; size: number; url: string }[];
}