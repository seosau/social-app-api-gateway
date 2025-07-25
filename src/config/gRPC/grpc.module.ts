import { Global, Module } from '@nestjs/common'
import { GrpcService } from './grpc.service'
import { ClientsModule, ClientsProviderAsyncOptions, GrpcOptions, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { join } from 'path'
import { StoryGrpcService } from './story.grpc.service'
import { ChatGrpcService } from './chat.grpc.service'

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'COMMENT_CLIENT_GRPC',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<GrpcOptions> => {
        return {
            transport: Transport.GRPC,
            options: {
            loader: {
                longs: String,
                enums: String,
                json: true,
                defaults: true,
            },
            package: configService.get<string>('GRPC_PACKAGE_NAME') || '',
            protoPath: [join(__dirname, '../../../proto/comment.proto')],
            url: configService.get<string>('GRPC_URL') || '',
            },
        };
        },
        inject: [ConfigService],
      } as ClientsProviderAsyncOptions,
      {
        name: 'NOTIFICATION_CLIENT_GRPC',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<GrpcOptions> => {
        return {
            transport: Transport.GRPC,
            options: {
            loader: {
                longs: String,
                enums: String,
                json: true,
                defaults: true,
            },
            package: configService.get<string>('NOTIFICATION_GRPC_PACKAGE_NAME') || '',
            protoPath: [join(__dirname, '../../../proto/notification.proto')],
            url: configService.get<string>('NOTIFICATION_GRPC_URL') || '',
            },
        };
        },
        inject: [ConfigService],
      },
      {
        name: 'STORY_CLIENT_GRPC',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<GrpcOptions> => {
        return {
            transport: Transport.GRPC,
            options: {
            loader: {
                longs: String,
                enums: String,
                json: true,
                defaults: true,
            },
            package: configService.get<string>('STORY_GRPC_PACKAGE_NAME') || '',
            protoPath: [join(__dirname, '../../../proto/story.proto')],
            url: configService.get<string>('STORY_GRPC_URL') || '',
            },
        };
        },
        inject: [ConfigService],
      },
      {
        name: 'CHAT_CLIENT_GRPC',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<GrpcOptions> => {
        return {
            transport: Transport.GRPC,
            options: {
            loader: {
                longs: String,
                enums: String,
                json: true,
                defaults: true,
            },
            package: configService.get<string>('CHAT_GRPC_PACKAGE_NAME') || '',
            protoPath: [join(__dirname, '../../../proto/chat.proto')],
            url: configService.get<string>('CHAT_GRPC_URL') || '',
            },
        };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    GrpcService, 
    StoryGrpcService,
    ChatGrpcService,
  ],
  exports: [
    GrpcService, 
    StoryGrpcService,
    ChatGrpcService,
  ],
})
export class GrpcModule {}
