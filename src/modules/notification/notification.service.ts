import { Injectable } from '@nestjs/common';
import { GrpcService } from '../../config/gRPC/grpc.service';
import { DeleteNotificationsRequest, MarkAsReadNotificationRequest, MarkAsReadNotificationsRequest } from '../../generated/notification';

@Injectable()
export class NotificationService {
    constructor(
        private readonly grpcService: GrpcService,
    ) {}
    
    async deleteNotification(id: string) {
        return this.grpcService.deleteNotification({id} as DeleteNotificationsRequest)
    }

    async markAsRead(data: MarkAsReadNotificationRequest) {
        return this,this.grpcService.markAsReadNotification(data)
    }

    async markAsReadMulti(data: MarkAsReadNotificationsRequest) {
        return this.grpcService.markAsReadNotifications(data);
    }
}
