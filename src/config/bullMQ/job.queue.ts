import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);@Injectable()
export class JobQueue {
    public readonly queue: Queue

    constructor() {
        this.queue = new Queue('resize-image', {
            connection: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD,
                username: process.env.REDIS_USERNAME
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