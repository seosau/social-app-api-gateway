import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { SearchService } from '../services/elasticsearch.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        node: 'http://localhost:9200',
        maxRetries: 5,
        requestTimeout: 5000,
        pingTimeout: 5000,
    sniffOnStart: false,
    sniffInterval: false,
    sniffOnConnectionFault: false,
        // auth: {
        //   username: config.get<string>("ELASTICSEARCH_USERNAME") || 'defaultUsername',
        //   password: config.get<string>("ELASTICSEARCH_PASSWORD") || 'defaultPassword',
        //   apiKey: config.get<string>("ELASTICSEARCH_APIKEY") || '',
        // },
        tls: {
          rejectUnauthorized: true,
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [SearchService],
  exports: [ElasticsearchModule, SearchService],
})
export class MetricsModule {}