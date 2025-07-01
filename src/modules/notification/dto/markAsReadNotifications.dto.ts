import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { MarkAsReadNotificationsRequest } from "src/generated/notification";

export class MarkAsReadNotificationsDto implements MarkAsReadNotificationsRequest {
    @ApiProperty()
    @IsUUID('all', {each: true})
    ids: string[];
}