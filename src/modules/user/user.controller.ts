import { Controller, Get, Body, Patch, Param, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Get(':id')
  async findOne(@Param('id') userId: string) {
    return this.userService.findOne(userId);
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
}
