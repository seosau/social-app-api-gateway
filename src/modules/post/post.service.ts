import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
import { addBaseURLInPosts } from '../../utils/addBaseURLInPosts';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository
  ){}
  async create(createPostDto: CreatePostDto, image: string, userId: string) {
    const user = await this.userRepository.findById(userId);

    if(!user) throw new NotFoundException('User not found!');

    const post = this.postRepository.createPost(createPostDto, image, user);

    if(!post) {
      throw new InternalServerErrorException('Create post failed!');
    }

    return post;
  }

  async findAll() {
    const posts = await this.postRepository.findAllWithRelations();
    if (!posts) throw new NotFoundException("Post not found!")
  
    return addBaseURLInPosts(posts);
  }

  async findAllByUser (userId: string) {
    const existedUser = await this.userRepository.findById(userId);

    if (!existedUser) {
      throw new NotFoundException('User not found!')
    }

    const posts = await this.postRepository.findAllByUser(existedUser.id);

    if (!posts) {
      throw new NotFoundException('Post not found!')
    }

    return addBaseURLInPosts(posts);
  }
  
  async toggleLike(userId: string, postId: string) {
    const user = await this.userRepository.findByIdWithLikedPostsRelations(userId);
    const post = await this.postRepository.findById(postId);
  
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
    const user = await this.userRepository.findById(userId);
    const post = await this.postRepository.findOneWithUserRelations(postId);
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
