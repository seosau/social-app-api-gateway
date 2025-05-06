import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { addBaseURL } from '../../utils';
import { UserRepository } from './user.repository';
import { addBaseURLInUser } from '../../utils/addBaseURLInUser';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository
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

    Object.assign(user,updateUserDto);

    const savedUser = await this.userRepository.save(user);

    return addBaseURLInUser(savedUser);
  }
}
