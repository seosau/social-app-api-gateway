import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { addBaseURL } from '../../utils';
import { UserRepository } from './user.repository';
import { addBaseURLInUser } from '../../utils/addBaseURLInUser';
import { PostRepository } from '../post/post.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { POST_CACHE_KEYS } from '../post/post.cache-manager';
import { addBaseURLInPosts } from '../../utils/addBaseURLInPosts';

@Injectable()
export class UserService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  
  async updateCache (userId: string) {
    const allPosts = await this.postRepository.findAllWithRelations();
    await this.cacheManager.set(POST_CACHE_KEYS.ALL_POSTS, addBaseURLInPosts(allPosts));

    const allPostsByUser = await this.postRepository.findAllByUser(userId);
    await this.cacheManager.set(POST_CACHE_KEYS.POSTS_BY_USER(userId), addBaseURLInPosts(allPostsByUser));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return addBaseURLInUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id)

    if(!user) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(user,updateUserDto);

    const savedUser = await this.userRepository.save(user);

    this.updateCache(id);
    return addBaseURLInUser(savedUser);
  }
}
