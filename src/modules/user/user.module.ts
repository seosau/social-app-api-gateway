import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Post } from '../post/entities/post.entity';
import { UserRepository } from './user.repository';
import { PostRepository } from '../post/post.repository';
import { PostSearchService } from '../post/post.searchService';
import { MetricsModule } from '../../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post]),
    AuthModule,
    MetricsModule
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, PostRepository, PostSearchService],
})
export class UserModule {}
