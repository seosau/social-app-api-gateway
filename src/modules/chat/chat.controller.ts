import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationRequest, SendMessageRequest } from '../../generated/chat';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Post()
  createConversation(
    @Body() data: CreateConversationRequest,
  ) {
    return this.chatService.createConversation(data);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAllConversation(
    @Req() req: Request
  ) {
    const userId = req['user'].sub
    return this.chatService.findAllConversation({userId});
  }

  @Get(':id')
  findOneConversation(
    @Param('id') conversationId: string
  ) {
    return this.chatService.findOneConversation({conversationId});
  }

  @UseGuards(AuthGuard)
  @Post('send')
  sendMessage(
    @Body() data: SendMessageRequest,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub
    return this.chatService.sendMessage({...data, senderId: userId});
  }
}
