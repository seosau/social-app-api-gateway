import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';
import { PostRepository } from './post.repository';
import { UserRepository } from '../user/user.repository';
import { MetricsModule } from '../../metrics/metrics.module';
import { PostSearchService } from './post.searchService';
import { CloudinaryService } from '../../services/cloudinary.service';
import { JobModule } from '../../config/bullMQ/job.module';
import { RedisModule } from '../../config/redis/redis.module';
// import { CommentGrpcClientProvider } from '../../config/gRPC/comment.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User]), // cần nếu dùng @InjectRepository
    MetricsModule,
    forwardRef(() => JobModule),
    RedisModule,
  ],
  controllers: [PostController],
  providers: [
    PostService, 
    PostRepository, 
    UserRepository, 
    PostSearchService, 
    CloudinaryService, 
    // CommentGrpcClientProvider
  ],
  exports: [PostModule, PostRepository, PostService]
})
export class PostModule {}
