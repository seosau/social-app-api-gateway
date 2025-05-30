import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { envSchema } from './config/envValidate';
// import { DatabaseModule } from './config/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import path, { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { MetricsModule } from './metrics/metrics.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './config/database/prisma/prisma.module';
import { StoryModule } from './modules/story/story.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfig } from './config/throttler.config';
import { APP_GUARD } from '@nestjs/core';
import { RabbitMQModule } from './config/rabbitMQ/rabbitMQ.module';
import { BullModule } from '@nestjs/bullmq'
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsMiddleware } from './Monitoring/middlewares/metrics.middleware';
import { MonitoringModule } from './Monitoring/monitoring.module';
import { LoggerModule } from 'nestjs-pino';
import * as fs from 'fs';

 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync(throttlerConfig),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'upload'),
        exclude: ['/metrics']
    }),
    MetricsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL', 'redis://localhost:6379');
        const ttl = configService.get<number>('CACHE_TTL', 600000);
    
        const maxRetries = 5;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
        let store: any = null;
        let lastError = null;
    
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // store = await redisStore({
            //   url: redisUrl,
            //   ttl,
            //   connectTimeout: 10000,
            //   maxRetriesPerRequest: null,
            // });
            store = await redisStore({
              socket: {
                host: configService.get('REDIS_HOST'),
                port: configService.get<number>('REDIS_PORT'),
                tls: true, // <- Quan trọng: Dùng TLS
              },
              username: configService.get('REDIS_USERNAME'),
              password: configService.get('REDIS_PASSWORD'),
              ttl: configService.get<number>('CACHE_TTL', 600), // seconds
              maxRetriesPerRequest: 1000000
            });
            break; // success
          } catch (err) {
            lastError = err;
            console.warn(`⚠️ Redis connection attempt ${attempt} failed. Retrying in 2s...`);
            await delay(2000);
          }
        }
    
        if (!store) {
          console.error('❌ Failed to connect to Redis after multiple attempts:', lastError);
          throw lastError;
        }
    
        return {
          store,
          ttl,
        };
      },
    }),    
    JwtModule.registerAsync({
      global: true,
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    // BullModule.forRoot({
    //   connection: {
    //     host: 'redis',
    //     port: 6379
    //   }
    // }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        const url = new URL(redisUrl);
    
        return {
          connection: {
            host: config.get<string>('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
            password: config.get<string>('REDIS_PASSWORD'),
            username: config.get<string>('REDIS_USERNAME'),
            tls: {},
            maxRetriesPerRequest: 1000000,
          }
        }
      }
    }),
    // DatabaseModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV === 'production' ? undefined : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
        stream: fs.createWriteStream(join(__dirname, '..', 'logs', 'app.log'), { flags: 'a' }),
        serializers: {
          req(req) {
            return {
              method: req.method,
              url: req.url,
              id: req.id
            }
          },
          res(res) {
            return {StatusCode: res.statusCode}
          }
        }
      },
    }),
    PrometheusModule.register(),
    PrismaModule,
    AuthModule,
    UserModule,
    PostModule,
    StoryModule,
    RabbitMQModule,
    MonitoringModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    MetricsMiddleware
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*')
  }
}
