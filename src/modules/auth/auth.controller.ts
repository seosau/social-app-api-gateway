import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
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
    try{
      return await this.authService.register(createUserDto);
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new ConflictException({ description: 'User already exists!' });
      } else {
        throw new error;
      }
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login successfully!'})
  @ApiBadRequestResponse({ description: 'Email or password is incorrect'})
  async login(@Body() loginUserDto: LoginUserDto) {
    try{
      return await this.authService.login(loginUserDto);
    } catch (error) {
      if (error.message === 'Invalid credentials!') {
        throw new BadRequestException({ description: 'Invalid credentials!' });
      } else {
        throw new error;
      }
    }
  }
}
