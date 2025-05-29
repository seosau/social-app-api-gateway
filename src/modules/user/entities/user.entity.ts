import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Post } from '../../post/entities/post.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsString()
    fullName: string;

    @Column({unique: true})
    @IsEmail()
    email: string

    @Column()
    @MinLength(6)
    password: string;

    @Column({ nullable: true })
    @IsString()
    image: string ;

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
