import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../../post/entities/post.entity';

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
    @Column({ select: false })
    @MinLength(6)
    password: string;

    @ApiProperty()
    @Column({ nullable: true })
    @IsString()
    image: string;

    @ApiProperty()
    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @ManyToMany(() => Post, (post) => post.likedBy)
    likedPosts: Post[];
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
