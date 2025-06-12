import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UsePipes, UseGuards, UploadedFile } from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';
import { CreateStoryPipe } from '../../pipes/create-story.pipe';
import { RateLimitGuard } from '../../guards/ratelimit.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { JobQueue } from '../../config/bullMQ/job.queue';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ImageUploadDto } from './dto/image-upload.dto';
import { diskStorage } from 'multer';

@SkipThrottle()
@Controller('story')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly jobQueue: JobQueue
  ) {}

  @Post()
  @UseInterceptors(LoggingInterceptor, FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
    }),
  }))
  // @UsePipes(CreateStoryPipe)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateStoryDto })
  create(@Body() data: CreateStoryDto, @UploadedFile() file: Express.Multer.File) {
    const outputPath = `./upload/resized_${file.path}`
    this.jobQueue.addResizeJob({
      filePath: file.path,
      width: 500,
      height: 500,
      outputPath
    });
    return this.storyService.create(data);
  }

  @Get()
  // @UseGuards(RateLimitGuard)
  @UseInterceptors(LoggingInterceptor)
  findAll() {
    return this.storyService.findAll();
  }

  @Get(':id')
  @SkipThrottle({default: true})
  @UseInterceptors(LoggingInterceptor)
  findOne(@Param('id') id: string) {
    return this.storyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoryDto: UpdateStoryDto) {
    return this.storyService.update(id, updateStoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storyService.remove(id);
  }
}
