import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { COMMENT_SERVICE_NAME, CommentServiceClient } from "../../generated/comment";
import { CreateCommentDto } from "../../modules/post/dto/create-comment.dto";
import { GetCommentDto } from "src/modules/post/dto/get-comment.dto";
import { CreateNotificationRequest, DeleteNotificationsRequest, GetNotificationsRequest, MarkAsReadNotificationRequest, MarkAsReadNotificationsRequest, NOTIFICATION_SERVICE_NAME, NotificationServiceClient } from "../../generated/notification";

@Injectable()
export class GrpcService {
    private commentService: CommentServiceClient
    private notifService: NotificationServiceClient
    constructor(
        @Inject('COMMENT_CLIENT_GRPC')
        private readonly client: ClientGrpc,  
        @Inject('NOTIFICATION_CLIENT_GRPC')
        private readonly notifClient: ClientGrpc,
    ){
        this.commentService = this.client.getService<CommentServiceClient>(COMMENT_SERVICE_NAME)
        this.notifService = this.notifClient.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME)
    }

    async createComment (data: CreateCommentDto) {
        const res = this.commentService.createComment(data)
        const result = await lastValueFrom(res)

        if(!result) {
            throw new Error('Create comment error')
        }

        return result
    }

    async getComment (data: GetCommentDto) {
        const res = this.commentService.getComments(data)
        const result = await lastValueFrom(res)

        if(!result.comments) {
            throw new Error('Get comment error')
        }

        return result
    }

    async createNotification (data: CreateNotificationRequest) {
        try{
            const res = this.notifService.createNotification(data)
            const result = await lastValueFrom(res)

            return result
        } catch (err) {
            console.error('Backend Create Notification Error: ', err)
            throw err
        }
    }

    async getNotifications (data: GetNotificationsRequest) {
        try{
            const res = this.notifService.getNotifications(data)
            const result = await lastValueFrom(res)

            return result.notifications
        } catch (err) {
            console.error('Backend Get Notification Error: ', err)
            throw err
        }
    }

    async deleteNotification (data: DeleteNotificationsRequest) {
        try{
            const res = this.notifService.deleteNotification(data)
            const result = await lastValueFrom(res)
            return result.notifications

            // return result.notifications
        } catch (err) {
            console.error('Backend Delete Notification Error: ', err)
            throw err
        }
    }

    async markAsReadNotification (data: MarkAsReadNotificationRequest) {
        try{
            const res = this.notifService.markAsReadNotification(data)
            const result = await lastValueFrom(res)
            return result

            // return result.notifications
        } catch (err) {
            console.error('Backend Mark As Read Notification Error: ', err)
            throw err
        }
    }

    async markAsReadNotifications (data: MarkAsReadNotificationsRequest) {
        try{
            const res = this.notifService.markAsReadNotifications(data)
            const result = await lastValueFrom(res)
            return result

            // return result.notifications
        } catch (err) {
            console.error('Backend Mark As Read Notifications Error: ', err)
            throw err
        }
    }
}