import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        node: config.get<string>("METRICS_HOST"),
        tls: {
          rejectUnauthorized: false,
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class MetricsModule {}