import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class JobQueue {
    public readonly queue: Queue

    constructor() {
        this.queue = new Queue('resize-image', {
            connection: {
                host: 'redis',
                port: 6379,
            },
        })
    }

    // async addJob(data: any) {
    //     await this.queue.add('process', data)
    // }

    async addResizeJob(data: any) {
        await this.queue.add('resize-image', data)
    }
}