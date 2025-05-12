import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { addBaseURL } from '../../utils/addBaseURL';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
 
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
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const existedUser = await this.userRepository.findByEmailAndPassword(loginUserDto.email, loginUserDto.password);

    if(!existedUser) {
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
