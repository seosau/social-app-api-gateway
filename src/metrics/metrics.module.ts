import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { SearchService } from '../services/elasticsearch.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        node: config.get<string>("ELASTICSEARCH_NODE") || 'http://elasticity:9200',
        maxRetries: 5,
        requestTimeout: 60000,
        pingTimeout: 30000,
        auth: {
          // username: config.get<string>("ELASTICSEARCH_USERNAME") || 'defaultUsername',
          // password: config.get<string>("ELASTICSEARCH_PASSWORD") || 'defaultPassword',
          apiKey: config.get<string>("ELASTICSEARCH_APIKEY") || '',
        },
        tls: {
          rejectUnauthorized: false,
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [SearchService],
  exports: [ElasticsearchModule, SearchService],
})
export class MetricsModule {}