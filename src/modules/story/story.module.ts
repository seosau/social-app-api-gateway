import { forwardRef, Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { PrismaModule } from '../../config/database/prisma/prisma.module';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';
import { CreateStoryPipe } from '../../pipes/create-story.pipe';
import { StoryEventsController } from './story-events.controller';
// import { RabbitMQModule } from '../../config/rabbitMQ/rabbitMQ.module';
import { JobModule } from '../../config/bullMQ/job.module';
import { CloudinaryService } from '../../services/cloudinary.service';

@Module({
  // imports: [PrismaModule, RabbitMQModule, JobModule],
  imports: [PrismaModule, forwardRef(() => JobModule),],
  controllers: [StoryController, StoryEventsController],
  providers: [
    StoryService,
    // LoggingInterceptor,
    // CreateStoryPipe,
    CloudinaryService,
  ],
  exports: [StoryModule, StoryService]
})
export class StoryModule {}
