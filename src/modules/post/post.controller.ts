import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req, Query, Patch, UploadedFiles, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
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
    const userId = req['user'].sub;
    return await this.postService.create(createPostDto, imageFile, userId);
  }

  @Get('search/:keyword/:userId')
  async findByKeywordAndUser(
    @Param('keyword') keyword: string,
    @Param('userId') userId: string
  ) {
    return this.postService.findByKeywordAndUser(keyword, userId);
  }

  @Get('search/:keyword')
  async findByKeyword(@Param('keyword') keyword: string) {
    return this.postService.findByKeyword(keyword);
  }

  @Get('user/:id')
  async findAllByUser(@Param('id') userId: string) {
    return this.postService.findAllByUser(userId);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post(':id/toggleLike')
  async likePost(@Param('id') postId: string, @Req() req: Request) {
    const userId = req['user'].sub;
    return this.postService.toggleLike(userId, postId);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async delete(@Param('id') postId: string, @Req() req: Request) {
    const userId = req['user'].sub
    return this.postService.delete(userId, postId);
  }

  @UseGuards(AuthGuard)
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
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = req['user'].sub;
    const image = file.filename;
    return this.postService.update(userId, updatePostDto, image);
  }
}
