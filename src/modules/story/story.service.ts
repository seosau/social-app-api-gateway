import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { PrismaService } from '../../config/database/prisma/prisma.service';
// import { ClientProxy } from '@nestjs/microservices';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
// import { STORY_CACHE_KEYS } from './story.cache-manager';
import { Logger } from 'nestjs-pino';
import { StoryGrpcService } from '../../config/gRPC/story.grpc.service';
import { UserService } from '../user/user.service';
import { GetAllStoriesResponseEnrich, StoryEnrich } from '../../generated/story';
import { SUser } from '../../generated/shared_message';
// import { Prisma } from '@prisma/client';
// import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class StoryService {
  constructor(
    private readonly prisma: PrismaService,
    // @Inject('KAFKA_SERVICE')
    // private readonly kafka: ClientKafka
    // @Inject('RABBITMQ_SERVICE')
    // private readonly client: ClientProxy,
    // @Inject(CACHE_MANAGER)
    // private readonly cacheManager: Cache,
    private readonly logger: Logger,
    private readonly storyGrpcService: StoryGrpcService,
    private readonly userService: UserService,
  ) {}
  async create(data: {image: string, userId: string}) {
    if(!data.userId) throw new Error('UserId is required')
    // console.log('Creating story with data: ', data)
    try{

      // const res = await this.prisma.story.create({
      //   data: {
      //     image: data.image,
      //     userId: data.userId,
      //   }
      // })
      console.log('999999999999999999999999999999999', {image: data.image,userId:  data.userId})
      const res = await this.storyGrpcService.createStory({
        image: data.image,
        userId: data.userId
      })
      console.log('8888888888888888888888888888888888888888', res)
      // this.kafka.emit('story.create',{id: res.id, userId: res.userId});
      // this.client.emit('story.created', res)
      return res;      
    } catch(err) {
      this.logger.error('Failed to create', err)
      throw new Error('DB error')
    }
  }

  async findAll(firtId?: string) {
    // const cacheStory = await this.cacheManager.get(STORY_CACHE_KEYS.ALL_STORIES)
    // if(cacheStory) {
    //   return cacheStory
    // }
    // const res = await this.prisma.story.findMany()
    const res = await this.storyGrpcService.getAllStory({firtId})
    const listUserId = [...new Set(res.stories.map((story) => story.userId))];
    const userList = await this.userService.findByIds(listUserId)
    // this.client.emit('story.getted', res)
    const stories: StoryEnrich[] = res.stories.map((story) => {
      const user = userList.find((user) => user.id === story.userId);
      const userToEnrich: SUser = {
        id: user?.id ?? '',
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        password: user?.password ?? '',
        image: user?.image ?? '',
        createdAt: !!user?.createdAt ? user.createdAt.toISOString() : '',
        updatedAt: !!user?.updatedAt ? user.updatedAt.toISOString() : '',
        deletedAt: !!user?.deletedAt ? user.deletedAt.toISOString() : '',
      }
      return {
        id: story.id,
        image: story.image,
        userId: story.userId,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        deletedAt: story.deletedAt,
        user: userToEnrich
    }})
    const resEnrich: GetAllStoriesResponseEnrich = {
      stories
    }
    return resEnrich;
  }

  async findOne(id: string) {
    this.logger.log(`Getting story with condition id: ${id}`)
    // const cacheStory = await this.cacheManager.get(STORY_CACHE_KEYS.STORY_BY_ID(id))
    // if(cacheStory) {
    //   return cacheStory
    // }
    // const res = await this.prisma.story.findFirst({
    //   where: {
    //     id: id
    //   }
    // });
    const res = await this.storyGrpcService.getStory({id})
    if(!res.story?.id){
      throw new NotFoundException('Story not found')
    }
    // this.client.emit('story.getted', res)
    const user = await this.userService.findOne(res.story?.userId ?? '')
    const userToEnrich: SUser = {
        id: user?.id ?? '',
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        password: user?.password ?? '',
        image: user?.image ?? '',
        createdAt: !!user?.createdAt ? user.createdAt.toISOString() : '',
        updatedAt: !!user?.updatedAt ? user.updatedAt.toISOString() : '',
        deletedAt: !!user?.deletedAt ? user.deletedAt.toISOString() : '',
    }
    const resEnrich: StoryEnrich = {
        id: res.story.id ,
        image: res.story.image,
        userId: res.story.userId,
        createdAt: res.story.createdAt,
        updatedAt: res.story.updatedAt,
        deletedAt: res.story.deletedAt,
        user: userToEnrich
    }

    return resEnrich
  }

  async update(id: string, data: UpdateStoryDto) {
    // const res = await this.prisma.story.update({
    //   where: {
    //     id: id
    //   },
    //   data: {
    //     image: data.image,
    //   }
    // });
    // if(res) {
    //   // this.client.emit('story.updated', res)
    // }

    // return res
  }

  async remove(id: string, deletorId: string) {
    // const res = await this.prisma.story.delete({
    //   where: {
    //     id: id
    //   }
    // });
    const res = await this.storyGrpcService.deleteStory({
      id,
      deletorId,
    })
    if(res) {
      // this.client.emit('story.deleted', res)
    }
    return res
  }
}
