// import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Controller, Inject } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
// import { Cache } from "cache-manager";
// import { STORY_CACHE_KEYS, STORY_UPDATE_CACHE_OPTIONS, updateCaches } from "./story.cache-manager";
import { isArray } from "class-validator";

@Controller()
export class StoryEventsController {
    constructor(
        // @Inject(CACHE_MANAGER)
        // private readonly cacheManager: Cache
    ){}
    @MessagePattern('story.getted')
    async handleStoryGetted(@Payload() data:any) {
        // if(isArray(data)) {
        //     await this.cacheManager.set(STORY_CACHE_KEYS.ALL_STORIES, data)
        // } else {
        //     await this.cacheManager.set(STORY_CACHE_KEYS.STORY_BY_ID(data.id), data)
        // }
    }

    @MessagePattern('story.created')
    async handleStoryCreated(@Payload() data: any) {
        // await updateCaches(STORY_UPDATE_CACHE_OPTIONS.CREATE, data.userId, data, this.cacheManager);
    }

    @MessagePattern('story.updated')
    async handleStoryUpdated(@Payload() data: any) {
        // await updateCaches(STORY_UPDATE_CACHE_OPTIONS.UPDATE, data.userId, data, this.cacheManager);
    }

    @MessagePattern('story.deleted')
    async handleStoryDeleted(@Payload() data: any) {
        // await updateCaches(STORY_UPDATE_CACHE_OPTIONS.DELETE, data.userId, data, this.cacheManager);
    }
}