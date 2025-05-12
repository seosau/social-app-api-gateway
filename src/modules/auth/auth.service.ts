import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { addBaseURL } from '../../utils/addBaseURL';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
 
@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ){}
  async register(createUserDto: CreateUserDto) {
    const existedUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existedUser) {
      throw new ConflictException('User already exists');
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltOrRounds);
    const user = this.userRepository.create({...createUserDto, password: hashedPassword});
    return await this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const existedUser = await this.userRepository.findByEmail(loginUserDto.email);

    if(!existedUser) {
      throw new UnauthorizedException('Invalid credentials!')
    }
    console.log('=========================', loginUserDto);
    console.log('=========================11111111111', existedUser);

    const isMatch = await bcrypt.compare(loginUserDto.password, existedUser.password);
    if(!isMatch) {
      throw new UnauthorizedException('Invalid credentials!')
    }

    const existedUserWithImg = {...existedUser, image: addBaseURL(existedUser.image) }
    const payload = { sub: existedUserWithImg.id, email: existedUserWithImg.email};
    // return existedUserWithImg;
    return {
      user: existedUserWithImg,
      access_token: await this.jwtService.signAsync(payload)
    }
  }
}
