import { Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateConversationRequest, GetConversationRequest, GetListConversationRequest, SendMessageRequest } from 'src/generated/chat';
import { ChatGrpcService } from '../../config/gRPC/chat.grpc.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatGrpcService: ChatGrpcService
  ) {}
  createConversation(data: CreateConversationRequest) {
    return this.chatGrpcService.createConversation(data)
  }
  findAllConversation(data: GetListConversationRequest) {
    return this.chatGrpcService.getAllConversation(data)
  }
  findOneConversation(data: GetConversationRequest) {
    return this.chatGrpcService.getOneConversation(data)
  }
  sendMessage(data: SendMessageRequest) {
    return this.chatGrpcService.sendMessage(data)
  }
}
