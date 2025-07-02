import { Inject, Injectable } from "@nestjs/common";
import { CreateStoryRequest, DeleteStoryRequest, GetAllStoriesRequest, GetStoryRequest, STORY_SERVICE_NAME, StoryServiceClient } from "../../generated/story";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Injectable()
export class StoryGrpcService {
    private storyService: StoryServiceClient

    constructor(
        @Inject('STORY_CLIENT_GRPC')
        private readonly storyClient: ClientGrpc,
    ) {
        this.storyService = this.storyClient.getService<StoryServiceClient>(STORY_SERVICE_NAME)
    }

    async createStory (data: CreateStoryRequest) {
        try {
            const res = this.storyService.createStoryService(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Create story error in Story GRPC service: ', err)
            throw err
        }
    }

    async getAllStory (data: GetAllStoriesRequest) {
        try {
            const res = this.storyService.getAllStoryService(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Get all story error in Story GRPC service: ', err)
            throw err
        }
    }

    async getStory (data: GetStoryRequest) {
        try {
            const res = this.storyService.getStoryService(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Get story error in Story GRPC service: ', err)
            throw err
        }
    }

    async deleteStory (data: DeleteStoryRequest) {
        try {
            const res = this.storyService.deleteStoryService(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Delete story error in Story GRPC service: ', err)
            throw err
        }
    }
}