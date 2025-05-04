import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @MinLength(6, { message: 'Password is at least 6 characters long'})
    password: string;

    @ApiProperty()
    @IsString()
    image: string;
}
