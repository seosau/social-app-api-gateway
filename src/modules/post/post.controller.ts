import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
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
  async create(
    @Req() req: Request,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageFile = file.filename;
    const userId = req.headers['authorization']
    try{
      return await this.postService.create(createPostDto, imageFile, userId);
    }catch (error) {
      if (error.message === 'Invalid credentials!') {
        throw new BadRequestException({ description: 'Invalid credentials!' });
      } else {
        throw new error;
      }
    }
  }

  @Get('user/:id')
  async findAllByUser(@Param('id') userId: string) {
    return this.postService.findAllByUser(userId);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Post(':id/toggleLike')
  async likePost(@Param('id') postId: string, @Req() req: Request) {
    const userId = req.headers['authorization']
    return this.postService.toggleLike(userId, postId);
  }

  @Delete('/:id')
  async delete(@Param('id') postId: string, @Req() req: Request) {
    const userId = req.headers['authorization']
    return this.postService.delete(userId, postId);
  }
}
