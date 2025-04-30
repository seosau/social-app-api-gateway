import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    @IsString()
    fullName: string;

    @ApiProperty()
    @Column({unique: true})
    @IsEmail()
    email: string

    @ApiProperty()
    @Column()
    @MinLength(6)
    password: string;
}
