import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    // entities: [__dirname + '/../../**/*.entity.{ts,js}'],
    entities: [__dirname + '/../**/*.entity.js'],
    synchronize: true,
    // synchronize: configService.get('NODE_ENV') === 'development',
    autoLoadEntities: true,
    ssl: {
      rejectUnauthorized: false,
    }    
  }),
};
