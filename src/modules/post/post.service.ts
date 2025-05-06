import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';
import { addBaseURL } from '../../utils/addBaseURL';

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
    if(!user) throw new NotFoundException('User not found!');

    const newPost = this.postRepository.create({...createPostDto, image, user});
    const savedPost = await this.postRepository.save(newPost);

    if(savedPost) return savedPost;

    throw new Error('Create post failed!');
  }

  async findAll() {
    const posts = await this.postRepository.find({
      relations: ['user', 'likedBy'],
      // select: {
      //   user: {id: true, fullName: true, email: true, image: true}
      // }
    });
    if (!posts) throw new NotFoundException("Post not found!")

    const postsWithFullImageUrl = posts.map(post => ({
      ...post,
      image: addBaseURL(post.image),
      user: {...post.user ,image: addBaseURL(post.user.image)},
    }));
  
    return postsWithFullImageUrl;
  }

  async findAllByUser (userId: string) {
    const existedUser = await this.userRepository.findOne({
      where: {id: userId}
    });

    if (!existedUser) {
      throw new NotFoundException('User not found!')
    }

    const posts = await this.postRepository.find({
      where: {user: {id: existedUser.id}},
      relations: ['user','likedBy'],
    })

    if (!posts) {
      throw new NotFoundException('Post not found!')
    }

    const postsWithFullImageUrl = posts.map(post => ({
      ...post,
      image: addBaseURL(post.image),
      user: {...post.user ,image: addBaseURL(post.user.image)},
    }));
  
    return postsWithFullImageUrl;
  }
  
  async toggleLike(userId: string, postId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['likedPosts'],
    });
    const post = await this.postRepository.findOneBy({ id: postId });
  
    if (!user || !post) throw new NotFoundException('Post or user not found');
  
    const index = user.likedPosts.findIndex(p => p.id === post.id);
  
    if (index > -1) {
      // Unlike
      user.likedPosts.splice(index, 1);
      await this.userRepository.save(user);
      return { message: 'Post unliked' };
    } else {
      // Like
      user.likedPosts.push(post);
      await this.userRepository.save(user);
      return { message: 'Post liked' };
    }
  }

  async delete(userId: string, postId: string) {
    const user = await this.userRepository.findOne({
      where: {id: userId}
    })
    const post = await this.postRepository.findOne({
      relations: ['user'],
      where: {id: postId}
    })
    if(!user || !post) {
      throw new NotFoundException('Post or user not found');
    }
    if(user.id !== post.user.id) {
      throw new ForbiddenException('You are not allow to delete this post')
    }
    this.postRepository.softRemove(post);
    return {message: 'Post deleted'};
  }
  

}
