import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { envSchema } from './config/envValidate';
// import { DatabaseModule } from './config/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'upload'),
    }),
    // MetricsModule,
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
            store = await redisStore({
              url: redisUrl,
              ttl,
              connectTimeout: 10000,
              maxRetriesPerRequest: 3,
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
    // DatabaseModule,
    AuthModule,
    UserModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
