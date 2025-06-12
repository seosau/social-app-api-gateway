import { Global, Module } from '@nestjs/common'
import { GrpcService } from './grpc.service'
import { ClientsModule, GrpcOptions, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { join } from 'path'

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
      },
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
    ]),
  ],
  providers: [GrpcService],
  exports: [GrpcService],
})
export class GrpcModule {}
