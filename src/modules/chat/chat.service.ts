import { Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ConversationEnrich, CreateConversationRequest, GetConversationRequest, GetConversationResponseEnrich, GetListConversationRequest, GetListConversationResponseEnrich, SendMessageRequest } from 'src/generated/chat';
import { ChatGrpcService } from '../../config/gRPC/chat.grpc.service';
import { UserGrpcService } from '../../config/gRPC/user.grpc.service';
import { reflectUserToSUser } from './chat.function';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatGrpcService: ChatGrpcService,
    private readonly userGrpcService: UserGrpcService,
  ) {}
  createConversation(data: CreateConversationRequest) {
    return this.chatGrpcService.createConversation(data)
  }
  async findAllConversation(data: GetListConversationRequest) {
    const result = await this.chatGrpcService.getAllConversation(data)
    
    const conversationsEnriched: GetConversationResponseEnrich[] = await Promise.all(
      result.conversations.map(async (conver) => {
        const members = await this.userGrpcService.getManyUser({
          ids: conver.conversation?.memberIds ?? [],
        });

        return {
          conversation: {
            ...conver.conversation,
            members: members.users.map(user => reflectUserToSUser(user)),
            id: conver.conversation?.id ?? '',
            memberIds: conver.conversation?.memberIds ?? [],
            createdAt: conver.conversation?.createdAt ?? '',
            updatedAt: conver.conversation?.updatedAt ?? '',
            deletedAt: conver.conversation?.deletedAt ?? '',
            type: conver.conversation?.type ?? 0,
          },
          messageList: conver.messageList,
        };
      }),
    );
    const enriched: GetListConversationResponseEnrich = {
      conversations: conversationsEnriched
    }
    return enriched;
  }
  async findOneConversation(data: GetConversationRequest) {
    const result = await this.chatGrpcService.getOneConversation(data);

    const members = await this.userGrpcService.getManyUser({ids: result.conversation?.memberIds ?? []});
    const converEnrich: GetConversationResponseEnrich = {
      ...result,
      conversation: {
        ...result.conversation,
        members: members.users.map(user => reflectUserToSUser(user)),
        id: result.conversation?.id ?? '',
        memberIds: result.conversation?.memberIds ?? [],
        createdAt: result.conversation?.createdAt ?? '',
        updatedAt: result.conversation?.updatedAt ?? '',
        deletedAt: result.conversation?.deletedAt ?? '',
        type: result.conversation?.type ?? 0,
      }
    }
    return converEnrich;
  }
  sendMessage(data: SendMessageRequest) {
    return this.chatGrpcService.sendMessage(data)
  }
}
