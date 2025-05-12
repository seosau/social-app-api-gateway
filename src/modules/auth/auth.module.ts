import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { PostRepository } from '../post/post.repository';
import { PostSearchService } from '../post/post.searchService';
import { SearchService } from '../../services/elasticsearch.service';
import { MetricsModule } from '../../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MetricsModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, PostRepository, SearchService, PostSearchService],
})
export class AuthModule {}
