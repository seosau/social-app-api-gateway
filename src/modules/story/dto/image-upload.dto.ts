import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ImageUploadDto {
    @ApiProperty({type: 'string', format: 'binary'})
    @IsOptional()
    file: any
}