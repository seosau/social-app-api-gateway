import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class CreateStoryPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const {image, userId} = value
        if(!image || image.trim()==='') {
            throw new BadRequestException('Image is required!')
        }
        if(!userId || userId.trim() ==='') {
            throw new BadRequestException('UserId is required!')
        }

        return {
            ...value,
            image: image.trim(),
            userId: userId.trim()
        }
    }
}