import { Inject, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { PrismaService } from '../../config/database/prisma/prisma.service';
// import { ClientProxy } from '@nestjs/microservices';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
// import { STORY_CACHE_KEYS } from './story.cache-manager';
import { Logger } from 'nestjs-pino';
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
    private readonly logger: Logger
  ) {}
  async create(data: CreateStoryDto) {
    if(!data.userId) throw new Error('UserId is required')
    this.logger.log('Creating story with data: ', data)
    try{

      const res = await this.prisma.story.create({
        data: {
          image: data.image,
          userId: data.userId,
        }
      })
      // this.kafka.emit('story.create',{id: res.id, userId: res.userId});
      // this.client.emit('story.created', res)
      return res;      
    } catch(err) {
      this.logger.error('Failed to create', err)
      throw new Error('DB error')
    }
  }

  async findAll() {
    // const cacheStory = await this.cacheManager.get(STORY_CACHE_KEYS.ALL_STORIES)
    // if(cacheStory) {
    //   return cacheStory
    // }
    const res = await this.prisma.story.findMany()
    // this.client.emit('story.getted', res)
    return res;
  }

  async findOne(id: string) {
    this.logger.log(`Getting story with condition id: ${id}`)
    // const cacheStory = await this.cacheManager.get(STORY_CACHE_KEYS.STORY_BY_ID(id))
    // if(cacheStory) {
    //   return cacheStory
    // }
    const res = await this.prisma.story.findFirst({
      where: {
        id: id
      }
    });
    // this.client.emit('story.getted', res)

    return res
  }

  async update(id: string, data: UpdateStoryDto) {
    const res = await this.prisma.story.update({
      where: {
        id: id
      },
      data: {
        image: data.image,
      }
    });
    if(res) {
      // this.client.emit('story.updated', res)
    }

    return res
  }

  async remove(id: string) {
    const res = await this.prisma.story.delete({
      where: {
        id: id
      }
    });
    if(res) {
      // this.client.emit('story.deleted', res)
    }
    return res
  }
}
