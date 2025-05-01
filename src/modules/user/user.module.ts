import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Post } from '../post/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
