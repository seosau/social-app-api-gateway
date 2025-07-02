import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"

export class CreateStoryDto {
    // @ApiProperty({example: 'image-1747036169523-206348064.png'})
    // @IsString()
    // @IsNotEmpty()
    // image: string

    // @ApiProperty({example: '55b5831c-ccb9-4966-9236-63070b81883e'})
    // @IsUUID()
    // @IsNotEmpty()
    // userId: string

    @ApiProperty({type: 'string', format: 'binary'})
    // @IsOptional()
    file: any
}
