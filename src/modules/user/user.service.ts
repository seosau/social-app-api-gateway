import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { addBaseURLInUser } from '../../utils/addBaseURLInUser';
import { JobQueue } from '../../config/bullMQ/job.queue';
import { UPLOAD_IMAGE_TYPE } from '../../config/bullMQ/job.constants';
import * as bcrypt from 'bcrypt';
import { GrpcService } from '../../config/gRPC/grpc.service';
import { GetNotificationsRequest } from '../../generated/notification';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jobQueue: JobQueue,
    private readonly grpcService: GrpcService,
  ) {}

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

    const saltOrRounds = 10;
    let hashedPassword = updateUserDto.password

    if(hashedPassword) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, saltOrRounds);
    }
    Object.assign(user,{...updateUserDto, password: hashedPassword});

    const savedUser = await this.userRepository.saveUser(user);

    if(!savedUser) {
      throw new Error('Update user failed')
    }

    this.jobQueue.addUploadImageJob({
      id: id,
      jobType: UPLOAD_IMAGE_TYPE.USER,
      filePath: updateUserDto.image
    })

    this.jobQueue.updateNotif(savedUser);

    return savedUser;
  }

  async updateImageByBull (userId: string, image: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    Object.assign(user,{image: image});

    const savedUser = await this.userRepository.saveUser(user);
    if(!savedUser) {
      throw new Error('Update user image by Bull failed');
    }
    this.jobQueue.updateNotif(savedUser);
    return savedUser;
  }

  async getNotifications(userId: string) {
    return this.grpcService.getNotifications({userId} as GetNotificationsRequest)
  }
}
