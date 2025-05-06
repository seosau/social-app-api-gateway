import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { addBaseURL } from '../../utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll() {
    return await this.userRepository.findAndCount();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: {id: id}
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return {...user, image: addBaseURL(user.image)};
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({id})

    if(!user) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(user,updateUserDto);

    const savedUser = await this.userRepository.save(user);

    return {...savedUser, image: addBaseURL(savedUser.image)};
  }
}
