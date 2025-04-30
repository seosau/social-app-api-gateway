import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from './dto/login-user.dto';
 
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}
  async register(createUserDto: CreateUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: createUserDto.email},
    })
    if (existedUser) {
      throw new Error('User already exists');
    }
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: {email: loginUserDto.email, password: loginUserDto.password}
    });

    if(!existedUser) {
      throw new Error('Invalid credentials!')
    }
    return existedUser;
  }
}
