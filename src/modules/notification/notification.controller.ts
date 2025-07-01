import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MarkAsReadNotificationRequest, MarkAsReadNotificationsRequest } from '../../generated/notification';
import { MarkAsReadNotificationsDto } from './dto/markAsReadNotifications.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Delete(':id')
  async deleteNotification (
    @Param('id') id: string
  ) {
    return this.notificationService.deleteNotification(id);
  }

  @Patch(':id/read')
  async markAsRead (
    @Param('id') id: string
  ) {
    return this.notificationService.markAsRead({id} as MarkAsReadNotificationRequest)
  }

  @Patch('/read-multi')
  async markAsReadMulti (
    @Body() ids: MarkAsReadNotificationsDto
  ) {
    return this.notificationService.markAsReadMulti(ids)
  }
}
