import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Global()
@Module({
    // imports:[
    //     ConfigModule.forRoot({
    //         isGlobal: true,
    //     }),
    // ],
    providers:[
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: async(config: ConfigService) => new Redis({
                host: config.get<string>('REDIS_HOST'),
                port: config.get<number>('REDIS_PORT'),
                password: config.get<string>('REDIS_PASSWORD'),
                username: config.get<string>('REDIS_USERNAME'),
                tls: {},
            })
        }
    ],
    exports:['REDIS_CLIENT']
})

export class RedisModule{}