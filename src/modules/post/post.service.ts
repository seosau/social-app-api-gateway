import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
import { addBaseURLInPosts } from '../../utils/addBaseURLInPosts';
import { UpdatePostDto } from './dto/update-post.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { POST_CACHE_KEYS } from './post.cache-key';
import { Post } from './entities/post.entity';
// import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ){}
  // private readonly elasticsearchService: ElasticsearchService

  // async indexPost(post: Post) {
  //   return this.elasticsearchService.index({
  //     index: 'post',
  //     id: post.id,
  //     document: {
  //       access: post.access,
  //       content: post.content,
  //       userId: post.user.id,
  //       createdAt: post.createdAt
  //     }
  //   })
  // }

  // async searchPosts(keyword: string) {
  //   const {hits} = await this.elasticsearchService.search({
  //     index: 'posts',
  //     query: {
  //       multi_match: {
  //         query: keyword,
  //         fields: ['access', 'content', 'userId', 'createdAt']
  //       },
  //     },
  //   });

  //   return hits.hits.map(hit => ({
  //     id: hit._id,
  //     // ...hit._source,
  //   }));
  // }

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
    const cacheKey = POST_CACHE_KEYS.ALL_POSTS;
    const cachePosts = await this.cacheManager.get(cacheKey);
    if (cachePosts) {
      return cachePosts;
    }
    const posts = await this.postRepository.findAllWithRelations();
    if (!posts) throw new NotFoundException("Post not found!")
    
    const result = addBaseURLInPosts(posts)
    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  async findAllByUser (userId: string) {
    const existedUser = await this.userRepository.findById(userId);

    if (!existedUser) {
      throw new NotFoundException('User not found!')
    }

    const cacheKey = POST_CACHE_KEYS.POSTS_BY_USER(userId);
    const cachePosts = await this.cacheManager.get(cacheKey);
    if(cachePosts) {
      return cachePosts;
    }

    const posts = await this.postRepository.findAllByUser(existedUser.id);

    if (!posts) {
      throw new NotFoundException('Post not found!')
    }

    const result = addBaseURLInPosts(posts);

    await this.cacheManager.set(cacheKey, result);

    return result;
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

  async findByKeyword(keyword: string) {
    const posts = await this.postRepository.findByKeyword(keyword);
    if(!posts) {
      throw new NotFoundException('Post not found!');
    }
    return addBaseURLInPosts(posts);
  }

  async findByKeywordAndUser(keyword: string, userId: string) {
    const posts = await this.postRepository.findByKeywordAndUser(keyword, userId);
    if(!posts) {
      throw new NotFoundException('Post not found!');
    }
    return addBaseURLInPosts(posts);
  }
  
  async update (userId: string, updatePostDto: UpdatePostDto, image: string) {
    const user = await this.userRepository.findById(userId);
    const post = await this.postRepository.findOneWithUserRelations(updatePostDto.id);
    if (!user || !post) {
      throw new NotFoundException('User or post not found!');
    } else if (user.id !== post.user.id) {
      throw new ForbiddenException('You are not allow to update this post')
    }
    Object.assign(post,{...updatePostDto, image: image});

    return this.postRepository.save(post);
  }
}
