import { IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @MinLength(6)
    password: string;
}