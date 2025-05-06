import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiCreatedResponse({ description: 'User created successfully!' })
  @ApiConflictResponse({ description: 'User already exists!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login successfully!'})
  @ApiBadRequestResponse({ description: 'Email or password is incorrect'})
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }
}
