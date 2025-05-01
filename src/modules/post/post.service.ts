import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async create(createPostDto: CreatePostDto, image: string, userId: string) {
    const user = await this.userRepository.findOne({where: {id: userId}});
    if(!user) throw new Error('User not found!');

    const newPost = this.postRepository.create({...createPostDto, image, user});
    const savedPost = await this.postRepository.save(newPost);

    if(savedPost) return savedPost;

    throw new Error('Create post failed!');
  }

  async findAll() {
    const posts = await this.postRepository.find({
      relations: ['user'],
      select: {
        user: {id: true, fullName: true, email: true}
      }
    });
    if (!posts) throw new Error("Post not found!")
    
    const HOST_URL = process.env.BASE_IMG_URL;

    const postsWithFullImageUrl = posts.map(post => ({
      ...post,
      image: post.image ? `${HOST_URL}/${post.image}` : null,
    }));
  
    return postsWithFullImageUrl;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
