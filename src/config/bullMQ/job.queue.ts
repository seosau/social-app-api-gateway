import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);@Injectable()
export class JobQueue {
    public readonly queue: Queue

    constructor() {
        this.queue = new Queue('resize-image', {
            connection: {
                host: url.host,
                port: Number(url.port) || 6379,
                password: url.password,
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