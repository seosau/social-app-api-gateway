import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { RESIZE_IMAGE, UPLOAD_IMAGE } from "./job.constants";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);

@Injectable()
export class JobQueue {
    public readonly resizeQueue: Queue
    public readonly uploadImageQueue: Queue

    constructor() {
        const connectionData = {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            username: process.env.REDIS_USERNAME,
            tls: {},
            maxRetriesPerRequest: null,
        }
        this.resizeQueue = new Queue(RESIZE_IMAGE, {
            connection: connectionData,
        })
        this.uploadImageQueue = new Queue(UPLOAD_IMAGE, {
            connection: connectionData,
        })
    }

    async addResizeJob(data: any) {
        const resq = await this.resizeQueue.add(RESIZE_IMAGE, data)
    }

    async addUploadImageJob(data: any) {
        await this.uploadImageQueue.add(UPLOAD_IMAGE, data)
    }
}