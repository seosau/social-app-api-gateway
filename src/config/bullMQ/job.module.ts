import { forwardRef, Module } from "@nestjs/common";
import { JobQueue } from "./job.queue";
import { JobProcessor } from "./job.processor";
import { CloudinaryService } from "../../services/cloudinary.service";
import { PostModule } from "../../modules/post/post.module";
import { StoryModule } from "../../modules/story/story.module";
import { UserModule } from "../../modules/user/user.module";
import { GrpcModule } from "../gRPC/grpc.module";

@Module({
    imports: [
        forwardRef(() => PostModule),
        forwardRef(() => StoryModule),
        forwardRef(() => UserModule),
        GrpcModule,
    ],
    providers: [JobQueue, JobProcessor, CloudinaryService],
    exports: [JobQueue]
})

export class JobModule {}