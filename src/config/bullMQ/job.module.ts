import { Module } from "@nestjs/common";
import { JobQueue } from "./job.queue";
import { JobProcessor } from "./job.processor";

@Module({
    providers: [JobQueue, JobProcessor],
    exports: [JobQueue]
})

export class JobModule {}