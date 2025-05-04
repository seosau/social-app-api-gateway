import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.userRepository.findAndCount();
  }

  findOne(id: string) {
    return this.userRepository.findOne({
      where: {id: id}
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({id})

    if(!user) {
      throw new Error('User not found!');
    }

    Object.assign(user,updateUserDto);

    return this.userRepository.save(user) 
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
