import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { JobQueue } from '../../config/bullMQ/job.queue';
import { UPLOAD_IMAGE_TYPE } from '../../config/bullMQ/job.constants';
import Redis from 'ioredis';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly jobQueue: JobQueue,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ){}

  async create(createPostDto: CreatePostDto, image: string, userId: string) {
    const user = await this.userRepository.findById(userId);

    if(!user) throw new NotFoundException('User not found!');

    const post = await this.postRepository.createPost(createPostDto, image, user);

    if(!post) {
      throw new InternalServerErrorException('Create post failed!');
    }

    await this.redis.set(`post:exists:${post.id}`, '1')

    this.jobQueue.addUploadImageJob({
      id: post.id,
      jobType: UPLOAD_IMAGE_TYPE.POST,
      filePath: image
    })

    return post;
  }

  async findAll() {
    const posts = await this.postRepository.findAllWithRelations();
    if (!posts) throw new NotFoundException("Post not found!")

    //Luu toan bo postID vao Redis 
    // posts.forEach(async(post) => {
    //   await this.redis.set(`post:exists:${post.id}`, '1')
    // })

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

    await this.jobQueue.addToggleLikeJob(postId, userId)
  // Nen xoa doan duoi nay neu dung microservice
    // const index = post.likedBy.findIndex(u => u.id === user.id);
  
    // if (index > -1) {
    //   // Unlike
    //   post.likedBy.splice(index, 1);
    //   await this.postRepository.savePost(post);
    //   return { message: 'Post unliked' };
    // } else {
    //   // Like
    //   post.likedBy.push(user);
    //   await this.postRepository.savePost(post);
    //   return { message: 'Post liked' };
    // }
    // ==============================================
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
    const deleted = await this.postRepository.softRemovePost(user.id, post);
    if(!deleted) {
      throw new Error('Post delete error')
    }

    await this.redis.del(`post:exists:${deleted.id}`)

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
    Object.assign(post,{...updatePostDto, image: image});

    const savedPost = await this.postRepository.savePost(post);
    if(!savedPost) {
      throw new Error('Update post failed');
    }

    this.jobQueue.addUploadImageJob({
      id: savedPost.id,
      jobType: UPLOAD_IMAGE_TYPE.POST,
      filePath: image
    })

    return savedPost;
  }  

  async updateImageByBull (postId: string, image: string) {
    const post = await this.postRepository.findOneWithAllRelations(postId);
    if (!post) {
      throw new NotFoundException('Post not found!');
    }
    Object.assign(post,{image: image});

    const savedPost = await this.postRepository.savePost(post);
    if(!savedPost) {
      throw new Error('Update post image by Bull failed');
    }
    return savedPost;
  }

  async updateLikeCount (postId: string, count: number) {
    const post = await this.postRepository.findOneWithAllRelations(postId);
    if (!post) {
      throw new NotFoundException('Post not found!');
    }
    Object.assign(post,{likeCount: count});

    const savedPost = await this.postRepository.savePost(post);
    if(!savedPost) {
      throw new Error('Update post like count failed');
    }
    return savedPost;
  }

  async updatePostByPost (post: Post) {
    if (!post) {
      throw new NotFoundException('Post not found!');
    }

    const savedPost = await this.postRepository.savePost(post);
    if(!savedPost) {
      throw new Error('Update post like count failed');
    }
    return savedPost;
  }

  async findById(postId: string) {
    const post = await this.postRepository.findById(postId)
    if(!post) throw new NotFoundException('Post not found')
    
    return post
  }
}
