import { Injectable } from "@nestjs/common";
import { SearchService } from "../../services/elasticsearch.service";

@Injectable()
export class PostSearchService extends SearchService {
    createQueryBuilder(keyword: string, userId: string = "") {
        const mustQuery: any[] = [
          {
            multi_match: {
              query: keyword,
              fields: ['content', 'access'],
            },
          },
        ];
      
        if (userId) {
          mustQuery.push({
            term: {
              "userId.keyword": userId,
            },
          });
        }
      
        const query = {
          bool: {
            must: mustQuery,
          },
        };
      
        return { query };
      }

}