//Danh index cho tat ca cac bai post trong database
//Chay lenh: npx ts-node src/scripts/reindex.ts
//Hoac chay tren docker: docker exec -it intern-project_backend_1 npx ts-node src/scripts/reindex.ts



import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PostService } from '../modules/post/post.service';
import { PostRepository } from '../modules/post/post.repository';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const postRepository = app.get(PostRepository);
  const postService = app.get(PostService);

  const posts = await postRepository.findAllWithRelations(); // lấy tất cả post có user
  let count = 0;

  for (const post of posts) {
    await postService.indexPost(post);
    count++;
  }

  console.log(`Đã reindex ${count} bài viết vào Elasticsearch.`);
  await app.close();
}
bootstrap();
