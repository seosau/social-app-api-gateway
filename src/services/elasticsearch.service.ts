// src/services/elasticsearch.service.ts
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Post } from 'src/modules/post/entities/post.entity';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  // async indexDocument(index: string, document: any) {
  async indexDocument(post: Post) {
    // console.log('indexdocument========================================')
    try { 
      return this.elasticsearchService.index({
        index: 'posts',
        id: post.id,
            document: {
              access: post.access,
              content: post.content,
              userId: post.user.id,
              createdAt: post.createdAt
            }
      });
    }
    catch(err) {
      console.error('Loi khi luu elastic: ', err);
    }
  }

  async search(index: string, query: any) {
    return this.elasticsearchService.search({
      index,
      body: {
        query,
      },
    });
  }

  // ...thêm logic nghiệp vụ khác
}
