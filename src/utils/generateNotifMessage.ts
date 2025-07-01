import { NotificationType } from "../generated/notification_enum"


export const generateNotifMessage = (notifType: NotificationType, creatorName: string): string => {
    switch (notifType) {
        case NotificationType.COMMENT:
            return `${creatorName} has commented on your post`
        case NotificationType.LIKE:
            return `${creatorName} has liked your post`
        default:
            return ''
    }
}