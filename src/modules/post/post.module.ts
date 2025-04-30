import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]), // cần nếu dùng @InjectRepository
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
