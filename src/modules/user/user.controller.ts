import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Get()
  findOne(@Req() req: Request) {
    const userId = req.headers['authorization'];
    const id = userId.split(' ')[1];
    return this.userService.findOne(id);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now()+ '-' + Math.round(Math.random()*1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async update(
    @Req() req: Request, 
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.headers['authorization']
    updateUserDto.image = file.filename
    return this.userService.update(userId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
