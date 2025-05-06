import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiProperty()
    @IsString()
    id: string
}
