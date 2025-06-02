import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { CloudinaryService } from '../../services/cloudinary.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly cloudinaryService: CloudinaryService,
  ){}

  async create(createPostDto: CreatePostDto, image: string, userId: string) {
    const user = await this.userRepository.findById(userId);

    if(!user) throw new NotFoundException('User not found!');
    const imageUrl = await this.cloudinaryService.imageUpload(image)

    const post = await this.postRepository.createPost(createPostDto, imageUrl, user);

    if(!post) {
      throw new InternalServerErrorException('Create post failed!');
    }

    return post;
  }

  async findAll() {
    const posts = await this.postRepository.findAllWithRelations();
    if (!posts) throw new NotFoundException("Post not found!")
    return posts;
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

    return posts;
  }
  
  async toggleLike(userId: string, postId: string) {
    const user = await this.userRepository.findByIdWithLikedPostsRelations(userId);
    const post = await this.postRepository.findById(postId);
  
    if (!user || !post) throw new NotFoundException('Post or user not found');
  
    const index = post.likedBy.findIndex(u => u.id === user.id);
  
    if (index > -1) {
      // Unlike
      post.likedBy.splice(index, 1);
      await this.postRepository.savePost(user.id, post);
      return { message: 'Post unliked' };
    } else {
      // Like
      post.likedBy.push(user);
      await this.postRepository.savePost(user.id, post);
      return { message: 'Post liked' };
    }
  }

  async delete(userId: string, postId: string) {
    const user = await this.userRepository.findById(userId);
    const post = await this.postRepository.findOneWithAllRelations(postId);
    if(!user || !post) {
      throw new NotFoundException('Post or user not found');
    }
    if(user.id !== post.user.id) {
      throw new ForbiddenException('You are not allow to delete this post')
    }
    this.postRepository.softRemovePost(user.id, post);
    return {message: 'Post deleted'};
  }

  async findByKeyword(keyword: string) {
    const posts = await this.postRepository.findByKeyword(keyword);
    if(!posts) {
      return [];
    }
    return posts;
  }

  async findByKeywordAndUser(keyword: string, userId: string) {
    const  posts = await this.postRepository.findByKeyword(keyword,userId);
    if(!posts) {
      return [];
    }
    return posts;
  }
  
  async update (userId: string, updatePostDto: UpdatePostDto, image: string) {
    const user = await this.userRepository.findById(userId);
    const post = await this.postRepository.findOneWithAllRelations(updatePostDto.id);
    if (!user || !post) {
      throw new NotFoundException('User or post not found!');
    } else if (user.id !== post.user.id) {
      throw new ForbiddenException('You are not allow to update this post')
    }
    const imageUrl = await this.cloudinaryService.imageUpload(image);
    Object.assign(post,{...updatePostDto, image: imageUrl});

    const savedPost = await this.postRepository.savePost(user.id, post);
    if(!savedPost) {
      throw new Error('Update post failed');
    }
    return savedPost;
  }
}
