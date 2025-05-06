import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { addBaseURL } from '../../utils/addBaseURL';
 
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
      throw new ConflictException('User already exists');
    }
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: {email: loginUserDto.email, password: loginUserDto.password},
    });

    if(!existedUser) {
      throw new BadRequestException('Invalid credentials!')
    }
    const existedUserWithImg = {...existedUser, image: addBaseURL(existedUser.image) }
    return existedUserWithImg;
  }
}
