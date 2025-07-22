import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { CHAT_SERVICE_NAME, ChatServiceClient, CreateConversationRequest, GetConversationRequest, GetListConversationRequest, SendMessageRequest } from "../../generated/chat";

@Injectable()
export class ChatGrpcService {
    private chatService: ChatServiceClient

    constructor(
        @Inject('CHAT_CLIENT_GRPC')
        private readonly chatClient: ClientGrpc,
    ) {
        this.chatService = this.chatClient.getService<ChatServiceClient>(CHAT_SERVICE_NAME)
    }

    async createConversation (data: CreateConversationRequest) {
        try {
            const res = this.chatService.createConversation(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Create Conversation error in Chat GRPC service: ', err)
            throw err
        }
    }

    async getAllConversation(data: GetListConversationRequest) {
        try {
            const res = this.chatService.getListConversation(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Get all Conversation error in Chat GRPC service: ', err)
            throw err
        }
    }

    async getOneConversation (data: GetConversationRequest) {
        try {
            const res = this.chatService.getConversation(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Get Conversation error in Chat GRPC service: ', err)
            throw err
        }
    }

    async sendMessage (data: SendMessageRequest) {
        try {
            const res = this.chatService.sendMessage(data)

            const result = await lastValueFrom(res);
            return result;
        } catch (err) {
            console.error('Send Message error in Chat GRPC service: ', err)
            throw err
        }
    }
}