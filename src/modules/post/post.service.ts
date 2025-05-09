import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
import { addBaseURLInPost, addBaseURLInPosts } from '../../utils/addBaseURLInPosts';
import { UpdatePostDto } from './dto/update-post.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { POST_CACHE_KEYS, POST_UPDATE_CACHE_OPTIONS } from './post.cache-manager';
import { Post } from './entities/post.entity';
import { SearchService } from '../../services/elasticsearch.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly searchService: SearchService
  ){}

  // async indexPost(post: Post) {
  //   return this.searchService.indexDocument('posts',{
  //     document: {
  //       access: post.access,
  //       content: post.content,
  //       userId: post.user.id,
  //       createdAt: post.createdAt
  //     }
  //   })
  // }

  async indexPost(post: Post) {
    return this.searchService.indexDocument(post)
  }

  async searchPosts(keyword: string) {
    const {hits} = await this.searchService.search('posts',{
      multi_match: {
        query: keyword,
        fields: ['access', 'content', 'userId', 'createdAt']
      },
    });

    return hits.hits.map(hit => ({
      id: hit._id,
      // ...hit._source,
    }));
  }

  async updateCaches (updateOption: string, userId: string, postWithUrl: Post) {
    const cacheAllPosts = (await this.cacheManager.get(POST_CACHE_KEYS.ALL_POSTS)) as Post[] || [];
    const cachePostsUser = (await this.cacheManager.get(POST_CACHE_KEYS.POSTS_BY_USER(userId))) as Post[] || [];

    switch (updateOption){
      case POST_UPDATE_CACHE_OPTIONS.CREATE: {
        const newCacheAllPosts = [postWithUrl, ...cacheAllPosts];
        await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, newCacheAllPosts);
    
        const newCachePostsUser = [postWithUrl, ...cachePostsUser];
        await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), newCachePostsUser);
        break;
      }
      case POST_UPDATE_CACHE_OPTIONS.UPDATE: {
        const newCacheAllPosts = cacheAllPosts.map(p => p.id === postWithUrl.id? postWithUrl : p);
        await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, newCacheAllPosts);
    
        const newCachePostsUser = cachePostsUser.map(p => p.id === postWithUrl.id? postWithUrl : p)
        await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), newCachePostsUser);
        break;
      }
      case POST_UPDATE_CACHE_OPTIONS.DELETE: {
        const newCacheAllPosts = cacheAllPosts.filter(p => p.id !== postWithUrl.id);
        await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, newCacheAllPosts);
    
        const newCachePostsUser = cachePostsUser.filter(p => p.id !== postWithUrl.id)
        await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), newCachePostsUser);
        break;
      }
    }
  }

  async create(createPostDto: CreatePostDto, image: string, userId: string) {
    const user = await this.userRepository.findById(userId);

    if(!user) throw new NotFoundException('User not found!');

    const post = await this.postRepository.createPost(createPostDto, image, user);

    if(!post) {
      throw new InternalServerErrorException('Create post failed!');
    }

    // await this.indexPost(post);

    const postWithRelations = await this.postRepository.findById(post.id);
    if(!postWithRelations){
      throw new NotFoundException('Post not found');
    }
    const postWithUrl = addBaseURLInPost(postWithRelations);
    await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.CREATE, userId, postWithUrl);

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
  
    const index = post.likedBy.findIndex(u => u.id === user.id);
  
    if (index > -1) {
      // Unlike
      post.likedBy.splice(index, 1);
      await this.postRepository.save(post);
      await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.UPDATE,userId, addBaseURLInPost(post));
      return { message: 'Post unliked' };
    } else {
      // Like
      post.likedBy.push(user);
      await this.postRepository.save(post);
      await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.UPDATE,userId, addBaseURLInPost(post));
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
    this.postRepository.softRemove(post);

    await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.DELETE, userId, addBaseURLInPost(post));
    return {message: 'Post deleted'};
  }

  async findByKeyword(keyword: string) {
    // const eltPosts = await this.searchPosts(keyword);
    // const ids = eltPosts.map(post => post.id);
    // if(ids.length === 0) return [];

    // const posts = await this.postRepository.findByIds(ids);
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
    const post = await this.postRepository.findOneWithAllRelations(updatePostDto.id);
    if (!user || !post) {
      throw new NotFoundException('User or post not found!');
    } else if (user.id !== post.user.id) {
      throw new ForbiddenException('You are not allow to update this post')
    }
    Object.assign(post,{...updatePostDto, image: image});

    // await this.updateCache(userId);

    const savedPost = await this.postRepository.save(post);
    if(!savedPost) {
      throw new Error('Update post failed');
    }
    const postWithUrl = addBaseURLInPost(post);

    this.updateCaches(POST_UPDATE_CACHE_OPTIONS.UPDATE, userId, postWithUrl);

    return postWithUrl;
    
    // return this.postRepository.save(post);
  }
}
