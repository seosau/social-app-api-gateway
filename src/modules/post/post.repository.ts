import { DataSource, ILike, In, Repository } from "typeorm";
import { Post } from "./entities/post.entity";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "../user/entities/user.entity";
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { POST_CACHE_KEYS, POST_UPDATE_CACHE_OPTIONS } from "./post.cache-manager";
import { addBaseURLInPost, addBaseURLInPosts } from "../../utils/addBaseURLInPosts";
import { PostSearchService } from "./post.searchService";

@Injectable()
export class PostRepository extends Repository<Post> {
    constructor(
        private dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
            private readonly searchService: PostSearchService
    ) {
        super(Post, dataSource.createEntityManager());
    }
      
    async updateCaches (updateOption: string, userId: string, postWithUrl: Post) {
        const cacheAllPosts = (await this.cacheManager.get(POST_CACHE_KEYS.ALL_POSTS)) as Post[] || [];
        if(cacheAllPosts.length > 0) {
            switch (updateOption){
            case POST_UPDATE_CACHE_OPTIONS.CREATE: {
                const newCacheAllPosts = [postWithUrl, ...cacheAllPosts];
                await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, newCacheAllPosts);
                break;
            }
            case POST_UPDATE_CACHE_OPTIONS.UPDATE: {
                const newCacheAllPosts = cacheAllPosts.map(p => p.id === postWithUrl.id? postWithUrl : p);
                await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, newCacheAllPosts);
                break;
            }
            case POST_UPDATE_CACHE_OPTIONS.DELETE: {
                const newCacheAllPosts = cacheAllPosts.filter(p => p.id !== postWithUrl.id);
                await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, newCacheAllPosts);
                break;
            }
            }
        } 
        const cachePostsUser = (await this.cacheManager.get(POST_CACHE_KEYS.POSTS_BY_USER(userId))) as Post[] || [];
        if(cachePostsUser.length > 0) {
            switch (updateOption){
            case POST_UPDATE_CACHE_OPTIONS.CREATE: {
                const newCachePostsUser = [postWithUrl, ...cachePostsUser];
                await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), newCachePostsUser);
                break;
            }
            case POST_UPDATE_CACHE_OPTIONS.UPDATE: {
                const newCachePostsUser = cachePostsUser.map(p => p.id === postWithUrl.id? postWithUrl : p)
                await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), newCachePostsUser);
                break;
            }
            case POST_UPDATE_CACHE_OPTIONS.DELETE: {
                const newCachePostsUser = cachePostsUser.filter(p => p.id !== postWithUrl.id)
                await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), newCachePostsUser);
                break;
            }
            }
        }
    }

    async createPost (createPostDto: CreatePostDto, image: string, user: User) {
        const post = this.create({...createPostDto, image, user});

        const postWithRelations = await this.findById(post.id);
        if(!postWithRelations){
          throw new NotFoundException('Post not found');
        }
        const postWithUrl = addBaseURLInPost(postWithRelations);
        await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.CREATE, user.id, postWithUrl);
        await this.searchService.indexDocument(postWithUrl);
        return await this.save(post);
    }

    async findAllWithRelations() {
        const cacheKey = POST_CACHE_KEYS.ALL_POSTS;
        const cachePosts = (await this.cacheManager.get(cacheKey)) as Post[] || [];
        if (cachePosts.length) {
          return cachePosts;
        }
        const posts = await this.find({
            relations: ['user', 'likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })
        const result = addBaseURLInPosts(posts)
        await this.cacheManager.set(cacheKey, result);
        return result;
    }

    async findAllByUser(userId: string) {
        const cacheKey = POST_CACHE_KEYS.POSTS_BY_USER(userId);
        const cachePosts = (await this.cacheManager.get(cacheKey)) as Post[] || [];
        if (cachePosts.length) {
          return cachePosts;
        }
        const posts = await this.find({
            where: {user: {id: userId}},
            relations: ['user','likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })

        const result = addBaseURLInPosts(posts);
    
        await this.cacheManager.set(cacheKey, result);
        return result;
    }

    async findById(id: string) {
        return this.findOne({
            where: {id: id},
            relations: ['user','likedBy'],
        })
    }

    async findByIds(ids: (string | undefined)[]) {
        return this.find({
            where: {
                id: In(ids)
            },
            relations: ['user','likedBy'],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async findOneWithAllRelations(id: string) {
        return this.findOne({
            relations: ['user', 'likedBy'],
            where: {id: id}
          })
    }

    async findByKeyword(keyword: string, userId: string =""){
        const eltPosts = await this.searchService.search('posts', keyword, userId);
        const ids = eltPosts.map(post => post.id);
        if(ids.length === 0) return [];
        const idsSet = new Set(ids);
        const posts = (await this.cacheManager.get(POST_CACHE_KEYS.ALL_POSTS)) as Post[] || [];
        const filteredPost = posts.filter(post=> idsSet.has(post.id));
        return filteredPost;
    }
    async softRemovePost(userId: string, post: Post) {
        const savedPost = await this.softRemove(post);
        const postWithUrl = addBaseURLInPost(savedPost);
        await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.DELETE, userId, postWithUrl);
        await this.searchService.deleteDocument(post.id);
        return postWithUrl;
    }
 
    async savePost(userId: string, post: Post) {
        const savedPost = await this.save(post);
        const postWithUrl = addBaseURLInPost(savedPost);
        await this.updateCaches(POST_UPDATE_CACHE_OPTIONS.UPDATE,userId, postWithUrl);
        await this.searchService.updateDocument(savedPost)
        return postWithUrl;
    }
}