import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
// import { ElasticsearchService } from '@nestjs/elasticsearch';
// import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User]), // cần nếu dùng @InjectRepository
    // CacheModule.register(),
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository, UserRepository],
  // providers: [PostService, PostRepository, UserRepository, ElasticsearchService],
})
export class PostModule {}
