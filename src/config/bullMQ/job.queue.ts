import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { COMMENT_COUNT, COMMENT_COUNT_TYPE_ARGUMENT, NOTIF_QUEUE_NAME, RESIZE_IMAGE, TOGGLE_LIKE, UPDATE_NOTIF_BY_USER, UPLOAD_IMAGE } from "./job.constants";
import { User } from "src/modules/user/entities/user.entity";
import { APP_CONFIG } from "../app.config";

const redisUrl = APP_CONFIG.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);

@Injectable()
export class JobQueue {
    public readonly resizeQueue: Queue
    public readonly uploadImageQueue: Queue
    public readonly toggleLikeQueue: Queue
    public readonly commentCountQueue: Queue
    public readonly updateNotifQueue: Queue

    constructor() {
        const connectionData = {
            host: APP_CONFIG.REDIS_HOST,
            port: Number(APP_CONFIG.REDIS_PORT),
            password: APP_CONFIG.REDIS_PASSWORD,
            username: APP_CONFIG.REDIS_USERNAME,
            // tls: {},
            maxRetriesPerRequest: null,
        }
        this.resizeQueue = new Queue(RESIZE_IMAGE, {
            connection: connectionData,
        })
        this.uploadImageQueue = new Queue(UPLOAD_IMAGE, {
            connection: connectionData,
        })
        this.toggleLikeQueue = new Queue(TOGGLE_LIKE, {
            connection: connectionData
        })
        this.commentCountQueue = new Queue(COMMENT_COUNT, {
            connection: connectionData
        })
        this.updateNotifQueue = new Queue(NOTIF_QUEUE_NAME, {
            connection: connectionData
        })
    }

    async addResizeJob(data: any) {
        const resq = await this.resizeQueue.add(RESIZE_IMAGE, data)
    }

    async addUploadImageJob(data: any) {
        await this.uploadImageQueue.add(UPLOAD_IMAGE, data)
    }

    async addToggleLikeJob(postId: string, userId: string) {
        await this.toggleLikeQueue.add(TOGGLE_LIKE, {postId, userId})
    }
    async addCommentCountJob(postId: string, type: COMMENT_COUNT_TYPE_ARGUMENT) {
        await this.commentCountQueue.add(COMMENT_COUNT, {postId, type})
    }

    async updateNotif(user: User) {
        await this.updateNotifQueue.add(UPDATE_NOTIF_BY_USER, user)
    }
}